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
  const { requestAuthURL, authWithAuthCode } = usePersoniumAuthentication(
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
    requestAuthURL(cellUrl, '/__/auth/receive_redirect_page')
      .then(result => {
        setRedirectedUrl(result);
        setLoading(false);
      })
      .catch(err => {
        console.log(err);
        setLoading(false);
      });
    return function cleanup() {
      setLoading(false);
    };
  }, [requestAuthURL, cellUrl]);

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
