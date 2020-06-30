import React, { useCallback, useState, useEffect } from 'react';
import { ProfileCard } from './ProfileCard';
import {
  usePersoniumAuthentication,
  usePersoniumConfig,
} from './lib/Personium';

function BoxView() {
  const { config } = usePersoniumConfig();
  const { auth } = usePersoniumAuthentication();
  const [boxUrl, setBoxUrl] = useState('');

  useEffect(() => {
    const schemaUrl = null;
    (async () => {
      const { access_token } = auth;
      const requestUrl = new URL(`${config.targetCellUrl}__box`);
      if (schemaUrl !== null) {
        requestUrl.searchParams.set('schema', schemaUrl);
      }
      const res = await fetch(requestUrl, {
        headers: { Authorization: `Bearer ${access_token}` },
      });

      if (!res.ok) throw res;
      return res.headers.get('location');
    })();
  });
}

export function UserPage() {
  const { logout } = usePersoniumAuthentication();

  const handleClick = useCallback(
    e => {
      e.preventDefault();
      logout();
    },
    [logout]
  );

  return (
    <>
      <h2>User Page</h2>
      <ProfileCard />
      <BoxView />
      <div style={{ padding: 8 }}>
        <a href="#" onClick={handleClick}>
          Logout
        </a>
      </div>
    </>
  );
}
