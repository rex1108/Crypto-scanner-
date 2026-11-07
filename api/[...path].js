export default async function handler(req, res) {
  try {
    if (req.method !== "GET") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    // 優先使用 Vercel 提供的動態路徑
    let apiPath = req.query.path;

    if (Array.isArray(apiPath)) {
      apiPath = apiPath.join("/");
    }

    // 沒有取得動態路徑時，從 URL 解析
    if (!apiPath) {
      const url = new URL(
        req.url,
        `https://${req.headers.host || "localhost"}`
      );

      apiPath = url.pathname.replace(/^\/api\//, "");
    }

    // 兼容 /api/binance/... 和 /api/...
    apiPath = String(apiPath).replace(/^\/+/, "");

    if (apiPath.startsWith("binance/")) {
      apiPath = apiPath.slice("binance/".length);
    }

    // 僅允許 Binance 公開行情 API
    const allowedPrefixes = [
      "fapi/v1/",
      "futures/data/"
    ];

    if (!allowedPrefixes.some(prefix => apiPath.startsWith(prefix))) {
      return res.status(403).json({
        error: "API path not allowed",
        receivedPath: apiPath
      });
    }

    // 保留原始查詢參數
    const url = new URL(
      req.url,
      `https://${req.headers.host || "localhost"}`
    );

    const query = new URLSearchParams(url.search);
    query.delete("path");

    const target =
      `https://fapi.binance.com/${apiPath}` +
      (query.toString() ? `?${query.toString()}` : "");

    const response = await fetch(target);
    const data = await response.text();

    res.setHeader("Content-Type", "application/json");
    res.setHeader(
      "Cache-Control",
      "s-maxage=10, stale-while-revalidate=20"
    );

    return res.status(response.status).send(data);

  } catch (error) {
    return res.status(500).json({
      error: "Binance proxy failed",
      message: error.message
    });
  }
}
