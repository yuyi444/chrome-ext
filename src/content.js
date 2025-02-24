// content.js

let openAiKey = ""; // To store the OpenAI key safely

// Fetch the OpenAI key (You would typically load this once)
chrome.storage.sync.get(['OPENAI_KEY'], (result) => {
  openAiKey = result.OPENAI_KEY;
});

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('textarea, input[type="text"]').forEach((field) => {
    field.addEventListener('input', handleInput);
    field.addEventListener('keydown', handleKeydown);
  });
});

async function handleInput(event) {
  const text = event.target.value;
  if (!text.trim()) return;

  const suggestion = await getSuggestedText(text);
  // Display suggestion inline by showing a ghost text or similar UI

  // Create a ghost text element if needed
  const ghostElement = document.createElement('span');
  ghostElement.style.position = 'absolute';
  ghostElement.style.opacity = 0.5;
  ghostElement.style.pointerEvents = 'none';
  ghostElement.style.font = 'inherit';
  ghostElement.innerText = suggestion;
  ghostElement.className = 'ghost-text';

  // Make sure positioning matches the field correctly (pseudo-style adjustments)
  // You will need a positioning library or hand-calculated adjustments
  document.body.appendChild(ghostElement);
}

function handleKeydown(event) {
  if (event.key === 'Tab') {
    event.preventDefault();
    const activeField = event.target;
    const ghostText = document.querySelector('.ghost-text');

    if (ghostText) {
      activeField.value += ghostText.innerText;
      ghostText.remove(); // Clean up after completing
    }
  }
}

async function getSuggestedText(inputText) {
  const response = await fetch('https://api.openai.com/v1/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${openAiKey}`,
    },
    body: JSON.stringify({
      model: "text-davinci-003",
      prompt: inputText,
      temperature: 0.5,
      max_tokens: 50,
    }),
  });

  const data = await response.json();
  return data.choices && data.choices[0].text ? data.choices[0].text.trim() : "";
}