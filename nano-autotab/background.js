let session = null; 

//checking if our gemini nano model is readily
async function initDefaults(){
    try{
        console.log(chrome);
        const defaults = await chrome.aiOriginTrial.languageModel.capabilities();
        console.log("Model defaults: ", defaults);
        if (defaults.available !== 'readily'){
            console.error(`Model not yet available (current state: "${defaults.available}")`);
            return null;
        }
        return defaults;
    } catch (error) {
        console.error("Failed to initialize model: ", error);
        return null;
    }
}

//creating an AI session!
async function createAISession() {
    try {
        const params = { 
            systemPrompt: `
            You are a text completion engine.
            Your primary role is to craft seamless, one-sentence extensions that naturally follow user inputs in English.
            
            **Guidelines:**
            
            1. Mirror the user's writing style, tone, and formality.
            2. Develop concise responses that flow naturally and maintain correct spacing.
            3. Ensure responses are grammatically correct and easily understood.
            4. Avoid redundancy and do not repeat words from the user's input unless necessary for context.
            5. Create direct continuations without additional commentary or explanations.
            6. Produce completions without engaging in conversational interactions with the user.
            7. Enhance the user's input with contextually appropriate completions.
            8. Maintain engagement by delivering informative yet succinct extensions.
            9. Avoid including personal or specific names unless explicitly provided by the user.
            10. Ensure that spaces are appropriately placed between words for readability.
            11. Do not include unnecessary symbols like quotation marks, unless they are part of standard punctuation.

            **Examples**:
            User's input: "I love to read books about"
            Your response should be: history and science fiction.
            
            User's input: "The weather today is "
            Your response should be: sunny and warm, perfect for a picnic.
            
            User's input: "My nam"
            Your response should be: e is
            
            In no case should you assume or suggest explicit personal information or specific names.
            `
        }
        if (!session) { // If no session exists, start one
            const defaults = await initDefaults();
            if (defaults) {
                session = await chrome.aiOriginTrial.languageModel.create(params);   
                console.log("Session created successfully.");         
            }
        }
        return session;
    } catch (error) {
        console.error("Error creating AI session: ", error);
    }
}

//sends prompt to llm for autocompletion task
async function sendPrompt(text){
    const currentSession = await createAISession();
    if (!currentSession){
        console.error("Failed to initialize session");
    }
    const result = await currentSession.prompt(text);
    console.log("Completion result: ");
    return result;
}

//receives messages from the autocomplete script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("Received message: ", message);
    if (message.type === 'GET_COMPLETION'){
        sendPrompt(message.text)
            .then(completion => sendResponse({completion}))
            .catch(error => sendResponse({error: error.message}));
        return true;
    }
})

//creates a new AI session 
createAISession().then(() => console.log("AI session complete"));