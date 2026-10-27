import "dotenv/config";
import express from "express";

const app = express();
const port = Number(process.env.PORT || 3001);

app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    aiConfigured: Boolean(process.env.GEMINI_API_KEY),
    model: process.env.GEMINI_MODEL || "gemini-3.5-flash-lite"
  });
});

app.post("/api/chat", async (req, res) => {
  const messages = req.body?.messages;

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: "Send at least one message to Esther." });
  }

  const safeMessages = messages
    .filter((message) =>
      message &&
      ["user", "assistant"].includes(message.role) &&
      typeof message.content === "string"
    )
    .slice(-24)
    .map((message) => ({
      role: message.role === "assistant" ? "model" : "user",
      parts: [{ text: message.content.slice(0, 12000) }]
    }));

  if (!safeMessages.length || safeMessages[safeMessages.length - 1].role !== "user") {
    return res.status(400).json({ error: "Your latest message must be from you." });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(503).json({
      error: "Esther's interface is ready, but her AI key isn't connected yet. Add GEMINI_API_KEY to your private .env file, then restart the server."
    });
  }

  const model = process.env.GEMINI_MODEL || "gemini-3.5-flash-lite";
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{
            text: "You are Esther, a composed, thoughtful, capable personal AI assistant. Be warm but not gushy, clear, practical, and honest about uncertainty. Help the user think and build things rather than pretending to take actions you have not taken."
          }]
        },
        contents: safeMessages,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1200
        }
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Gemini API error:", response.status, data?.error?.message || "Unknown provider error");
      const message = response.status === 429
        ? "The AI provider's free quota may be temporarily exhausted. Wait a little and try again."
        : response.status === 400 || response.status === 403
          ? "The AI provider rejected the key or request. Check your private .env settings."
          : "Esther couldn't reach the AI provider. Please try again shortly.";
      return res.status(502).json({ error: message });
    }

    const reply = data?.candidates?.[0]?.content?.parts
      ?.map((part) => part.text || "")
      .join("")
      .trim();

    if (!reply) {
      return res.status(502).json({ error: "The AI provider returned an empty response. Please try again." });
    }

    return res.json({ reply, model });
  } catch (error) {
    console.error("Chat request failed:", error.message);
    return res.status(502).json({ error: "Esther couldn't connect to the AI provider. Check your connection and try again." });
  }
});

app.listen(port, "0.0.0.0", () => {
  console.log(`Esther API listening on port ${port}`);
});