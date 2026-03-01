export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const { text, source } = req.body;
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      messages: [{ role: "user", content: `You are a neutral fact-checker for a debate platform called antilog. Briefly assess this argument in 2 sentences max. Flag if the claim seems unsupported, misleading, or well-evidenced. Be concise and neutral. Do NOT moralize.\n\nArgument: "${text}"\n${source ? `Cited source: ${source}` : "No source cited."}\n\nRespond with a JSON object: { "verdict": "supported" | "disputed" | "unsourced", "note": "your brief note" }` }],
    }),
  });
  const data = await response.json();
  res.status(200).json(data);
}
