export default async function handler(req, res) {
  const raw = req.url || "/";
  const path = raw.split("?")[0].replace(/^\/api\/binance/, "");
  const allowed = [
    "/fapi/v1/ticker/24hr",
    "/fapi/v1/exchangeInfo",
    "/fapi/v1/klines",
    "/futures/data/openInterestHist"
  ];
  if (!allowed.includes(path)) {
    return res.status(400).json({ error: "Endpoint not allowed" });
  }
  const query = raw.includes("?") ? raw.slice(raw.indexOf("?")) : "";
  const upstream = "https://fapi.binance.com" + path + query;
  try {
    const response = await fetch(upstream, {
      headers: { "User-Agent": "personal-crypto-scanner" }
    });
    const body = await response.text();
    res.setHeader("Content-Type", response.headers.get("content-type") || "application/json");
    res.setHeader("Cache-Control", "s-maxage=15, stale-while-revalidate=30");
    return res.status(response.status).send(body);
  } catch (e) {
    return res.status(502).json({ error: "Binance API request failed" });
  }
}
