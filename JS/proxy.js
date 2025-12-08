
export default async function handler(req, res) {
  const { query } = req; // e.g., ?q=searchTerm
  const apiToken = process.env.GROQ_TOKEN; // stored as environment variable

  const response = await fetch(`https://api.groq.com/search?q=${encodeURIComponent(query.q)}`, {
    headers: {
      Authorization: `Bearer ${apiToken}`,
      'Content-Type': 'application/json'
    }
  });

  const data = await response.json();
  res.status(200).json(data);
}
