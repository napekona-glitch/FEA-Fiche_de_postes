
async function search(q) {
  const res = await fetch(`https://your-proxy.vercel.app/api/proxy?q=${encodeURIComponent(q)}`);
  return res.json();
}
