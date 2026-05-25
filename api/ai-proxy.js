const getEndpoint = (apiBaseUrl) => {
  const trimmed = String(apiBaseUrl || "").trim().replace(/\/+$/, "");
  if (!trimmed) return "";
  if (/\/chat\/completions$/i.test(trimmed)) return trimmed;
  return `${trimmed}/chat/completions`;
};

const isMiMoEndpoint = (apiBaseUrl) => /xiaomimimo\.com/i.test(String(apiBaseUrl || ""));

const getModelName = (apiBaseUrl, modelName) => {
  const normalized = String(modelName || "").trim();
  if (isMiMoEndpoint(apiBaseUrl) && /^mimo/i.test(normalized)) {
    return normalized.toLowerCase();
  }
  return normalized;
};

const readUpstreamError = async (response) => {
  try {
    const data = await response.json();
    return data?.error?.message || data?.message || response.statusText;
  } catch {
    return response.statusText;
  }
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { apiBaseUrl, apiKey, modelName, body } = req.body || {};
  if (!apiBaseUrl || !apiKey || !modelName || !body) {
    return res.status(400).json({ error: "Missing apiBaseUrl, apiKey, modelName, or body" });
  }

  const endpoint = getEndpoint(apiBaseUrl);
  let parsedUrl;
  try {
    parsedUrl = new URL(endpoint);
  } catch {
    return res.status(400).json({ error: "Invalid API Base URL" });
  }

  if (!["https:", "http:"].includes(parsedUrl.protocol)) {
    return res.status(400).json({ error: "API Base URL must use http or https" });
  }

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiKey}`,
  };

  if (isMiMoEndpoint(apiBaseUrl)) {
    headers["api-key"] = apiKey;
  }

  const requestBody = {
    ...body,
    model: getModelName(apiBaseUrl, modelName),
  };

  try {
    const upstream = await fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify(requestBody),
    });

    if (!upstream.ok) {
      return res.status(upstream.status).json({ error: await readUpstreamError(upstream) });
    }

    const data = await upstream.json();
    return res.status(200).json(data);
  } catch (error) {
    return res.status(502).json({
      error: error instanceof Error ? error.message : "Upstream request failed",
    });
  }
}
