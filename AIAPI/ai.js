const z = require('zod');

// Simple in-memory cache
const cache = new Map();

// Gemini 1.5 Flash Pricing per token (example)
const COST_PER_1M_INPUT_TOKENS = 0.075;
const COST_PER_1M_OUTPUT_TOKENS = 0.30;

function calculateCost(inputTokens, outputTokens) {
    const inputCost = (inputTokens / 1_000_000) * COST_PER_1M_INPUT_TOKENS;
    const outputCost = (outputTokens / 1_000_000) * COST_PER_1M_OUTPUT_TOKENS;
    return inputCost + outputCost;
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const { GoogleGenAI } = require("@google/genai");

async function fetchGemini(systemPrompt, userText, timeoutMs) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error("GEMINI_API_KEY is missing in .env");
    }

    const ai = new GoogleGenAI({ apiKey });

    // Using gemini-3.1-flash-lite as the main models are currently experiencing high 503 traffic
    const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite",
        contents: userText,
        config: {
            systemInstruction: systemPrompt,
            responseMimeType: "application/json",
        }
    });

    return response;
}

async function fetchGroq(systemPrompt, userText, timeoutMs) {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
        throw new Error("GROQ_API_KEY is missing in .env");
    }

    const url = `https://api.groq.com/openai/v1/chat/completions`;

    const payload = {
        model: "llama3-8b-8192", // Groq's fast free model
        messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userText }
        ],
        response_format: { type: "json_object" }
    };

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify(payload),
            signal: controller.signal
        });

        clearTimeout(timeout);
        return response;
    } catch (error) {
        clearTimeout(timeout);
        throw error;
    }
}

/**
 * AI API Wrapper
 * Handles retries, timeout, schema validation, and cost logging.
 */
async function generateStructuredResponse(systemPrompt, userText, schema, options = {}) {
    const { 
        provider = process.env.PROVIDER || 'gemini', 
        maxRetries = 2,
        timeoutMs = 10000 
    } = options;

    const cacheKey = `${provider}:${systemPrompt}:${userText}`;
    if (cache.has(cacheKey)) {
        console.log(`[AI Cache Hit] Returned instant response for prompt.`);
        return { data: cache.get(cacheKey), cost: 0, cached: true };
    }

    let attempt = 0;

    while (attempt <= maxRetries) {
        try {
            console.log(`[AI] Calling ${provider} API (Attempt ${attempt + 1})...`);
            let response;
            
            if (provider === 'gemini') {
                response = await fetchGemini(systemPrompt, userText, timeoutMs);
            } else if (provider === 'groq') {
                response = await fetchGroq(systemPrompt, userText, timeoutMs);
            } else {
                throw new Error(`Unsupported provider: ${provider}`);
            }

            let data;
            
            if (provider === 'groq') {
                if (!response.ok) {
                    const status = response.status;
                    const errorBody = await response.text();
                    
                    if (status === 400) {
                        throw new Error(`Bad Request (400) from ${provider}. Won't retry. Body: ${errorBody}`);
                    }
                    if (status === 429 || status >= 500) {
                        throw new Error(`Transient error (${status}) from ${provider}. Body: ${errorBody}`);
                    }
                    throw new Error(`Unexpected error (${status}) from ${provider}. Body: ${errorBody}`);
                }
                data = await response.json();
            }
            
            let textResponse;
            let inputTokens = 0;
            let outputTokens = 0;

            if (provider === 'gemini') {
                textResponse = response.text;
                inputTokens = response.usageMetadata?.promptTokenCount || 0;
                outputTokens = response.usageMetadata?.candidatesTokenCount || 0;
            } else if (provider === 'groq') {
                textResponse = data.choices?.[0]?.message?.content;
                inputTokens = data.usage?.prompt_tokens || 0;
                outputTokens = data.usage?.completion_tokens || 0;
            }

            if (!textResponse) {
                throw new Error("Malformed response format from provider");
            }

            // Parse text as JSON
            let jsonOutput;
            try {
                jsonOutput = JSON.parse(textResponse);
            } catch (err) {
                throw new Error("Provider did not return valid JSON");
            }

            // Validate against Zod schema
            const validatedData = schema.parse(jsonOutput);

            // Calculate estimated Cost
            const estimatedCost = calculateCost(inputTokens, outputTokens);
            
            console.log(`[AI Success] Tokens - Input: ${inputTokens}, Output: ${outputTokens}`);
            console.log(`[AI Success] Estimated Cost: $${estimatedCost.toFixed(6)}`);

            // Cache the successful result
            cache.set(cacheKey, validatedData);

            return { data: validatedData, cost: estimatedCost, cached: false };
            
        } catch (error) {
            console.error(`[AI Error] ${error.message}`);
            
            // Do not retry 400 errors or Zod validation errors
            if (error.name === 'ZodError' || error.message.includes('Won\'t retry')) {
                throw error; // Fail fast on malformed outputs if it's the schema's fault or bad request
            }
            
            if (error.name === 'AbortError') {
                console.error(`[AI Error] Request timed out after ${timeoutMs}ms`);
            }

            if (attempt >= maxRetries) {
                throw new Error(`AI request failed after ${maxRetries} retries: ${error.message}`);
            }

            const backoffMs = Math.pow(2, attempt) * 1000;
            console.log(`[AI] Retrying in ${backoffMs}ms...`);
            await sleep(backoffMs);
            attempt++;
        }
    }
}

module.exports = {
    generateStructuredResponse
};
