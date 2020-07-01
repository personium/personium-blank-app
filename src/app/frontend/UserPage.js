import React, { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import { ProfileCard } from './ProfileCard';
import { usePersoniumAuthentication } from './lib/Personium';

import { useBoxUrl } from './lib/Personium/Context/PersoniumBox';
import { usePersoniumBoxInstall } from './lib/Personium/Util/usePersoniumBoxInstall';

import { AppConstant } from './Constants';

function BoxInstallView({ onRefresh }) {
  const { error, loading, installBar, status } = usePersoniumBoxInstall(
    AppConstant.barFileUrl,
    AppConstant.installBoxName
  );
  const [started, setStarted] = useState(false);

  const handleClickBoxInstallation = useCallback(() => {
    setStarted(true);
    installBar().then(() => {
      console.log('install started');
    });
  }, [installBar, setStarted]);

  if (!started) {
    return (
      <div>
        <h4>Box is not installed</h4>
        <button onClick={handleClickBoxInstallation}>Box Install</button>
      </div>
    );
  }

  if (loading)
    return (
      <div>
        <h4>Box Installing...</h4>
        {status.map(({ time, text }) => {
          <p key={`status-${time}`}>
            {time}: {text}
          </p>;
        })}
      </div>
    );

  if (error)
    return (
      <div>
        <h4>Box Install failed</h4>
        <p>{error.text}</p>
      </div>
    );

  return (
    <div>
      <h4>Box installation is executed</h4>
      <button onClick={onRefresh}>Refresh</button>
    </div>
  );
}

BoxInstallView.propTypes = {
  onRefresh: PropTypes.func.isRequired,
};

function BoxView() {
  const { loading, error, refetchBoxUrl, boxUrl } = useBoxUrl();

  if (loading) return <p>Loading</p>;

  if (error) return <p>{JSON.stringify(error)}</p>;

  if (boxUrl === null) {
    return <BoxInstallView onRefresh={refetchBoxUrl} />;
  }

  return <p>{boxUrl}</p>;
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
