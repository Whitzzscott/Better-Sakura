import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from "./Libs/google-generative-ai.js";

chrome.runtime.sendMessage({ action: "getSettings" }, (response) => {
    if (response) {
        console.log("Settings retrieved:", response);
    }
});

document.addEventListener("DOMContentLoaded", () => {
    chrome.storage.sync.get("apiKey", (data) => {
        if (data.apiKey) {
            createCharacter(data.apiKey);
        }
    });
});

function createCharacter(apiKey) {
    document.getElementById("createCharacterButton").onclick = async function () {
        const description = document.getElementById("characterDescription").value;
        const query = `# Generate a character using the following format: Each output must include:  
Persona, Description, Scenario, First Message, and Model Instructions. These elements must be clearly separated by two spaces and should not use markdown, except for the Persona, which will be enclosed in triple backticks. The persona must be in W++ format.

**Persona:**  
Enclose the detailed persona in triple backticks. The persona should include personality traits, appearance, likes, dislikes, skills, talents, and backstory. Ensure it follows W++ format and influences how the character interacts with the world and others.

\`\`\`
Persona: Provide a detailed persona including personality, appearance, likes, dislikes, skills, talents, and backstory. Use this persona to influence the character’s interactions with the world and others. The persona must be in W++ format.
\`\`\`

**Description:**  
Summarize the character’s role in the story (e.g., Eliza is a charismatic woman living in a fortified town encircled by high walls).

**Scenario:**  
Describe the specific setting and scenario (e.g., Eliza is currently in a bustling town surrounded by towering walls, with political intrigue brewing).

**First Message:**  
Provide the character's initial message, including internal thoughts, actions, and dialogue. Enclose thoughts and actions in asterisks, and spoken dialogue in quotes.

**Model Instructions:**  
Provide specific behavior guidelines within 50 lines, tailored to the character’s personality and story. Always use {{user}} and {{char}} for the usernames and character names. Avoid general rules, and never use "I", "You", "We", or "Their"; instead, use {{char}}. Avoid bullet points in the model instructions.

Each character must be customizable as either NSFW or SFW based on {{user}}'s request. Always follow {{user}}'s specific instructions. If a specific format is requested (e.g., enclosing instructions within quotes), adhere to that format without adding unnecessary newlines. Only the Persona should be enclosed in markdown; the other sections should remain unformatted.

If {{user}} requests changes to the model instructions or needs only instructions to be generated, adjust only the elements {{user}} specifies.

**Note:** You are generating the character, not embodying it.`;

        const geminiResponseTextArea = document.getElementById("geminiResponse");

        if (apiKey) {
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
                systemInstruction: query,
                safetySettings
            });

            try {
                const result = await model.generateContent(query);
                const responseText = await result.response.text();
                geminiResponseTextArea.value = responseText;
            } catch (error) {
                geminiResponseTextArea.value = 'Error generating content: ' + error.message;
            }
        } else {
            geminiResponseTextArea.value = 'Please enter your API Key.';
        }
    };
}

interact('#draggable')
            .draggable({
                listeners: {
                    move (event) {
                        const target = event.target
                        const x = (parseFloat(target.getAttribute('data-x')) || 0) + event.delta.x
                        const y = (parseFloat(target.getAttribute('data-y')) || 0) + event.delta.y

                        target.style.transform = `translate(${x}px, ${y}px)`
                        target.setAttribute('data-x', x)
                        target.setAttribute('data-y', y)
                    }
                }
            });
