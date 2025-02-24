// content.js

let openAiKey = ""; // Store OpenAI key

// Fetch API key from storage
chrome.storage.sync.get(['OPENAI_KEY'], (result) => {
  openAiKey = result.OPENAI_KEY || "";
});

document.addEventListener('focus', event => {
  if (event.target.matches('textarea, input[type="text"], [contenteditable="true"]')) {
    attachAutocomplete(event.target);
  }
}, true);

function attachAutocomplete(field) {
  field.addEventListener('input', async function (event) {
    const text = field.isContentEditable ? field.innerText : field.value;
    if (!text.trim()) return;

    const suggestion = await fetchSuggestion(text);
    if (suggestion) {
      showSuggestion(field, suggestion);
    }
  });

  field.addEventListener('keydown', function(event) {
    if (event.key === 'Tab') {
      event.preventDefault();
      acceptSuggestion(field);
    }
  });
}

async function fetchSuggestion(inputText) {
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
        max_tokens: 50
      }),
    });

    const data = await response.json();
    return data.choices && data.choices[0].text ? data.choices[0].text.trim() : null;
  } catch (error) {
    console.error('Error fetching suggestion:', error);
    return null;
  }
}

function showSuggestion(field, suggestion) {
  let suggestionElement = field.nextElementSibling;
  if (!suggestionElement || !suggestionElement.classList.contains('autocomplete-suggestion')) {
    suggestionElement = document.createElement('span');
    suggestionElement.className = 'autocomplete-suggestion';
    suggestionElement.style.position = 'absolute';
    suggestionElement.style.color = '#ccc';

    field.parentNode.insertBefore(suggestionElement, field.nextSibling);
    positionSuggestion(field, suggestionElement);
  }
  suggestionElement.textContent = suggestion;
}

function acceptSuggestion(field) {
  const suggestionElement = field.nextElementSibling;
  if (suggestionElement && suggestionElement.classList.contains('autocomplete-suggestion')) {
    if (field.isContentEditable) {
      field.innerText += suggestionElement.textContent;
    } else {
      field.value += suggestionElement.textContent;
    }
    suggestionElement.remove();
  }
}

function positionSuggestion(field, suggestionElement) {
  const rect = field.getBoundingClientRect();
  suggestionElement.style.top = `${rect.bottom + window.scrollY}px`;
  suggestionElement.style.left = `${rect.left + window.scrollX}px`;
}