import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
} from 'react';
import { useHistory, useLocation, Route, Redirect } from 'react-router-dom';
import PropTypes from 'prop-types';

const PersoniumAuthenticationContext = createContext({});

export function usePersoniumAuthentication() {
  const [auth, setAuth] = useContext(PersoniumAuthenticationContext);

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
  return { auth, authWithROPC };
}

export function PersoniumAuthProvider({ children }) {
  const [auth, setAuth] = useState(null);
  return (
    <PersoniumAuthenticationContext.Provider value={[auth, setAuth]}>
      {children}
    </PersoniumAuthenticationContext.Provider>
  );
}

function UserCellInput({ onSubmit }) {
  const [inputVal, setInputVal] = useState('');
  const inputRef = useRef(null);
  useEffect(() => {
    inputRef.current.focus();
  }, [inputRef]);

  return (
    <form onSubmit={() => onSubmit(inputVal)}>
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
};

function PersoniumROPCForm({ cellUrl, onLogin, onCancel }) {
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
        <input
          ref={inputRef}
          type="username"
          value={username}
          onChange={e => setUsername(e.target.value)}
        />
        <br />
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
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

export function PersoniumAuthPage() {
  const [userCellUrl, setUserCell] = useState(null);
  const location = useLocation();
  const history = useHistory();

  const handleSubmit = useCallback(
    url => {
      // ToDo: URL validation
      setUserCell(url);
    },
    [setUserCell]
  );

  const handleLogin = useCallback(() => {
    const { from } = location.state || { from: { pathname: '/' } };
    history.replace(from);
  }, [location, history]);

  if (userCellUrl === null) {
    return (
      <>
        <h2>Please input cell url</h2>
        <UserCellInput onSubmit={handleSubmit}></UserCellInput>
      </>
    );
  }

  // start ROPC
  return (
    <>
      <h2>Please Input ROPC info (username/password)</h2>
      <PersoniumROPCForm cellUrl={userCellUrl} onLogin={handleLogin} />
    </>
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
