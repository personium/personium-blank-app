import React, { createContext, useContext, useState } from 'react';
import PropTypes from 'prop-types';

const PersoniumAuthenticationContext = createContext({});

export function usePersoniumAuthentication() {
  const [auth, setAuth] = useContext(PersoniumAuthenticationContext);
  return [auth, setAuth];
}

export function PersoniumAuthProvider({ children }) {
  const [auth, setAuth] = useState(false);
  return (
    <PersoniumAuthenticationContext.Provider value={[auth, setAuth]}>
      {children}
    </PersoniumAuthenticationContext.Provider>
  );
}

PersoniumAuthProvider.propTypes = {
  children: PropTypes.element.isRequired,
};
