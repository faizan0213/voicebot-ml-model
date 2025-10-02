import { useState } from "react";

export default function Home() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");

  const askBot = async () => {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question }),
    });

    const data = await res.json();
    setAnswer(data.answer);
    speakOutLoud(data.answer); 
  };

  // Voice output function
  const speakOutLoud = (text) => {
    if (!text) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US"; // Hindi ke liye "hi-IN" bhi use kar sakte ho
    utterance.rate = 1; // speed control
    speechSynthesis.speak(utterance);
  };

  // Mic input function
  const startListening = () => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Speech Recognition not supported in this browser. Try Chrome!");
      return;
    }

    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = "en-US"; // Hindi ke liye "hi-IN"
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      const speechResult = event.results[0][0].transcript;
      setQuestion(speechResult); // speech ko input box me daal do
      askBotWithSpeech(speechResult); // direct bot se puchho
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error", event.error);
    };

    recognition.start();
  };

  const askBotWithSpeech = async (speechText) => {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: speechText }),
    });

    const data = await res.json();
    setAnswer(data.answer);
    speakOutLoud(data.answer); // auto speak reply
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>100x Voice Bot</h1>

      <input
        type="text"
        placeholder="Ask something..."
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        style={{ marginRight: 10 }}
      />
      <button onClick={askBot}>Ask</button>
      <button onClick={startListening} style={{ marginLeft: 10 }}>
        🎤 Ask with Mic
      </button>

      <p>
        <b>Answer:</b> {answer}
      </p>

      {answer && (
        <button onClick={() => speakOutLoud(answer)}>🔊 Speak Again</button>
      )}
    </div>
  );
}
