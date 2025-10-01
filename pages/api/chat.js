export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { question } = req.body;

  try {
    const modelName = "models/gemini-2.5-flash"; 

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/${modelName}:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: question }] }],
        }),
      }
    );

    const data = await response.json();
    console.log("Gemini raw response:", JSON.stringify(data, null, 2));

    
    const answer =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No reply from Gemini";

    res.status(200).json({ answer });
  } catch (err) {
    console.error("Gemini API error:", err);
    res.status(500).json({ error: "Failed to fetch from Gemini" });
  }
}
