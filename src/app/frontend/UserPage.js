import React, { useCallback } from 'react';
import { ProfileCard } from './ProfileCard';
import { usePersoniumAuthentication } from './lib/Personium';

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
      <div style={{ padding: 8 }}>
        <a href="#" onClick={handleClick}>
          Logout
        </a>
      </div>
    </>
  );
}
