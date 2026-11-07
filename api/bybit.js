export default async function handler(req, res) {
  try {
    const endpoint = req.query.endpoint;
    const allowed = new Set([
      "market/time", "market/tickers", "market/klines",
      "market/open-interest", "market/instruments-info"
    ]);
    if (typeof endpoint !== "string" || !allowed.has(endpoint)) {
      return res.status(400).json({ error: "Invalid or missing endpoint" });
    }
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(req.query)) {
      if (key !== "endpoint" && value !== undefined) {
        params.set(key, Array.isArray(value) ? value[0] : String(value));
      }
    }
    const url = `https://api.bybit.com/v5/${endpoint}?${params.toString()}`;
    const response = await fetch(url, { headers: { Accept: "application/json" } });
    const body = await response.text();
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Cache-Control", "s-maxage=5, stale-while-revalidate=10");
    return res.status(response.status).send(body);
  } catch (error) {
    return res.status(500).json({
      error: "Bybit proxy failed",
      message: error?.message || "Unknown error"
    });
  }
}
