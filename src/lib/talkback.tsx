export const talkback = (msg: string) => {
  const msgSynthesis = new SpeechSynthesisUtterance();
  msgSynthesis.text = msg;
  window.speechSynthesis.speak(msgSynthesis);
};
