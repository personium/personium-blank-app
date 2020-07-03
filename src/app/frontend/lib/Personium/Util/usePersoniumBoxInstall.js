import { useState, useCallback } from 'react';
import { usePersoniumAuthentication, usePersoniumConfig } from '../Context';

export function usePersoniumBoxInstall(barPath = '__/app.bar', boxName) {
  const { config } = usePersoniumConfig();
  const { auth } = usePersoniumAuthentication(config.appCellUrl);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState([]);

  const updateInstallStatus = useCallback(
    text => {
      setStatus(c => [...c, { time: Date.now(), text }]);
    },
    [setStatus]
  );

  const installBar = useCallback(async () => {
    let pollingStatusID = -1;
    setLoading(true);

    const { access_token } = auth;

    if (access_token === undefined) {
      setError({ text: 'no auth token' });
      setLoading(false);
      return;
    }
    const res = await fetch(barPath);
    if (res.status !== 200) {
      setError({ text: 'Downloading Barfile is failed' });
      setLoading(false);
      return;
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
      let timeoutID = setTimeout(() => {
        if (pollingStatusID !== -1) {
          clearInterval(pollingStatusID);
          pollingStatusID = -1;
          timeoutID = -1;
          setLoading(false);
          setError({ text: 'timeout' });
          updateInstallStatus('timeout');
        }
      }, 30000);
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
          if (pollingStatusID !== -1) {
            clearInterval(pollingStatusID);
            pollingStatusID = -1;
          }
          if (timeoutID !== -1) {
            clearTimeout(timeoutID);
            timeoutID = -1;
          }
        }
      }, 500);
    }
  }, [
    setLoading,
    setError,
    auth,
    barPath,
    boxName,
    updateInstallStatus,
    config.targetCellUrl,
  ]);

  return { loading, error, status, installBar };
}
