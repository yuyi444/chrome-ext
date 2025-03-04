// ----------------------
// Styling for autocomplete suggestion
// ----------------------
const style = document.createElement('style'); 
style.textContent = `
.autocomplete-overlay {
    position: absolute;
    pointer-events: none;
    color: rgb(145, 144, 144);
    background: transparent;
    font-family: 'Courier New', Courier, monospace;
    font-size: inherit;
    line-height: inherit;
    padding: inherit;
    border: none;
    overflow: hidden;
    white-space: pre-wrap;
    word-wrap: break-word;
    z-index: 10000;
}
.autocomplete-overlay .remaining-text {
    color: #111;
}
`;
document.head.appendChild(style);

// ----------------------
// Global Variables
// ----------------------
let suggestionOverlay = null;
let currentInputField = null;

// ----------------------
// Utility Functions
// ----------------------

// Check if an element is a valid text input
const isInputField = (element) => {
    if (!element) return false;
    
    // Basic checks for textarea and input fields
    if (element.nodeName === 'TEXTAREA') return true;
    if (element.nodeName === 'INPUT' &&
        (element.type === 'text' || element.type === 'search' || !element.hasAttribute('type'))) return true;

    // Check for contenteditable attributes including custom logic for ql-editor
    if (element.getAttribute?.('contenteditable') === 'true') {
        if (element.classList?.contains('ql-editor')) {
            return true;
        }
        return true;
    }
    
    return false;
};

// Get the current text content from various input types
const getInputText = (element) => {
    if (element.nodeName === 'TEXTAREA' || element.nodeName === 'INPUT') {
        return element.value;
    } else if (element.getAttribute && element.getAttribute('contenteditable') === 'true') {
        return element.textContent;
    }
    return '';
};

// Set text for various input types and dispatch an input event if needed
const setInputText = (element, text) => {
    if (element.nodeName === 'TEXTAREA' || element.nodeName === 'INPUT') {
        element.value = text;
    } else if (element.getAttribute('contenteditable') === 'true') {
        element.textContent = text;
        const inputEvent = new Event('input', { bubbles: true, cancelable: true });
        element.dispatchEvent(inputEvent);
    }
};

// Get the cursor position
const getCursorPos = (element) => {
    if (element.selectionStart !== null) {
        return element.selectionStart;
    } else if (element.getAttribute && element.getAttribute('contenteditable') === 'true') {
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
            const selectionRange = selection.getRangeAt(0);
            if (element.contains(selectionRange.startContainer)) {
                return selectionRange.startOffset;
            }
        }
    }
    return 0;
};

// Return the text before the cursor position
const getTextPreCursor = (element) => {
    const text = getInputText(element);
    const cursorPos = getCursorPos(element);
    return text.substring(0, cursorPos);
};

// Return the text after the cursor position
const getTextPostCursor = (element) => {
    const text = getInputText(element);
    const cursorPos = getCursorPos(element);
    return text.substring(cursorPos);
};

// ----------------------
// Overlay Management
// ----------------------

// Create the overlay element for showing suggestions
const createOverlay = () => { 
    const overlay = document.createElement('div');
    overlay.className = 'autocomplete-overlay';  
    document.body.appendChild(overlay);
    return overlay;
};

// Update overlay's styling and position based on the current input field
const updateOverlay = () => {
    if (!currentInputField || !suggestionOverlay) return;
    const computedStyle = window.getComputedStyle(currentInputField);

    suggestionOverlay.style.font = computedStyle.font;
    suggestionOverlay.style.fontSize = computedStyle.fontSize;
    suggestionOverlay.style.fontFamily = computedStyle.fontFamily;
    suggestionOverlay.style.lineHeight = computedStyle.lineHeight;
    suggestionOverlay.style.whiteSpace = computedStyle.whiteSpace;
    
    suggestionOverlay.style.width = `${currentInputField.offsetWidth}px`;
    suggestionOverlay.style.height = `${currentInputField.offsetHeight}px`;
    suggestionOverlay.style.padding = computedStyle.padding;
    
    const rect = currentInputField.getBoundingClientRect();
    suggestionOverlay.style.top = `${rect.top + window.scrollY}px`;
    suggestionOverlay.style.left = `${rect.left + window.scrollX}px`;
};

// ----------------------
// Autocomplete Logic
// ----------------------

// Insert the autocomplete suggestion into the input field
const insertCompletion = (element, currentText, completion) => {
    if (!element || !completion) return;
    const cursorPosition = getCursorPos(element);
    const newCompletion = completion.startsWith(currentText) 
        ? completion.slice(currentText.length) 
        : completion;
    const currentTextValue = getInputText(element);
    const newText = currentText + newCompletion + currentTextValue.slice(cursorPosition);
    setInputText(element, newText);
    if (element.setSelectionRange) {
        element.setSelectionRange(cursorPosition + newCompletion.length, cursorPosition + newCompletion.length);
    }
};

// Highlight the suggestion by splitting overlay content into spans
const highlightSuggestion = (startPos, length) => {
    if (!suggestionOverlay || !suggestionOverlay.textContent) return;
    const fullText = suggestionOverlay.textContent;
    const textBefore = fullText.substring(0, startPos);
    const suggestion = fullText.substring(startPos, startPos + length);
    const textAfter = fullText.substring(startPos + length);

    suggestionOverlay.innerHTML = '';

    const beforeSpan = document.createElement('span');
    beforeSpan.textContent = textBefore;

    const suggestionSpan = document.createElement('span');
    suggestionSpan.className = 'suggestion-highlight';
    suggestionSpan.textContent = suggestion;

    const afterSpan = document.createElement('span');
    afterSpan.className = 'after-text';
    afterSpan.textContent = textAfter;

    suggestionOverlay.appendChild(beforeSpan);
    suggestionOverlay.appendChild(suggestionSpan);
    suggestionOverlay.appendChild(afterSpan);
};

// Communicate with the background script to get the completion
const autocomplete = async (event) => {
    if (!currentInputField || !suggestionOverlay) {
        return;
    }

    const textPreCursor = getTextPreCursor(currentInputField);  
    const textPostCursor = getTextPostCursor(currentInputField); 
    
    console.log("Current text: ", textPreCursor + textPostCursor);

    if (!textPreCursor || textPreCursor.trim() === '') {
        suggestionOverlay.textContent = '';
        return;
    }

    try {
        console.log("sending request to bg script...");
        const response = await chrome.runtime.sendMessage({
            type: 'GET_COMPLETION',
            text: textPreCursor
        });

        console.log("received response:", response);

        if (!response || response.error) {
            console.error("Error getting completion: ", response?.error || "No response");
            suggestionOverlay.textContent = '';
            return;
        }

        let suggestionText = response.completion;
        if (suggestionText) {

            // ✅ Only display the new suggested text that comes after the cursor
            suggestionOverlay.textContent = suggestionText;
            
            console.log("Autocomplete suggestion: ", suggestionText);
        } else {
            console.error("No completion received in response");
            suggestionOverlay.textContent = '';
        }
    } catch (error) {
        console.log("Error getting autocomplete suggestion: ", error);
        suggestionOverlay.textContent = '';
    }
};





// ----------------------
// Event Handlers & Debouncing
// ----------------------

// Debounce function to limit autocomplete calls while typing
const debounce = (callback, wait) => {
    let timeoutID = null;
    const debounced = (...args) => {
        window.clearTimeout(timeoutID);
        timeoutID = window.setTimeout(() => {
            callback(...args);
        }, wait);
    };
    debounced.cancel = () => {
        window.clearTimeout(timeoutID);
        timeoutID = null;
    };
    return debounced;
};
const handleStopType = debounce(autocomplete, 3000);

// Accept suggestion on Tab press
const handleKeydown = (event) => {
    if (!suggestionOverlay || suggestionOverlay.textContent === '') return;
    if (event.key === 'Tab') {
        event.preventDefault();
        insertCompletion(currentInputField, getTextPreCursor(currentInputField), suggestionOverlay.textContent);
        suggestionOverlay.textContent = '';
    }
};

// Clear overlay and cancel pending debounce on blur
const handleBlur = (event) => {
    if (suggestionOverlay) {
        suggestionOverlay.remove();
        suggestionOverlay = null;
        currentInputField = null;
    }
    handleStopType.cancel();
};

// Set up overlay when input gains focus
const handleFocus = (event) => {
    const textInput = event.target;
    if (!isInputField(textInput)) return;
    if (suggestionOverlay) {
        suggestionOverlay.remove();
        suggestionOverlay = null;
    }
    suggestionOverlay = createOverlay();
    currentInputField = textInput;
    updateOverlay();
};

// ----------------------
// Mutation & Global Event Listeners
// ----------------------

const setupTextInput = (textInput) => {
    if (!isInputField(textInput)) return;
    textInput.addEventListener('input', handleStopType);
    textInput.addEventListener('keydown', handleKeydown);
    textInput.addEventListener('blur', handleBlur);
    textInput.addEventListener('focus', handleFocus);
};

const cleanupTextInput = (textInput) => {
    if (!isInputField(textInput)) return;
    if (textInput === currentInputField) {
        cleanupOverlay();
    }
    textInput.removeEventListener('input', handleStopType);
    textInput.removeEventListener('keydown', handleKeydown);
    textInput.removeEventListener('blur', handleBlur);
    textInput.removeEventListener('focus', handleFocus);
};

const cleanupOverlay = () => {
    if (suggestionOverlay) {
        suggestionOverlay.remove();
        suggestionOverlay = null;
        currentInputField = null;
    }
};

const mutationObserver = new MutationObserver((mutations) => {
    mutations.forEach(mutation => {
        mutation.removedNodes.forEach((node) => {
            if (isInputField(node)) { 
                cleanupTextInput(node);  
            } else if (node.querySelectorAll) {
                node.querySelectorAll('textarea, input[type="text"], input[type="search"], [contenteditable="true"]').forEach(cleanupTextInput);
            }
        });
        mutation.addedNodes.forEach((node) => {
            if (isInputField(node)) { 
                setupTextInput(node);   
            } else if (node.querySelectorAll) { 
                node.querySelectorAll('textarea, input[type="text"], input[type="search"], [contenteditable="true"]').forEach(setupTextInput);
            }
        });
    });
});
mutationObserver.observe(document.body, { childList: true, subtree: true });

document.querySelectorAll('textarea, input[type="text"], input[type="search"], [contenteditable="true"]').forEach(setupTextInput);

window.addEventListener('scroll', updateOverlay);
window.addEventListener('resize', updateOverlay);
if (window.visualViewport) {
    window.visualViewport.addEventListener('scroll', updateOverlay);
}