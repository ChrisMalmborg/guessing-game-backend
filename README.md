# Guessing Game Backend

Express.js server that uses Claude AI to analyze guessing strategies in a number guessing game (1–100).

**Frontend:** [chrismalmborg/guessing-game](https://github.com/chrismalmborg/guessing-game) &nbsp;|&nbsp; **Live Demo:** [chrismalmborg.github.io/guessing-game](https://chrismalmborg.github.io/guessing-game)

---

## Tech Stack

- **Node.js** + **Express** — HTTP server
- **Anthropic Claude API** (`claude-sonnet-4-5`) — strategy analysis
- **cors** + **dotenv**

## Local Setup

```sh
npm install
cp .env.example .env   # then add your API key
npm run dev            # or: npm start
```

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `ANTHROPIC_API_KEY` | Yes | Anthropic API key |
| `PORT` | No | Port to listen on (default: `3000`) |

## API

### `GET /`

Health check.

```json
{ "status": "ok" }
```

---

### `POST /api/analyze`

Analyzes a completed game and returns AI feedback on the player's guessing strategy.

**Request body:**

```json
{
  "guesses": [
    { "value": 50, "result": "high" },
    { "value": 25, "result": "low" },
    { "value": 37, "result": "correct" }
  ],
  "targetNumber": 37
}
```

| Field | Type | Description |
|---|---|---|
| `guesses` | array | Ordered list of guesses; each has `value` (integer) and `result` (`"high"`, `"low"`, or `"correct"`) |
| `targetNumber` | number | The answer (1–100) |

**Response:**

```json
{
  "analysis": {
    "rating": "Excellent! ⭐",
    "strengths": "Used binary search effectively...",
    "tips": "...",
    "pattern": "Binary search strategy."
  }
}
```

**Error responses:**

```json
{ "error": "guesses must be a non-empty array" }
{ "error": "targetNumber must be a number between 1 and 100" }
```

## Deployment

Deployed on [Railway](https://railway.app). Set the `ANTHROPIC_API_KEY` environment variable in your Railway service settings. Railway automatically detects the `npm start` script.

CORS is configured to allow requests from `https://chrismalmborg.github.io` and `localhost` origins.
