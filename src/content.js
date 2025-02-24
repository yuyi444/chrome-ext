import * as InboxSDK from "@inboxsdk/core";

// Load InboxSDK for Gmail integration (optional, can be removed if not needed)
InboxSDK.load(2, "sdk_OpenAI_a19ee5a9fd").then(() => {
  initGlobalEnhancer();
});

// Use environment variable for OpenAI API key
const API_KEY = process.env.OPENAI_KEY;

function initGlobalEnhancer() {
  document.addEventListener("focusin", (event) => {
    const target = event.target;

    if (
      target.tagName === "TEXTAREA" ||
      target.tagName === "INPUT" ||
      target.isContentEditable
    ) {
      addEnhanceButton(target);
    }
  });
}

function addEnhanceButton(inputField) {
  if (inputField.nextSibling?.classList?.contains("ai-enhance-btn")) return;

  const button = document.createElement("button");
  button.innerText = "✨ Enhance";
  button.classList.add("ai-enhance-btn");
  button.style.position = "absolute";
  button.style.marginLeft = "5px";
  button.style.padding = "5px";
  button.style.background = "#007bff";
  button.style.color = "#fff";
  button.style.border = "none";
  button.style.borderRadius = "5px";
  button.style.cursor = "pointer";
  button.style.fontSize = "12px";

  button.onclick = async () => {
    button.innerText = "🔄 Enhancing...";
    button.disabled = true;
    const originalText = inputField.value || inputField.innerText;
    const improvedText = await generateText(originalText);
    if (inputField.tagName === "TEXTAREA" || inputField.tagName === "INPUT") {
      inputField.value = improvedText;
    } else {
      inputField.innerText = improvedText;
    }
    button.innerText = "✨ Enhance";
    button.disabled = false;
  };

  inputField.parentNode.insertBefore(button, inputField.nextSibling);
}

async function generateText(inputText) {
  try {
    const response = await fetch("https://api.openai.com/v1/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`, // Uses the environment variable
      },
      body: JSON.stringify({
        model: "text-davinci-003",
        prompt: `Improve the following text:\n${inputText}`,
        temperature: 0.7,
        max_tokens: 500,
        top_p: 1.0,
        frequency_penalty: 0.0,
        presence_penalty: 0.0,
      }),
    });

    const data = await response.json();
    return data.choices?.[0]?.text?.trim() || "No suggestions";
  } catch (error) {
    console.error("Error generating text:", error);
    return inputText;
  }
}

