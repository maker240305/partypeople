const SUPABASE_URL = "https://ckgqawmbtqnpmdumamuv.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_6jMbCnxw2r0ahw-pkMZk5w_jQPHOoTx";

function cleanCode(value) {
  const code = String(value || "").toUpperCase();
  return /^[A-Z0-9]{6,12}$/.test(code) ? code : "";
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

async function getEvent(code) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/party_get_event`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_PUBLISHABLE_KEY,
      Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ invite_code: code })
  });

  if (!response.ok) return null;
  return response.json();
}

module.exports = async (req, res) => {
  const code = cleanCode(req.query && req.query.code);
  const host = req.headers["x-forwarded-host"] || req.headers.host || "partypple.vercel.app";
  const protocol = req.headers["x-forwarded-proto"] || "https";
  const origin = `${protocol}://${host}`;
  const event = code ? await getEvent(code) : null;
  const title = event && event.title ? event.title : "파티피플 초대장";
  const description = event
    ? `${event.hostName || "파티피플"}님의 초대장 · ${event.date || "날짜 미정"}`
    : "파티피플에서 초대장을 확인해 보세요.";
  const inviteUrl = code ? `${origin}/e/${code}` : origin;
  const imageUrl = code ? `${origin}/api/og?code=${encodeURIComponent(code)}` : `${origin}/assets/posters/neon-birthday.png`;
  const appUrl = code ? `${origin}/#/e/${code}` : origin;

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=86400");
  res.status(200).send(`<!doctype html>
<html lang="ko">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(title)} | 파티피플</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="파티피플" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:url" content="${escapeHtml(inviteUrl)}" />
    <meta property="og:image" content="${escapeHtml(imageUrl)}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(title)}" />
    <meta name="twitter:description" content="${escapeHtml(description)}" />
    <meta name="twitter:image" content="${escapeHtml(imageUrl)}" />
    <script>location.replace(${JSON.stringify(appUrl)});</script>
  </head>
  <body>
    <a href="${escapeHtml(appUrl)}">초대장 열기</a>
  </body>
</html>`);
};
