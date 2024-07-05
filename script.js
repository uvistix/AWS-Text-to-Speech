// Configure the AWS SDK with your credentials and region
AWS.config.update({
  accessKeyId: "YOUR_KEY",
  secretAccessKey: "YOUR_KEY",
  region: "ap-south-1",
});

function insertSayAsTag() {
  var textInput = document.getElementById("textInput");
  var start = textInput.selectionStart;
  var end = textInput.selectionEnd;
  var selectedText = textInput.value.substring(start, end);
  var textBefore = textInput.value.substring(0, start);
  var textAfter = textInput.value.substring(end);

  var tag = `<say-as interpret-as="characters">${selectedText}</say-as>`;
  textInput.value = textBefore + tag + textAfter;

  textInput.selectionStart = start + tag.length - selectedText.length - 11;
  textInput.selectionEnd = start + tag.length - selectedText.length - 11;

  textInput.focus();
}

function updateCharCount() {
  var textInput = document.getElementById("textInput");
  var charCount = document.getElementById("charCount");
  charCount.textContent = `${textInput.value.length}/3000`;
}

function convertTextToSpeech() {
  var text = document.getElementById("textInput").value;
  if (!text) {
    alert("Please enter some text");
    return;
  }
  if (text.length > 3000) {
    alert("Text exceeds the 3000 character limit.");
    return;
  }
  var ssmlText = `<speak>${text}</speak>`;

  var polly = new AWS.Polly();

  var params = {
    Text: ssmlText,
    OutputFormat: "mp3",
    VoiceId: "Amy",
    Engine: "neural",
    TextType: "ssml",
  };

  polly.synthesizeSpeech(params, function (err, data) {
    if (err) {
      console.error(err, err.stack);
      return;
    }

    var uInt8Array = new Uint8Array(data.AudioStream);
    var blob = new Blob([uInt8Array.buffer], { type: "audio/mp3" });
    var url = URL.createObjectURL(blob);
    var audio = document.getElementById("audioPlayback");
    audio.src = url;
    audio.play();

    window.audioBlob = blob;
  });
}

function downloadAudio() {
  if (!window.audioBlob) {
    alert("No audio generated yet. Please convert text to speech first.");
    return;
  }

  var link = document.createElement("a");
  link.href = URL.createObjectURL(window.audioBlob);
  link.download = "speech.mp3";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function downloadText() {
  var text = document.getElementById("textInput").value;
  if (!text) {
    alert("No text entered yet.");
    return;
  }

  var blob = new Blob([text], { type: "text/plain" });
  var link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "input.txt";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
