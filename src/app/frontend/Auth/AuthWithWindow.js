import React, { useEffect, useState, useCallback } from 'react';
import PropTypes from 'prop-types';

import {
  usePersoniumAuthentication,
  usePersoniumConfig,
} from '../lib/Personium';

import { useAuthWithWindow } from './hooks/useAuthWithWindow';

export function WindowAuthPage({ cellUrl, onLogin }) {
  const { config } = usePersoniumConfig();
  const { result, openWindow, closeWindow } = useAuthWithWindow();
  const { authWithCredentials, authWithAuthCode } = usePersoniumAuthentication(
    config.appCellUrl
  );

  const [loading, setLoading] = useState(true);
  const [redirectedUrl, setRedirectedUrl] = useState(null);

  const handleOpenWindow = useCallback(() => {
    openWindow(redirectedUrl);
  }, [redirectedUrl, openWindow]);

  useEffect(() => {
    console.log(cellUrl);
    setLoading(true);
    authWithCredentials(cellUrl)
      .then(result => {
        if (result !== null) {
          setRedirectedUrl(result);
        }
        setLoading(false);
      })
      .catch(err => {
        console.log(err);
        setLoading(false);
      });
    return function cleanup() {
      setLoading(false);
    };
  }, [authWithCredentials, cellUrl]);

  useEffect(() => {
    if (result === null) {
      return () => {};
    }
    console.log(result);
    authWithAuthCode(cellUrl, result.code, result.state).then(() => {
      closeWindow();
      onLogin();
      console.log('authenticated');
    });
  }, [result, onLogin, cellUrl, authWithAuthCode, closeWindow]);

  if (loading) {
    return <div>Loading AuthWithWindow...</div>;
  }

  if (redirectedUrl === null) {
    return <div>Youre already logged in</div>;
  }

  return (
    <div>
      <h2>AuthPage</h2>
      <h3>This demo is openning new tab to authorization </h3>
      <button onClick={handleOpenWindow}>OpenWindow</button>
    </div>
  );
}

WindowAuthPage.propTypes = {
  cellUrl: PropTypes.string.isRequired,
  onLogin: PropTypes.func.isRequired,
};
