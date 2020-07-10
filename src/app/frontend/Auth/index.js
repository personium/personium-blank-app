import React, { useRef, useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';

import { useLocation, useHistory } from 'react-router-dom';

import {
  usePersoniumAuthentication,
  usePersoniumConfig,
} from '../lib/Personium';

function UserCellInput({ onSubmit, targetCellUrl }) {
  const [inputVal, setInputVal] = useState(targetCellUrl);

  const inputRef = useRef(null);
  useEffect(() => {
    inputRef.current.focus();
  }, [inputRef]);

  return (
    <form
      onSubmit={e => {
        e.preventDefault();
        onSubmit(inputVal);
      }}
    >
      <input
        ref={inputRef}
        type="text"
        onChange={e => setInputVal(e.target.value)}
        value={inputVal}
      />
      <button type="submit">Submit</button>
    </form>
  );
}

UserCellInput.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  targetCellUrl: PropTypes.string.isRequired,
};

function PersoniumROPCForm({ cellUrl, onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { authWithROPC } = usePersoniumAuthentication();

  const handleSubmit = useCallback(
    e => {
      e.preventDefault();
      authWithROPC(cellUrl, username, password).then(() => {
        onLogin();
        console.log('authenticated');
      });
    },
    [username, password, cellUrl, authWithROPC, onLogin]
  );

  const inputRef = useRef(null);
  useEffect(() => {
    inputRef.current.focus();
  }, []);

  return (
    <>
      <form onSubmit={handleSubmit}>
        <label>
          Username:
          <input
            ref={inputRef}
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
          />
        </label>
        <br />
        <label>
          Password:
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
        </label>
        <br />
        <button type="submit">Submit</button>
      </form>
    </>
  );
}

PersoniumROPCForm.propTypes = {
  cellUrl: PropTypes.string.isRequired,
  onLogin: PropTypes.func.isRequired,
};

export function PersoniumAuthPage({ canSkip = true }) {
  const { config, setConfig } = usePersoniumConfig();
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

  const [inputStep, setInputStep] = useState(
    canSkip && config.targetCellUrl !== null ? 1 : 0
  );

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

  // start ROPC
  return (
    <>
      <h2>AuthPage</h2>
      <h3>Please Input ROPC info (username/password)</h3>
      <PersoniumROPCForm cellUrl={config.targetCellUrl} onLogin={handleLogin} />
      <a href="#" onClick={handlePrev}>
        return to cellUrl input
      </a>
    </>
  );
}

PersoniumAuthPage.propTypes = {
  canSkip: PropTypes.bool.isRequired,
};
