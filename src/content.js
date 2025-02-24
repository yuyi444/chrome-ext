let openAiKey = ""; // To store the OpenAI key safely

// Fetch the OpenAI key from Chrome storage
chrome.storage.sync.get(['OPENAI_KEY'], (result) => {
  openAiKey = result.OPENAI_KEY;
});

document.addEventListener('DOMContentLoaded', () => {
  // Apply handlers to every text field on page load
  document.querySelectorAll('textarea, input[type="text"]').forEach((field) => {
    field.addEventListener('input', handleInput);
    field.addEventListener('keydown', handleKeydown);
  });
});

// Address potential dynamically added fields
document.body.addEventListener('focusin', (event) => {
  const field = event.target;
  if (field.tagName === 'TEXTAREA' || field.type === 'text') {
    field.addEventListener('input', handleInput);
    field.addEventListener('keydown', handleKeydown);
  }
});

async function handleInput(event) {
  const field = event.target;
  const text = field.value;
  if (!text.trim()) return;

  const suggestion = await getSuggestedText(text);

  let ghostElement = field.nextElementSibling;
  if (!ghostElement || !ghostElement.classList.contains('ghost-text')) {
    ghostElement = document.createElement('span');
    ghostElement.className = 'ghost-text';
    ghostElement.style.position = 'absolute';
    ghostElement.style.opacity = 0.5;
    ghostElement.style.pointerEvents = 'none';
    ghostElement.style.font = window.getComputedStyle(field).font;
    ghostElement.style.color = '#ccc';

    field.parentNode.insertBefore(ghostElement, field.nextSibling);
  }

  ghostElement.innerText = suggestion;
  positionGhostText(field, ghostElement);
}

function handleKeydown(event) {
  if (event.key === 'Tab') {
    event.preventDefault();
    const field = event.target;
    const ghostText = document.querySelector('.ghost-text');

    if (ghostText) {
      field.value += ghostText.innerText;
      ghostText.remove();
    }
  }
}

async function getSuggestedText(inputText) {
  try {
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
  } catch (error) {
    console.error('Error fetching suggestion:', error);
    return ""; // Return empty on error
  }
}

function positionGhostText(field, ghostElement) {
  const rect = field.getBoundingClientRect();
  ghostElement.style.top = `${rect.top + window.scrollY}px`;
  ghostElement.style.left = `${rect.left + window.scrollX}px`;
  ghostElement.style.fontSize = window.getComputedStyle(field).fontSize;
}