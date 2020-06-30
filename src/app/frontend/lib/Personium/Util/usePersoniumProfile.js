import { useState, useEffect } from 'react';

export function usePersoniumProfile(cellUrl, lang = 'ja', fallback = true) {
  const [profile, setProfile] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);

    (async () => {
      const urls = [];
      if (lang !== null) urls.push(`${cellUrl}__/locale/${lang}/profile.json`);
      if (lang === null || fallback) urls.push(`${cellUrl}__/profile.json`);

      let lastResponse = null;
      for (const profileUrl of urls) {
        lastResponse = await fetch(profileUrl);
        if (lastResponse.ok) {
          break;
        }
      }

      if (!lastResponse.ok) {
        throw {
          status: lastResponse.status,
          statusText: lastResponse.statusText,
        };
      } else {
        return lastResponse.json();
      }
    })()
      .then(jsonDat => {
        setProfile(jsonDat);
        setLoading(false);
      })
      .catch(err => {
        setError(err);
        setLoading(false);
      });
  }, [cellUrl, lang, fallback]);

  return { profile, loading, error };
}
