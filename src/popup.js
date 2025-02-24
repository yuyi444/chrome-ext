document.getElementById("generate").addEventListener("click", () => {
    const inputText = document.getElementById("inputText").value;
    
    chrome.runtime.sendMessage({ text: inputText }, (response) => {
      document.getElementById("output").innerText = response.suggestion || "No suggestion";
    });
  });
  