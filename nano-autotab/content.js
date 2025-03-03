/*document.addEventListener('keydown', (event) => {
  if (event.key === 'Tab') {
    const activeElement = document.activeElement;
    if (activeElement && (activeElement.tagName.toLowerCase() === 'textarea' || activeElement.isContentEditable)) {
      event.preventDefault();

      const textBeforeCursor = getTextBeforeCursor(activeElement);
      console.log("Text before cursor:", textBeforeCursor);

      chrome.runtime.sendMessage({ type: "getCompletion", text: textBeforeCursor }, (response) => {
        if (chrome.runtime.lastError) {
          console.error("Runtime error:", chrome.runtime.lastError.message);
          return;
        }

        // Ensure response and completion are valid
        if (response && response.completion !== undefined) {
          console.log("Received completion:", response.completion);
          insertCompletion(activeElement, textBeforeCursor, response.completion);
        } else {
          console.log("No completion received or invalid response.");
        }
      });
    } else {
      console.log("No valid active element for completion.");
    }
  }
});


function getTextBeforeCursor(element) {
  if (element.selectionStart !== null) {
    // Capture more context by getting text from the current paragraph or line
    // This assumes line breaks or sentence boundaries are known
    const fullText = element.value.substring(0, element.selectionStart);
    const lastSentenceIndex = fullText.lastIndexOf('. ') + 1;

    // Use either the full text or trim up to the last sentence
    return fullText.slice(lastSentenceIndex).trim();
  }
  return '';
}

function insertCompletion(element, currentText, completion) {
  if (!element || !completion) return;

  const cursorPosition = element.selectionStart;

  // Check start of the completion against current input
  const newCompletion = completion.startsWith(currentText) 
    ? completion.slice(currentText.length) 
    : completion;

  console.log(`Current text: "${currentText}", New Completion: "${newCompletion}"`);

  // Concatenate the new completion
  const newText = currentText + newCompletion + element.value.slice(cursorPosition);
  element.value = newText;

  // Move cursor to end of completion
  element.setSelectionRange(cursorPosition + newCompletion.length, cursorPosition + newCompletion.length);
}
*/
/*
document.addEventListener('input', handleInput); // For dynamic updates
document.addEventListener('keydown', handleKeydown); // For Tab completion

function handleInput(event) {
  if (event.target.tagName.toLowerCase() === 'textarea' || event.target.isContentEditable) {
    const activeElement = event.target;
    const textBeforeCursor = getTextBeforeCursor(activeElement);

    chrome.runtime.sendMessage({ type: "getCompletion", text: textBeforeCursor }, (response) => {
      if (chrome.runtime.lastError) {
        console.error("Runtime error:", chrome.runtime.lastError.message);
        return;
      }

      if (response && response.completion) {
        showSuggestionOverlay(activeElement, textBeforeCursor, response.completion);
      }
    });
  }
}

function handleKeydown(event) {
  if (event.key === 'Tab') {
    const activeElement = document.activeElement;
    if (activeElement && (activeElement.tagName.toLowerCase() === 'textarea' || activeElement.isContentEditable)) {
      event.preventDefault();
      
      const completion = document.querySelector('.autocomplete-suggestion');
      if (completion) {
        const completionText = completion.textContent;
        insertCompletion(activeElement, getTextBeforeCursor(activeElement), completionText);
        removeSuggestionOverlay();
      }
    }
  }
}

function getTextBeforeCursor(element) {
  if (element.selectionStart !== null) {
    return element.value.substring(0, element.selectionStart);
  }
  return '';
}

function insertCompletion(element, currentText, completion) {
  if (!element || !completion) return;

  const cursorPosition = element.selectionStart;
  const newCompletion = completion.startsWith(currentText) 
    ? completion.slice(currentText.length) 
    : completion;

  const newText = currentText + newCompletion + element.value.slice(cursorPosition);
  element.value = newText;
  element.setSelectionRange(cursorPosition + newCompletion.length, cursorPosition + newCompletion.length);
}

function showSuggestionOverlay(element, currentText, completion) {
  const newCompletion = completion.startsWith(currentText) 
    ? completion.slice(currentText.length) 
    : completion;

  let suggestionElement = document.querySelector('.autocomplete-suggestion');
  if (!suggestionElement) {
    suggestionElement = document.createElement('span');
    suggestionElement.className = 'autocomplete-suggestion';
    suggestionElement.style.position = 'absolute';
    suggestionElement.style.color = 'grey';
    suggestionElement.style.opacity = '0.5';
    suggestionElement.style.pointerEvents = 'none';
    document.body.appendChild(suggestionElement);
  }
  
  suggestionElement.textContent = newCompletion;

  const rect = element.getBoundingClientRect();
  suggestionElement.style.left = `${rect.left + window.scrollX}px`;
  suggestionElement.style.top = `${rect.top + window.scrollY - element.scrollTop + element.clientTop}px`;
  suggestionElement.style.fontSize = window.getComputedStyle(element).fontSize;
  suggestionElement.style.fontFamily = window.getComputedStyle(element).fontFamily;
}

function removeSuggestionOverlay() {
  const suggestionElement = document.querySelector('.autocomplete-suggestion');
  if (suggestionElement) {
    suggestionElement.remove();
  }
}*/

document.addEventListener('input', handleInput); // Listen for text input changes
document.addEventListener('keydown', handleKeydown); // Handle Tab key for completion acceptance

function handleInput(event) {
  const activeElement = event.target;
  if (activeElement && (activeElement.tagName.toLowerCase() === 'textarea' || activeElement.isContentEditable)) {
    const textBeforeCursor = getTextBeforeCursor(activeElement);

    chrome.runtime.sendMessage({ type: "getCompletion", text: textBeforeCursor }, (response) => {
      if (chrome.runtime.lastError) {
        console.error("Runtime error:", chrome.runtime.lastError.message);
        return;
      }

      if (response && response.completion) {
        showSuggestionOverlay(activeElement, textBeforeCursor, response.completion);
      }
    });
  }
}

function handleKeydown(event) {
  if (event.key === 'Tab') {
    const activeElement = document.activeElement;
    if (activeElement && (activeElement.tagName.toLowerCase() === 'textarea' || activeElement.isContentEditable)) {
      event.preventDefault();
      
      const suggestionElement = document.querySelector('.autocomplete-suggestion');
      if (suggestionElement) {
        const completionText = suggestionElement.textContent;
        insertCompletion(activeElement, getTextBeforeCursor(activeElement), completionText);
        removeSuggestionOverlay();
      }
    }
  }
}

function getTextBeforeCursor(element) {
  if (element.selectionStart !== null) {
    return element.value.substring(0, element.selectionStart);
  }
  return '';
}

function insertCompletion(element, currentText, completion) {
  if (!element || !completion) return;

  const cursorPosition = element.selectionStart;
  const newCompletion = completion.startsWith(currentText) 
    ? completion.slice(currentText.length) 
    : completion;

  const newText = currentText + newCompletion + element.value.slice(cursorPosition);
  element.value = newText;
  element.setSelectionRange(cursorPosition + newCompletion.length, cursorPosition + newCompletion.length);
}

function showSuggestionOverlay(element, currentText, completion) {
  const newCompletion = completion.startsWith(currentText) 
    ? completion.slice(currentText.length) 
    : completion;

  let suggestionElement = document.querySelector('.autocomplete-suggestion');
  if (!suggestionElement) {
    suggestionElement = document.createElement('span');
    suggestionElement.className = 'autocomplete-suggestion';
    suggestionElement.style.position = 'absolute';
    suggestionElement.style.color = 'grey';
    suggestionElement.style.opacity = '0.5';
    suggestionElement.style.pointerEvents = 'none';
    document.body.appendChild(suggestionElement);
  }
  
  suggestionElement.textContent = newCompletion;

  positionSuggestionOverlay(element, suggestionElement);
}

function positionSuggestionOverlay(textArea, suggestionElement) {
  const { left, top } = textArea.getBoundingClientRect();
  suggestionElement.style.left = `${left + textArea.scrollLeft}px`;
  suggestionElement.style.top = `${top + textArea.scrollTop + parseInt(window.getComputedStyle(textArea).fontSize)}px`;
  suggestionElement.style.fontSize = window.getComputedStyle(textArea).fontSize;
  suggestionElement.style.fontFamily = window.getComputedStyle(textArea).fontFamily;
  suggestionElement.style.width = textArea.style.width;
}

function removeSuggestionOverlay() {
  const suggestionElement = document.querySelector('.autocomplete-suggestion');
  if (suggestionElement) {
    suggestionElement.remove();
  }
}