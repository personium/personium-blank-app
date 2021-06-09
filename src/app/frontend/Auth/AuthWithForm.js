import React, { useCallback, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import {
  usePersoniumAuthentication,
  usePersoniumConfig,
} from '../lib/Personium';

export function FormAuthPage({ cellUrl, onLogin }) {
  const { config } = usePersoniumConfig();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { authWithROPC } = usePersoniumAuthentication(config.appCellUrl);

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
      <h3>Please Input ROPC info (username/password)</h3>

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

FormAuthPage.propTypes = {
  cellUrl: PropTypes.string.isRequired,
  onLogin: PropTypes.func.isRequired,
};
