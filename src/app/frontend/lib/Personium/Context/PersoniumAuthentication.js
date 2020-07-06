import React, { createContext, useCallback, useContext, useState } from 'react';
import { Route, Redirect } from 'react-router-dom';
import PropTypes from 'prop-types';
import { usePersoniumConfig } from './PersoniumConfig';

const PersoniumAuthenticationContext = createContext({
  auth: null,
  setAuth: null,
});

export function usePersoniumAuthentication(appCellUrl) {
  const { auth, setAuth } = useContext(PersoniumAuthenticationContext);

  const requestAuthURL = useCallback(
    async (cellUrl, redirect_uri = '/__/auth/receive_redirect') => {
      const authUrl = new URL(`${appCellUrl}__/auth/start_oauth2`);
      authUrl.searchParams.set('cellUrl', cellUrl);

      const res = await fetch(authUrl, {
        credentials: 'include',
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      console.log(res.headers);

      if (!res.ok) {
        throw {
          status: res.status,
          statusText: res.statusText,
        };
      }

      const oauthFormURL = new URL(res.url);
      const redirectURI = oauthFormURL.searchParams.get('redirect_uri');
      const redirectURIobject = new URL(decodeURI(redirectURI));
      redirectURIobject.pathname = redirect_uri;
      oauthFormURL.searchParams.set(
        'redirect_uri',
        encodeURI(redirectURIobject.toString())
      );
      return oauthFormURL;
    },
    [appCellUrl]
  );

  const authWithCredentials = useCallback(
    async cellUrl => {
      const oauthFormURL = await requestAuthURL(cellUrl);

      const res = await fetch(oauthFormURL, {
        credentials: 'include',
        method: 'GET',
      });

      if (!res.ok) {
        // network error;
        throw {
          status: res.status,
          statusText: res.statusText,
        };
      }

      setAuth(await res.json());
      return null;
    },
    [setAuth, requestAuthURL]
  );

  const authWithAuthCode = useCallback(
    async (cellUrl, code, state) => {
      const authUrl = new URL(`${appCellUrl}__/auth/receive_redirect`);
      authUrl.searchParams.set('cellUrl', cellUrl);
      authUrl.searchParams.set('code', code);
      authUrl.searchParams.set('state', state);
      const res = await fetch(authUrl, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      if (!res.ok) {
        throw {
          status: res.status,
          statusText: res.statusText,
        };
      }
      setAuth(await res.json());
      return null;
    },
    [setAuth, appCellUrl]
  );

  const authWithROPC = useCallback(
    async (cellUrl, username, password) => {
      const data = new URLSearchParams();
      data.set('grant_type', 'password');
      data.set('username', username);
      data.set('password', password);
      const res = await fetch(`${cellUrl}__token`, {
        credentials: 'include',
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: data,
      });

      if (!res.ok) {
        throw {
          status: res.status,
          statusText: res.statusText,
        };
      }
      setAuth(await res.json());
      return null;
    },
    [setAuth]
  );

  const logout = useCallback(async () => {
    setAuth(null);
    return null;
  }, [setAuth]);

  return {
    auth,
    requestAuthURL,
    authWithCredentials,
    authWithROPC,
    authWithAuthCode,
    logout,
  };
}

export function PersoniumAuthProvider({ children }) {
  const [auth, setAuth] = useState(null);
  return (
    <PersoniumAuthenticationContext.Provider value={{ auth, setAuth }}>
      {children}
    </PersoniumAuthenticationContext.Provider>
  );
}

PersoniumAuthProvider.propTypes = {
  children: PropTypes.element.isRequired,
};

export function PrivateRoute({ authPath, children, ...rest }) {
  const { config } = usePersoniumConfig();
  const { auth } = usePersoniumAuthentication(config.appCellUrl);
  return (
    <Route
      {...rest}
      render={({ location }) =>
        auth !== null ? (
          children
        ) : (
          <Redirect to={{ pathname: authPath, state: { from: location } }} />
        )
      }
    />
  );
}

PrivateRoute.propTypes = {
  authPath: PropTypes.string.isRequired,
  children: PropTypes.element.isRequired,
};
