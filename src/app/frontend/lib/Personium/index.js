import React, { useEffect, useState } from 'react';

export * from './Context';

export function usePersoniumProfile(cellUrl) {
  const [profile, setProfile] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetch(`${cellUrl}__/profile.json`)
      .then(res => {
        if (!res.ok) {
          throw {
            status: res.status,
            statusText: res.statusText,
          };
        } else {
          return res.json();
        }
      })
      .then(jsonDat => {
        setProfile(jsonDat);
        setLoading(false);
      })
      .catch(err => {
        setError(err);
        setLoading(false);
      });
  }, [cellUrl]);

  return { profile, loading, error };
}
