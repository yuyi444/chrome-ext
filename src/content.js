/*import * as InboxSDK from '@inboxsdk/core';

const disabledBtn = (disabled = true) => {
  try {
    document.querySelector('.inboxsdk__modal_buttons')
      .childNodes
      .forEach((input) => {
        input.disabled = disabled
      })
  } catch (e) {

  }
}

InboxSDK.load(2, "sdk_OpenAI_a19ee5a9fd")
  .then((sdk) => {
    sdk.Compose.registerComposeViewHandler((composeView) => {
      composeView.addButton({
        title: "Write this better",
        iconUrl: 'https://image.ibb.co/mXS2ZU/images.png',
        iconClass: "cursor-pointer",
        onClick: function (event) {
          createModal(composeView, sdk.Widgets)
        },
      });

    });
  });

const generateText = async (inputText) => {
  try {
    const {
      data: {
        choices
      }
    } = await executeOpenAi({
      model: "text-davinci-003",
      prompt: "Regenerate this email in a better way:" + inputText.replaceAll('<br>', '\n'),
      temperature: 0,
      max_tokens: 500,
      top_p: 1.0,
      frequency_penalty: 0.0,
      presence_penalty: 0.0,
    })

    if (choices && choices.length) {
      return choices[0].text || "No suggestions"
    }

    return inputText.replaceAll('\n', '<br>');
  } catch (e) {
    console.log(e);
    return inputText
  }
}

const executeOpenAi = (body) => {
  return new Promise(function (resolve, reject) {
    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_KEY}`

      },
      body: JSON.stringify(body)
    };
    fetch('https://api.openai.com/v1/completions', requestOptions)
      .then(response => response.json())
      .then(data => {
        resolve({
          data
        })
      })
      .catch(err => {
        reject(err)
      });
  })
}

const createModal = (composeView, Widgets) => {
  if (!composeView.getHTMLContent().length) {
    return
  }

  const parser = new DOMParser();
  const htmlDoc = parser.parseFromString(composeView.getHTMLContent(), 'text/html');

  const gmailQoute = htmlDoc.querySelector('.gmail_quote');
  if (gmailQoute) {
    gmailQoute.remove();
  }

  const newContent = htmlDoc.querySelector('body').innerHTML

  const el = document.createElement('div');
  el.innerHTML = `<div id="open-ai-div">
    <div id="open-ai-text">Loading...</div>
  </div>`;

  generateText(newContent)
    .then(response => {
      document.getElementById("open-ai-text").innerText = response
      disabledBtn(false)
    })

  Widgets.showModalView({
    title: 'Open AI',
    el,
    chrome: true,
    buttons: [{
        text: "Accept",
        onClick: (e) => {
          const text = document.getElementById("open-ai-text").innerHTML
          if (!["Loading...", "No suggestions"].includes(text)) {
            // console.log({
            //   oldhtml: composeView.getHTMLContent()
            // });
            composeView.setBodyHTML(text);
          }
          e.modalView.close()
        },
        type: "PRIMARY_ACTION",
        title: "Accept the text"
      },
      {
        text: "Regenerate",
        onClick: (e) => {
          const text = document.getElementById("open-ai-text").innerText;

          document.getElementById("open-ai-text").innerText = "Loading..."

          disabledBtn()

          generateText(text)
            .then(response => {
              document.getElementById("open-ai-text").innerText = response
              disabledBtn(false)
            })
        },
        type: "SECONDARY_ACTION",
        title: "Regenerate the text"
      },
    ]
  });

  disabledBtn()
}*/


import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

let openAiKey = process.env.OPENAI_KEY;

// Listen for input on all text areas, input fields, and paragraphs
document.addEventListener("input", async (event) => {
  let target = event.target;

  // Check if it's a textarea, input field, or paragraph
  if (target.tagName === "TEXTAREA" || target.tagName === "INPUT" || target.tagName === "P") {
    let text = target.value || target.innerText;
    if (text.length > 5) {  // Start completion after 5 characters
      let suggestion = await fetchCompletion(text);

      if (suggestion) {
        showInlineSuggestion(target, suggestion);
      }
    }
  }
});

// Function to get completion from OpenAI
async function fetchCompletion(text) {
  try {
    const response = await fetch("https://api.openai.com/v1/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openAiKey}`
      },
      body: JSON.stringify({
        model: "text-davinci-003",
        prompt: text,
        max_tokens: 20
      })
    });

    let data = await response.json();
    return data.choices[0]?.text.trim() || "";
  } catch (error) {
    console.error("Error fetching AI completion:", error);
    return "";
  }
}

// Function to display inline suggestion
function showInlineSuggestion(inputElement, suggestion) {
  let existingHint = document.querySelector(".ai-suggestion");
  if (existingHint) existingHint.remove();

  let rect = inputElement.getBoundingClientRect();
  let fontSize = window.getComputedStyle(inputElement).fontSize;
  let fontFamily = window.getComputedStyle(inputElement).fontFamily;

  let hint = document.createElement("span");
  hint.className = "ai-suggestion";
  hint.innerText = suggestion;
  hint.style.position = "absolute";
  hint.style.color = "gray";
  hint.style.fontSize = fontSize;
  hint.style.fontFamily = fontFamily;

  // Positioning the suggestion based on the element's position
  if (inputElement.tagName === "TEXTAREA" || inputElement.tagName === "INPUT") {
    hint.style.left = `${rect.left}px`;
    hint.style.top = `${rect.bottom + window.scrollY + 5}px`;
  } else if (inputElement.tagName === "P") {
    // Adjusting for paragraph element positioning
    hint.style.left = `${rect.left}px`;
    hint.style.top = `${rect.bottom + window.scrollY + 5}px`;
  }

  document.body.appendChild(hint);

  // Handling "Tab" key to insert the suggestion
  inputElement.addEventListener("keydown", (e) => {
    if (e.key === "Tab") {
      e.preventDefault();
      if (inputElement.tagName === "TEXTAREA" || inputElement.tagName === "INPUT") {
        inputElement.value += suggestion;
      } else if (inputElement.tagName === "P") {
        inputElement.innerText += suggestion;
      }
      hint.remove();
    }
  });
}
