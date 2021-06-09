import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import {
  usePersoniumAuthentication,
  usePersoniumConfig,
} from '../lib/Personium';
import { useAuthWithIFrame } from './hooks/useAuthWithIFrame';

export function IFrameAuthPage({ cellUrl, onLogin }) {
  const { config } = usePersoniumConfig();
  const { result, iframeRef } = useAuthWithIFrame();
  const { requestAuthURL, authWithAuthCode } = usePersoniumAuthentication(
    config.appCellUrl
  );

  const [loading, setLoading] = useState(true);
  const [redirectedUrl, setRedirectedUrl] = useState(null);

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
      onLogin();
      console.log('authenticated');
    });
  }, [result, onLogin, cellUrl, authWithAuthCode]);

  if (loading) {
    return <div>Loading AuthWithIFrame...</div>;
  }

  if (redirectedUrl === null) {
    return <div>Youre already logged in</div>;
  }

  return (
    <div>
      <h2>AuthPage</h2>
      <h3>This is openning iframe to authorization</h3>
      <iframe
        style={{ width: '100%' }}
        ref={iframeRef}
        src={redirectedUrl}
        name="oauth_iframe"
      />
    </div>
  );
}

IFrameAuthPage.propTypes = {
  cellUrl: PropTypes.string.isRequired,
  onLogin: PropTypes.func.isRequired,
};
