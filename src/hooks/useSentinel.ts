import { useEffect, useState } from "react";

interface SentinelToken {
  accessToken: string | null;
  available: boolean;
  loading: boolean;
}

/**
 * Richiede un access token Sentinel Hub tramite la Edge Function
 * /api/sentinel-token — il client_secret non tocca mai il browser.
 * Se il deployment non ha credenziali configurate, `available` resta false
 * e gli overlay satellitari non renderizzano.
 */
export function useSentinelToken(): SentinelToken {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [available, setAvailable] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/sentinel-token")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled || !data?.access_token) return;
        setAccessToken(data.access_token);
        setAvailable(true);
      })
      .catch(() => {
        // Nessuna Edge Function disponibile (es. dev locale senza `vercel dev`).
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { accessToken, available, loading };
}
