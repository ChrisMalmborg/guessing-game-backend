# Guessing Game Backend

Backend server that uses Claude to analyze guessing game strategies.

## Setup

1. Install dependencies:

```sh
npm install
```

2. Create a `.env` file from the example:

```sh
cp .env.example .env
```

3. Add your Anthropic API key to `.env`:

```
ANTHROPIC_API_KEY=sk-ant-...
```

4. Start the server:

```sh
npm start
```

For development with auto-reload:

```sh
npm run dev
```

## API

### POST /api/analyze

Analyzes a player's guessing strategy.

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

**Response:**

```json
{
  "analysis": {
    "rating": "Excellent",
    "strengths": "Used binary search effectively...",
    "tips": "...",
    "pattern": "binary search"
  }
}
```
