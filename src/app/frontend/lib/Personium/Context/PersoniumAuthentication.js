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

  const authWithCredentials = useCallback(
    async cellUrl => {
      const authUrl = new URL(`${appCellUrl}__/auth/start_oauth2`);
      authUrl.searchParams.set('cellUrl', cellUrl);

      const res = await fetch(authUrl, {
        credentials: 'include',
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      if (!res.ok) {
        // network error;
        throw {
          status: res.status,
          statusText: res.statusText,
        };
      }

      if (res.headers.get('Content-Type') !== 'application/json') {
        // not authorized
        const oauthFormURL = new URL(res.url);
        const redirectURI = oauthFormURL.searchParams.get('redirect_uri');
        const redirectURIobject = new URL(decodeURI(redirectURI));
        // change redirect_uri
        redirectURIobject.pathname = '/__/auth/receive_redirect_page';
        oauthFormURL.searchParams.set(
          'redirect_uri',
          encodeURI(redirectURIobject.toString())
        );
        return oauthFormURL;
      }

      setAuth(await res.json());
      return null;
    },
    [setAuth]
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
    [setAuth]
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

  return { auth, authWithCredentials, authWithROPC, authWithAuthCode, logout };
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
