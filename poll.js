class MessageListener {
  constructor() {
    chrome.runtime.onMessage.addListener((request, sender) => {
      if (this.onMessage) {
        this.onMessage(request, sender);
      }
    });
  }
}

class PollBot {
  constructor() {
    this.messageListener = new MessageListener();
    this.messageListener.onMessage = this.onMessage.bind(this);
  }

  onMessage(request, sender) {
    if (request.type === "makePoll") this.getPoll();
    else if (request.type === "pollPage")
      this.handlePollPage(request.pollObject);
    else if (request.type === "pollPage1")
      this.handlePollPage1(request.pollObject);
    else if (request.type === "pollPage2") this.handlePollPage2();
  }

  sendMessageToBackgroundScript(message) {
    chrome.runtime.sendMessage(message, (response) => {
      console.log("Message has been sent. Response:", response);
    });
  }

  async getPoll() {
    const response = await fetch(
      "https://obs.trakya.edu.tr/api/ogrencianketders"
    );
    const polls = await response.json();

    polls.data.forEach((poll, index) => {
      setTimeout(() => {
        if (poll.DersAdi !== null) {
          let pollObject = {
            id: poll.AnketId,
            courseName: poll.DersAdi,
            link: poll.AnketLinki,
          };

          this.sendMessageToBackgroundScript({
            type: "pollPage",
            pollObject: pollObject,
          });
        }
      }, index * 26000);
    });
  }

  handlePollPage(pollObject) {
    let firstNextButton = document.querySelector("#ls-button-submit");

    if (!firstNextButton) {
      this.sendMessageToBackgroundScript({
        type: "accessError",
        pollObject: pollObject,
      });
      return;
    }

    firstNextButton.click();

    this.sendMessageToBackgroundScript({
      type: "pollPage1",
      pollObject: pollObject,
    });
  }

  handlePollPage1(pollObject) {
    const questionsAnswer = [1, 1, 1, 2, 1, 3, 0, 1, -1, 0, 2, 0];
    const questions = document.querySelectorAll(".question-container");
    const todayDate = new Date();
    let year = todayDate.getFullYear();
    let month = todayDate.getMonth();
    let day = todayDate.getDate();
    month = month < 10 ? "0" + month : month;
    day = day < 10 ? "0" + day : day;
    const todayString = `${day}/${month}/${year}`;

    questions.forEach((element, index) => {
      const questionRadios = element.querySelectorAll("label");

      if (questionAnswer[index] !== -1) {
        questionRadios[questionsAnswer[index]].click();
      }
    });

    document.querySelector("#answer985215X111X1622").value =
      pollObject.courseName;
    document.querySelector("#answer985215X111X1623").value = todayString;

    setTimeout(() => {
      document.querySelector("#ls-button-submit").click();

      this.sendMessageToBackgroundScript({
        type: "pollPage2",
        pollObject: pollObject,
      });
    }, 500);
  }

  handlePollPage2() {
    const questionsAnswer = [
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    ];
    const questions = document.querySelectorAll("tr");

    questions.forEach((element, index) => {
      const questionRadios = element.querySelectorAll("label");

      if (questionAnswer[index] !== -1) {
        questionRadios[questionsAnswer[index]].click();
      }
    });

    setTimeout(() => {
      document.querySelector("#ls-button-submit").click();
      setTimeout(() => {
        this.sendMessageToBackgroundScript({
          type: "pollOver",
        });
      }, 150);
    }, 200);
  }
}

new PollBot();
