import React from 'react';
import { HashRouter, Switch, Route, Link } from 'react-router-dom';

import { Top } from './Top';
import { UserPage } from './UserPage';
import {
  PersoniumAuthPage,
  PersoniumAuthProvider,
  PrivateRoute,
} from './lib/Personium';

function AppHeader() {
  return (
    <Link to="/">
      <h1>Personium Blank App</h1>
    </Link>
  );
}

function AppFooter() {
  return (
    <div
      style={{
        position: 'fixed',
        textAlign: 'center',
        bottom: 0,
        width: '100vw',
        paddingBottom: 8,
      }}
    >
      This app is based on{' '}
      <a href="https://github.com/personium/personium-blank-app">
        personium-blank-app
      </a>
    </div>
  );
}

export function App() {
  return (
    <HashRouter>
      <PersoniumAuthProvider>
        <AppHeader />
        <Switch>
          <Route path="/" exact>
            <Top />
          </Route>
          <PrivateRoute path="/user" authPath="/login">
            <UserPage />
          </PrivateRoute>
          <Route path="/login">
            <PersoniumAuthPage />
          </Route>
          <Route path="*">
            <h2>Does not match any Route</h2>
            <div>
              <Link to="/">Top</Link>
            </div>
          </Route>
        </Switch>
      </PersoniumAuthProvider>
      <AppFooter />
    </HashRouter>
  );
}
