const express = require("express");
const cors = require("cors");
const Anthropic = require("@anthropic-ai/sdk");

if (!process.env.ANTHROPIC_API_KEY) {
  console.error("ANTHROPIC_API_KEY environment variable is required");
  process.exit(1);
}

const app = express();
const anthropic = new Anthropic();

app.use(cors({
  origin: [
    "https://chrismalmborg.github.io",
    "http://localhost:3000",
    "http://localhost:5500",
    "http://127.0.0.1:5500",
  ],
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"],
}));
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ status: "ok" });
});

app.post("/api/analyze", async (req, res) => {
  try {
    const { guesses, targetNumber } = req.body;

    if (!Array.isArray(guesses) || guesses.length === 0) {
      return res.status(400).json({ error: "guesses must be a non-empty array" });
    }
    if (typeof targetNumber !== "number" || targetNumber < 1 || targetNumber > 100) {
      return res.status(400).json({ error: "targetNumber must be a number between 1 and 100" });
    }

    const optimal = Math.ceil(Math.log2(100));
    const guessLog = guesses
      .map((g, i) => `Guess ${i + 1}: ${g.value} → ${g.result}`)
      .join("\n");

    const prompt = `You are analyzing a number guessing game where the player guesses a number between 1 and 100.

Target number: ${targetNumber}
Total guesses: ${guesses.length}
Optimal (binary search): ${optimal} guesses

Guess log:
${guessLog}

Analyze the player's strategy and respond with ONLY a JSON object (no markdown, no extra text) with these fields:
- "rating": a short rating phrase (e.g. "Excellent! ⭐", "Great job! 👍", "Good effort! 😊", or "Keep practicing! 💪")
- "strengths": what the player did well (1-3 sentences)
- "tips": actionable advice to improve (1-3 sentences)
- "pattern": describe the guessing pattern/strategy used (1-2 sentences)`;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 300,
      messages: [{ role: "user", content: prompt }],
    });

    let text = message.content[0].text.trim();

    // Strip markdown code fences if present
    if (text.startsWith("```")) {
      text = text.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "");
    }

    const analysis = JSON.parse(text);
    res.json({ analysis });
  } catch (err) {
    console.error("Analyze error:", err.message);
    res.json({
      analysis: {
        rating: "Analysis unavailable",
        strengths: "You completed the game!",
        tips: "Try using binary search: always guess the middle of the remaining range.",
        pattern: "Could not determine pattern at this time.",
      },
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
