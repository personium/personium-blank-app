import { useState, useEffect } from 'react';
import { usePersoniumAuthentication, usePersoniumConfig } from '../Context';

export function usePersoniumBoxInstall(barPath = '__/app.bar', boxName) {
  const { auth } = usePersoniumAuthentication();
  const { config } = usePersoniumConfig();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState({
    isInstalled: false,
    progress: 0,
  });

  useEffect(() => {
    let pollingStatusID = -1;
    setLoading(true);

    function updateInstallStatus(text) {
      setStatus(c => [...c, { time: Date.now(), text }]);
    }

    const { access_token } = auth;

    if (access_token === undefined) {
      setError({ text: 'no auth token' });
      return () => setLoading(false);
    }

    (async () => {
      const res = await fetch(barPath);
      if (res.status !== 200) {
        throw new Error('Downloading Barfile is failed');
      }

      // download to memory
      const buff = await res.arrayBuffer();
      console.log(`Downloaded ${buff.byteLength} bytes`);

      const boxURL = `${config.targetCellUrl}${boxName}`;

      const sendRes = await fetch(boxURL, {
        method: 'MKCOL',
        body: buff,
        headers: {
          Authorization: `Bearer ${access_token}`,
          'Content-Type': 'application/zip',
        },
        redirect: 'manual',
      });

      if (sendRes.status === 202) {
        // Accepted
        // const boxStatusURL = sendRes.headers.get('location');
        pollingStatusID = setInterval(async () => {
          const boxStatus = await fetch(boxURL, {
            headers: {
              Authorization: `Bearer ${access_token}`,
            },
          }).then(res => res.json());
          const statusText =
            boxStatus.box.status === 'ready'
              ? boxStatus.box.status
              : `${boxStatus.box.status} ${boxStatus.box.progress}`;
          updateInstallStatus(statusText);

          if (boxStatus.box.status === 'ready') {
            setLoading(false);
          }
        }, 500);
      }
    }).catch(err => setError(err));

    return function cleanup() {
      if (pollingStatusID !== -1) {
        clearInterval(pollingStatusID);
      }
    };
  });

  return { loading, error, status };
}
