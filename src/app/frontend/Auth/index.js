import React, { useState, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';

import { useLocation, useHistory } from 'react-router-dom';

import {
  usePersoniumConfig,
  usePersoniumAuthentication,
} from '../lib/Personium';

import { UserCellInput } from './UserCellInput';

import { OpenAuthPage } from './AuthWithRedirect';
import { FormAuthPage } from './AuthWithForm';
import { IFrameAuthPage } from './AuthWithIFrame';
import { WindowAuthPage } from './AuthWithWindow';

export function PersoniumAuthPage({ canSkip = true }) {
  const { config, setConfig } = usePersoniumConfig();
  const { authWithAuthCode } = usePersoniumAuthentication(config.appCellUrl);
  const location = useLocation();
  const history = useHistory();

  const handleCellUrlInput = useCallback(
    url => {
      // ToDo: URL validation
      setConfig.setTargetCellUrl(url);
      setInputStep(1);
    },
    [setConfig]
  );

  const handleLogin = useCallback(() => {
    const { from } = location.state || { from: { pathname: '/' } };
    history.replace(from);
  }, [location, history]);

  const [inputStep, setInputStep] = useState(-1);

  const resetInputStep = useCallback(() => {
    setInputStep(canSkip && config.targetCellUrl !== null ? 1 : 0);
  }, [canSkip, config.targetCellUrl]);

  useEffect(() => {
    if (inputStep !== -1) return () => {};
    //initialize
    if (config.launchArgs === null) {
      resetInputStep();
      return () => {};
    }
    const { code, state } = config.launchArgs;
    if (code === undefined || state === undefined) {
      resetInputStep();
      return () => {};
    }
    authWithAuthCode(config.targetCellUrl, code, state)
      .then(() => {
        setConfig.setLaunchArgs(
          Object.assign({}, config.launchArgs, { code: null, state: null })
        );
        handleLogin();
      })
      .catch(() => {
        resetInputStep();
      });
    return () => {};
  });

  const handlePrev = useCallback(
    e => {
      e.preventDefault();
      setInputStep(0);
    },
    [setInputStep]
  );

  if (inputStep === 0) {
    return (
      <>
        <h2>AuthPage</h2>
        <h3>Please input cell url</h3>
        <UserCellInput
          onSubmit={handleCellUrlInput}
          targetCellUrl={config.targetCellUrl}
        />
      </>
    );
  }

  if (inputStep === 1) {
    return (
      <>
        <h2>AuthPage</h2>
        <h3>Choose authentication type</h3>
        <a
          href="#"
          onClick={e => {
            e.preventDefault();
            setInputStep(2);
          }}
        >
          with Resource Owner Password Credential (not App auth)
        </a>
        <br />
        <a
          href="#"
          onClick={e => {
            e.preventDefault();
            setInputStep(3);
          }}
        >
          with Authentication form in iframe (App auth)
        </a>
        <br />
        <a
          href="#"
          onClick={e => {
            e.preventDefault();
            setInputStep(4);
          }}
        >
          with Authentication form in new tab (App auth)
        </a>
        <br />
        <a
          href="#"
          onClick={e => {
            e.preventDefault();
            setInputStep(5);
          }}
        >
          with Authentication form in this tab (App auth)
        </a>
      </>
    );
  }

  // start ROPC
  return (
    <>
      <h2>AuthPage</h2>
      {(() => {
        switch (inputStep) {
          case 2:
            return (
              <FormAuthPage
                cellUrl={config.targetCellUrl}
                onLogin={handleLogin}
              />
            );
          case 3:
            return (
              <IFrameAuthPage
                cellUrl={config.targetCellUrl}
                onLogin={handleLogin}
              />
            );
          case 4:
            return (
              <WindowAuthPage
                cellUrl={config.targetCellUrl}
                onLogin={handleLogin}
              />
            );
          case 5:
            return <OpenAuthPage cellUrl={config.targetCellUrl} />;
        }
      })()}
      <a href="#" onClick={handlePrev}>
        return to cellUrl input
      </a>
    </>
  );
}

PersoniumAuthPage.propTypes = {
  canSkip: PropTypes.bool.isRequired,
};
