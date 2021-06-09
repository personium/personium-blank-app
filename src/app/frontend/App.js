import React, { useEffect, useState } from 'react';
import { BrowserRouter, Switch, Route, Link } from 'react-router-dom';

import { Top } from './Top';
import { UserPage } from './UserPage';
import { AppConstant } from './Constants';
import {
  PersoniumAuthProvider,
  PersoniumConfigProvider,
  PrivateRoute,
  usePersoniumConfig,
} from './lib/Personium';

import { PersoniumAuthPage, PersoniumOAuthCallback } from './Auth';
import { PersoniumBoxProvider } from './lib/Personium/Context/PersoniumBox';

function AppInitializer({ handleInitialized }) {
  const { setConfig } = usePersoniumConfig();

  useEffect(() => {
    // Boot Script
    // const currentHash = location.hash.replace(/^#\/?/g, '#');
    const currentHash = location.hash;

    let targetCell = null;
    let launchArgs = {};
    let nextHash = currentHash.replace(/^#/g, '');

    // load cell parameter from localStorage
    if (localStorage.getItem('lastLoginCell')) {
      targetCell = localStorage.getItem('lastLoginCell');
    }

    // handling cell parameter
    if (currentHash.startsWith('#cell')) {
      const hashParams = new URLSearchParams(currentHash.replace(/^#\/?/g, ''));
      if (hashParams.has('cell')) {
        targetCell = hashParams.get('cell');
        hashParams.delete('cell');
      }
      nextHash = `${hashParams.toString()}`;
    }

    window.history.replaceState(null, null, location.search + '#' + nextHash);

    setConfig.rawSetConfig(c => {
      const newState = Object.assign({}, c, {
        targetCellUrl: targetCell,
        appCellUrl: AppConstant.cellUrl,
        launchArgs,
      });
      console.log(newState);
      return newState;
    });
    handleInitialized(true);
  }, [setConfig, handleInitialized]);

  return null;
}

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
  const [initialized, setInitialized] = useState(false);

  return (
    <PersoniumConfigProvider>
      {!initialized ? (
        <>
          <AppInitializer handleInitialized={setInitialized} />
          <div>Initializing...</div>
        </>
      ) : (
        <BrowserRouter basename="/__/front/app">
          <PersoniumAuthProvider>
            <Switch>
              <Route path="/personium_auth_callback" exact>
                <PersoniumOAuthCallback />
              </Route>
              <Route path="*">
                <PersoniumBoxProvider>
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
                  <AppFooter />
                </PersoniumBoxProvider>
              </Route>
            </Switch>
          </PersoniumAuthProvider>
        </BrowserRouter>
      )}
    </PersoniumConfigProvider>
  );
}
