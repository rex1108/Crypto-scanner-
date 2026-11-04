export default async function handler(req, res) {
  try {
    const path = req.query.path;

    if (!path) {
      return res.status(400).json({ error: "Missing API path" });
    }

    const apiPath = Array.isArray(path) ? path.join("/") : path;

    // 僅允許讀取 Binance USDT 永續合約公開行情 API
    const allowedPrefixes = [
      "fapi/v1/",
      "futures/data/"
    ];

    if (!allowedPrefixes.some(prefix => apiPath.startsWith(prefix))) {
      return res.status(403).json({ error: "API path not allowed" });
    }

    const query = new URLSearchParams();

    for (const [key, value] of Object.entries(req.query)) {
      if (key !== "path" && value !== undefined) {
        query.set(key, Array.isArray(value) ? value[0] : value);
      }
    }

    const target =
      `https://fapi.binance.com/${apiPath}` +
      (query.toString() ? `?${query.toString()}` : "");

    const response = await fetch(target);
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
