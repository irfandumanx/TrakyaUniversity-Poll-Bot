const makePoll = document.querySelector("#make-poll");
const body = document.querySelector("body");
const html = document.querySelector("html");
const htmlHeight = html.clientHeight;
const err = document.createElement("h3");
err.style.color = "red";
err.innerText = "This bot is not supported on this site.";

makePoll.onclick = function (event) {
  chrome.tabs.query(
    {
      active: true,
      currentWindow: true,
    },
    (tabs) => {
      chrome.tabs.sendMessage(
        tabs[0].id,
        {
          type: "makePoll",
        },
        (_) => {
          let runtimeException = chrome.runtime.lastError;
          if (runtimeException === undefined) return;
          if (
            runtimeException.message !==
            "Could not establish connection. Receiving end does not exist."
          )
            return;
          body.appendChild(err);
          setTimeout(() => {
            body.removeChild(err);
            html.style.height = htmlHeight;
          }, 1500);
        }
      );
    }
  );
};
