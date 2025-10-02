import { useState } from "react";

export default function Home() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const askBot = async () => {
    if (!question.trim()) return;

    setIsLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });

      const data = await res.json();
      setAnswer(data.answer);
      speakOutLoud(data.answer);
    } catch (error) {
      console.error("Error:", error);
      setAnswer("Sorry, something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Voice output function
  const speakOutLoud = (text) => {
    if (!text) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 1;
    speechSynthesis.speak(utterance);
  };

  // Mic input function
  const startListening = () => {
    // Check for browser support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      alert("Speech Recognition is not supported in this browser. Please use Chrome, Edge, or Safari!");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.continuous = false;

    setIsListening(true);

    recognition.onstart = () => {
      console.log("Voice recognition started. Speak now!");
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      const speechResult = event.results[0][0].transcript;
      console.log("Speech recognized:", speechResult);
      setQuestion(speechResult);
      setIsListening(false);
      askBotWithSpeech(speechResult);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
      
      if (event.error === 'no-speech') {
        alert("No speech detected. Please try again!");
      } else if (event.error === 'not-allowed') {
        alert("Microphone access denied. Please allow microphone access in browser settings!");
      } else {
        alert("Error occurred: " + event.error);
      }
    };

    recognition.onend = () => {
      console.log("Voice recognition ended");
      setIsListening(false);
    };

    try {
      recognition.start();
    } catch (error) {
      console.error("Error starting recognition:", error);
      setIsListening(false);
      alert("Could not start voice recognition. Please try again!");
    }
  };

  const askBotWithSpeech = async (speechText) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: speechText }),
      });

      const data = await res.json();
      setAnswer(data.answer);
      speakOutLoud(data.answer);
    } catch (error) {
      console.error("Error:", error);
      setAnswer("Sorry, something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.iconWrapper}>
            <span style={styles.icon}>🤖</span>
          </div>
          <h1 style={styles.title}>AI Voice Assistant</h1>
          <p style={styles.subtitle}>Ask me anything using text or voice</p>
        </div>

        {/* Input Section */}
        <div style={styles.inputSection}>
          <div style={styles.inputWrapper}>
            <input
              type="text"
              placeholder="Type your question here..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              style={styles.input}
              disabled={isLoading || isListening}
            />
          </div>

          <div style={styles.buttonGroup}>
            <button
              onClick={askBot}
              disabled={isLoading || !question.trim() || isListening}
              style={{
                ...styles.askButton,
                opacity: isLoading || !question.trim() || isListening ? 0.6 : 1,
              }}
            >
              <span style={styles.buttonIcon}>{isLoading ? "⏳" : "💬"}</span>
              <span style={styles.buttonText}>
                {isLoading ? "Processing..." : "Ask Question"}
              </span>
            </button>
            
            <button
              onClick={startListening}
              disabled={isLoading || isListening}
              style={{
                ...styles.micButton,
                background: isListening
                  ? "linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)"
                  : "linear-gradient(135deg, #ff416c 0%, #ff4b2b 100%)",
                opacity: isLoading ? 0.6 : 1,
              }}
            >
              <span style={styles.micIcon}>🎤</span>
            </button>
          </div>
        </div>

        {/* Answer Section */}
        {(answer || isLoading) && (
          <div style={styles.answerSection}>
            <div style={styles.answerLabel}>
              <span style={styles.answerIcon}>💬</span>
              <span>Answer:</span>
            </div>
            <div style={styles.answerBox}>
              {isLoading ? (
                <div style={styles.loadingDots}>
                  <span style={styles.dot}>●</span>
                  <span style={styles.dot}>●</span>
                  <span style={styles.dot}>●</span>
                </div>
              ) : (
                <p style={styles.answerText}>{answer}</p>
              )}
            </div>
            {answer && !isLoading && (
              <button
                onClick={() => speakOutLoud(answer)}
                style={styles.speakButton}
              >
                <span style={styles.buttonIcon}>🔊</span>
                <span style={styles.buttonText}>Play Answer</span>
              </button>
            )}
          </div>
        )}

        {/* Footer */}
        <div style={styles.footer}>
          <p style={styles.footerText}>
            💡 Tip: Type your question and click "Ask Question" or use voice input
          </p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  card: {
    background: "white",
    borderRadius: "20px",
    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
    maxWidth: "700px",
    width: "100%",
    padding: "40px",
    animation: "fadeIn 0.5s ease-in",
  },
  header: {
    textAlign: "center",
    marginBottom: "30px",
  },
  iconWrapper: {
    marginBottom: "15px",
  },
  icon: {
    fontSize: "60px",
    display: "inline-block",
    animation: "bounce 2s infinite",
  },
  title: {
    fontSize: "32px",
    fontWeight: "700",
    color: "#333",
    margin: "10px 0",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  subtitle: {
    fontSize: "16px",
    color: "#666",
    margin: "5px 0 0 0",
  },
  inputSection: {
    marginBottom: "30px",
  },
  inputWrapper: {
    marginBottom: "15px",
  },
  input: {
    width: "100%",
    padding: "15px 20px",
    fontSize: "16px",
    border: "2px solid #e0e0e0",
    borderRadius: "12px",
    outline: "none",
    transition: "all 0.3s ease",
    fontFamily: "inherit",
    backgroundColor: "#f8f9fa",
  },
  buttonGroup: {
    display: "flex",
    gap: "15px",
    alignItems: "center",
  },
  askButton: {
    flex: 1,
    padding: "16px 20px",
    background: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
    color: "white",
    border: "none",
    borderRadius: "12px",
    cursor: "pointer",
    transition: "all 0.3s ease",
    fontWeight: "600",
    fontSize: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    boxShadow: "0 4px 15px rgba(0, 0, 0, 0.2)",
  },
  micButton: {
    width: "60px",
    height: "60px",
    padding: "0",
    color: "white",
    border: "none",
    borderRadius: "50%",
    cursor: "pointer",
    transition: "all 0.3s ease",
    fontWeight: "600",
    fontSize: "24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 4px 15px rgba(255, 65, 108, 0.4)",
    flexShrink: 0,
  },
  buttonIcon: {
    fontSize: "20px",
  },
  buttonText: {
    fontSize: "16px",
  },
  micIcon: {
    fontSize: "28px",
    lineHeight: 1,
  },
  answerSection: {
    marginTop: "30px",
    animation: "slideIn 0.5s ease-out",
  },
  answerLabel: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "18px",
    fontWeight: "600",
    color: "#333",
    marginBottom: "12px",
  },
  answerIcon: {
    fontSize: "24px",
  },
  answerBox: {
    background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
    padding: "20px",
    borderRadius: "12px",
    minHeight: "80px",
    marginBottom: "15px",
  },
  answerText: {
    fontSize: "16px",
    lineHeight: "1.6",
    color: "#333",
    margin: 0,
  },
  loadingDots: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "8px",
    height: "40px",
  },
  dot: {
    fontSize: "24px",
    color: "#667eea",
    animation: "pulse 1.4s infinite ease-in-out",
  },
  speakButton: {
    padding: "12px 20px",
    background: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
    color: "white",
    border: "none",
    borderRadius: "12px",
    cursor: "pointer",
    transition: "all 0.3s ease",
    fontWeight: "600",
    fontSize: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    width: "100%",
    boxShadow: "0 4px 15px rgba(0, 0, 0, 0.2)",
  },
  footer: {
    marginTop: "30px",
    textAlign: "center",
    paddingTop: "20px",
    borderTop: "1px solid #e0e0e0",
  },
  footerText: {
    fontSize: "14px",
    color: "#999",
    margin: 0,
  },
};
