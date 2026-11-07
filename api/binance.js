
export default async function handler(req, res) {
  try {
    const endpoint = req.query.endpoint;

    if (!endpoint || typeof endpoint !== "string") {
      return res.status(400).json({ error: "Missing endpoint" });
    }

    const allowed = [
      "fapi/v1/ticker/24hr",
      "fapi/v1/exchangeInfo",
      "fapi/v1/klines",
      "fapi/v1/time",
      "fapi/v1/ping",
      "futures/data/openInterestHist"
    ];

    if (!allowed.includes(endpoint)) {
      return res.status(403).json({ error: "Endpoint not allowed" });
    }

    const query = new URLSearchParams();

    for (const [key, value] of Object.entries(req.query)) {
      if (key !== "endpoint" && value !== undefined) {
        query.set(key, Array.isArray(value) ? value[0] : value);
      }
    }

    const url =
      `https://fapi.binance.com/${endpoint}` +
      (query.toString() ? `?${query.toString()}` : "");

    const response = await fetch(url);
    const data = await response.text();

    res.setHeader("Content-Type", "application/json");
    res.setHeader("Cache-Control", "s-maxage=10, stale-while-revalidate=20");

    return res.status(response.status).send(data);
  } catch (error) {
    return res.status(500).json({
      error: "Binance proxy failed",
      message: error.message
    });
  }
}
