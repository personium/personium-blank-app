import React, { useCallback, useEffect } from 'react';
import { useLocation, useHistory } from 'react-router-dom';

import {
  usePersoniumConfig,
  usePersoniumAuthentication,
} from '../lib/Personium';

export function PersoniumOAuthCallback() {
  const history = useHistory();
  const { search } = useLocation();
  const { config, setConfig } = usePersoniumConfig();
  const { authWithAuthCode } = usePersoniumAuthentication(config.appCellUrl);

  const tryAuth = useCallback(() => {
    const queryParams = new URLSearchParams(search);
    let targetCell = '';
    if (queryParams.has('cellUrl')) targetCell = queryParams.get('cellUrl');
    const code = queryParams.get('code');
    const state = queryParams.get('state');
    console.log('start auth ', targetCell, code, state);
    authWithAuthCode(targetCell, code, state).then(() => {
      console.log('auth done');
      setConfig.setTargetCellUrl(targetCell);
      history.replace('/');
    });
  }, [search, authWithAuthCode, history, setConfig]);

  useEffect(() => {
    console.log('start auth');
    tryAuth();
  });

  return <>OAuthCallback</>;
}
