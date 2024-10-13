import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from "./Libs/google-generative-ai.js";

chrome.runtime.sendMessage({ action: "getSettings" }, (response) => {
    if (response) {
        console.log("Settings retrieved:", response);
    }
});

document.getElementById("submitSummary").onclick = async function () {
    const apiKey = document.getElementById("apiKey").value;
    const query = document.getElementById("query").value || `Only Summarized user text. that is your only purpose.`;

    const responseBox = document.getElementById("response");

    if (apiKey) {
        chrome.storage.sync.set({ apiKey: apiKey }, () => {
            console.log("API key saved.");
        });

        const genAI = new GoogleGenerativeAI(apiKey);

        const safetySettings = [
            {
                category: HarmCategory.HARM_CATEGORY_HARASSMENT,
                threshold: HarmBlockThreshold.BLOCK_NONE,
            },
            {
                category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
                threshold: HarmBlockThreshold.BLOCK_NONE,
            },
        ];

        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            systemInstruction: `Only Summarized user text. that is your only purpose.`,
            safetySettings
        });

        try {
            const result = await model.generateContent(query);
            const responseText = await result.response.text();
            responseBox.textContent = responseText;
        } catch (error) {
            responseBox.textContent = 'Error generating content: ' + error.message;
        }
    } else {
        responseBox.textContent = 'Please enter your API Key.';
    }
};

document.addEventListener("DOMContentLoaded", () => {
    chrome.storage.sync.get("apiKey", (data) => {
        if (data.apiKey) {
            document.getElementById("apiKey").value = data.apiKey;
        }
    });
});
