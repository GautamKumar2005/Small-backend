const textToSummarize = "Node.js is an open-source, cross-platform JavaScript runtime environment. It executes JavaScript code outside of a web browser. Node.js lets developers use JavaScript to write command line tools and for server-side scripting. This means running scripts server-side to produce dynamic web page content before the page is sent to the user.";

async function runTest() {
    try {
        console.log("Sending request to AI server...");
        
        const response = await fetch('http://localhost:3000/summarize', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ text: textToSummarize })
        });
        
        const data = await response.json();
        
        console.log("\n--- AI Response ---");
        console.log(JSON.stringify(data, null, 2));
        
    } catch (error) {
        console.error("Failed to connect to the server. Is it running?", error.message);
    }
}

runTest();
