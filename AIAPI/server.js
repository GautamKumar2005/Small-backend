require('dotenv').config();
const express = require('express');
const { z } = require('zod');
const { generateStructuredResponse } = require('./ai');

const app = express();
app.use(express.json());

// Zod Schema for summarizing text into 3 bullets
const SummarySchema = z.object({
    bullets: z.array(z.string()).length(3)
});

// Helper function to handle async route errors
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

app.post('/summarize', asyncHandler(async (req, res) => {
    const { text } = req.body;
    
    if (!text || typeof text !== 'string') {
        return res.status(400).json({ error: "Missing or invalid 'text' in request body." });
    }

    const systemPrompt = `You are a helpful summarization assistant. 
Your task is to summarize the user's text into exactly 3 bullet points.
You must return the result as a raw JSON object matching this schema: { "bullets": ["bullet 1", "bullet 2", "bullet 3"] }. 
Do not include markdown blocks like \`\`\`json. Return strictly the JSON object.`;

    try {
        const result = await generateStructuredResponse(
            systemPrompt, 
            text, 
            SummarySchema,
            { timeoutMs: 15000 } // Give the AI 15 seconds to reply
        );
        
        res.json({
            success: true,
            data: result.data,
            meta: {
                cached: result.cached,
                cost_estimate: result.cost
            }
        });
    } catch (error) {
        if (error.name === 'ZodError') {
            return res.status(502).json({ 
                error: "The AI returned an invalid response format that did not match the expected schema.", 
                details: error.errors 
            });
        }
        
        console.error("[Server Error]", error);
        res.status(500).json({ 
            error: "An internal error occurred while contacting the AI provider.",
            details: error.message,
            stack: error.stack
        });
    }
}));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
