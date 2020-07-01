import React, { createContext, useContext, useState } from 'react';
import { Route, Redirect } from 'react-router-dom';
import PropTypes from 'prop-types';

const PersoniumAuthenticationContext = createContext({
  auth: null,
  setAuth: null,
});

export function usePersoniumAuthentication() {
  const { auth, setAuth } = useContext(PersoniumAuthenticationContext);

  const authWithROPC = async (cellUrl, username, password) => {
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
  };

  const logout = async () => {
    setAuth(null);
  };
  return { auth, authWithROPC, logout };
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
  const { auth } = usePersoniumAuthentication();
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
