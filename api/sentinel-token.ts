// Vercel Edge Function — gira SOLO sul server.
// Scambia le credenziali Copernicus (SENTINEL_CLIENT_ID / SENTINEL_CLIENT_SECRET,
// impostate nella dashboard Vercel, mai nel bundle frontend) con un access
// token OAuth2 di breve durata da restituire al browser.
export const config = { runtime: "edge" };

export default async function handler() {
  const clientId = process.env.SENTINEL_CLIENT_ID;
  const clientSecret = process.env.SENTINEL_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return new Response(
      JSON.stringify({ error: "Sentinel Hub non configurato su questo deployment" }),
      { status: 503, headers: { "Content-Type": "application/json" } },
    );
  }

  const response = await fetch(
    "https://identity.dataspace.copernicus.eu/auth/realms/CDSE/protocol/openid-connect/token",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: clientId,
        client_secret: clientSecret,
      }),
    },
  );

  if (!response.ok) {
    return new Response(JSON.stringify({ error: "Token exchange fallito" }), {
      status: 502,
      headers: { "Content-Type": "application/json" },
    });
  }

  const data = await response.json();

  return new Response(
    JSON.stringify({ access_token: data.access_token, expires_in: data.expires_in }),
    {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "private, max-age=270",
      },
    },
  );
}
