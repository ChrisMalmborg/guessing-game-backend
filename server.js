require("dotenv").config();
const express = require("express");
const cors = require("cors");
const Anthropic = require("@anthropic-ai/sdk");

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

app.post("/api/analyze", async (req, res) => {
  const { guesses, targetNumber } = req.body;

  if (!Array.isArray(guesses) || guesses.length === 0) {
    return res.status(400).json({ error: "guesses must be a non-empty array" });
  }

  if (typeof targetNumber !== "number") {
    return res.status(400).json({ error: "targetNumber must be a number" });
  }

  const guessLog = guesses
    .map(
      (g, i) =>
        `Guess ${i + 1}: ${g.value} (${g.result})`
    )
    .join("\n");

  const prompt = `Analyze this number guessing game where the target was ${targetNumber} and the player made ${guesses.length} guesses:

${guessLog}

Provide a concise analysis (under 150 words) in this exact JSON format:
{
  "rating": "Excellent" or "Good" or "Needs Work",
  "strengths": "what the player did well",
  "tips": "specific tips to improve",
  "pattern": "binary search, random, or other pattern identified"
}

Return only valid JSON, no other text.`;

  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 512,
      messages: [{ role: "user", content: prompt }],
    });

    const text = message.content[0].text;
    const analysis = JSON.parse(text);

    res.json({ analysis });
  } catch (err) {
    if (err instanceof SyntaxError) {
      return res
        .status(502)
        .json({ error: "Failed to parse AI response as JSON" });
    }
    if (err.status === 401) {
      return res.status(500).json({ error: "Invalid Anthropic API key" });
    }
    console.error("Analysis error:", err.message);
    res.status(500).json({ error: "Failed to analyze guessing strategy" });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
