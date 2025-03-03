async function createAISession() {
    try {
      const { available } = await chrome.aiOriginTrial.languageModel.capabilities();
      if (available !== 'no') {
        currentSession = await chrome.aiOriginTrial.languageModel.create({
          systemPrompt: `
            You are a text completion engine. Your task is to extend incomplete fragments of user input.
            - Focus purely on providing the next few words to seamlessly continue the user input.
            - Avoid starting new ideas or providing complete responses.
            - Complete partial sentences by predicting logical continuations.
            - Do not introduce or echo advice or pleasantries.
          `,
        });
        console.log("AI Session Created");
      } else {
        console.error("Model is not available.");
      }
    } catch (error) {
      console.error("Failed to create AI session:", error);
    }
  }
  
  createAISession();
  
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "getCompletion" && currentSession) {
      const trimmedText = request.text.trim();
  
      currentSession.prompt(trimmedText, { maxTokens: 5, temperature: 0.2 }).then(response => {
        sendResponse({ completion: filterCompletion(trimmedText, response) });
      }).catch(error => {
        console.error("Error fetching completion:", error);
        sendResponse({ completion: "" });
      });
  
      return true; // Use sendResponse asynchronously.
    }
  });
  
  function filterCompletion(input, completion) {
    const inputLength = input.length;
    if (completion.length > inputLength) {
      // Return only the completion part that adds new information
      return completion.slice(inputLength);
    }
    return "";
  }