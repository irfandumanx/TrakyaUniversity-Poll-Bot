class PollBotService {
  constructor() {
    chrome.runtime.onMessage.addListener(this.messageListener.bind(this));
  }

  async messageListener(request, sender) {
    let urlId = sender.tab.id;
    let requestType = request.type;

    if (requestType === "pollOver") {
      chrome.tabs.remove(urlId);
      return;
    }

    let pollObject = request.pollObject;

    if (requestType === "pollPage") {
      const newTab = await chrome.tabs.create({
        url: pollObject.link,
      });
      urlId = newTab.id;
    }

    if (requestType === "accessError") {
      await chrome.tabs.update(sender.tab.id, {
        url: pollObject.link,
      });
    }

    setTimeout(() => {
      chrome.tabs.sendMessage(urlId, {
        type: requestType,
        pollObject: pollObject,
      });
    }, 6000);
  }
}

new PollBotService();
