import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import {
  HashRouter,
  Switch,
  Route,
  Link,
  Redirect,
  useLocation,
  useHistory,
} from 'react-router-dom';

import { Top } from './Top';
import { UserPage } from './UserPage';
import {
  PersoniumAuthProvider,
  usePersoniumAuthentication,
} from './PersoniumAuthentication';

function PrivateRoute({ authPath, children, ...rest }) {
  const [isAuthenticated] = usePersoniumAuthentication();
  return (
    <Route
      {...rest}
      render={({ location }) =>
        isAuthenticated ? (
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

function FakeAuthPage() {
  const setAuthed = usePersoniumAuthentication().pop();
  const location = useLocation();
  const history = useHistory();

  const { from } = location.state || { from: { pathname: '/' } };

  const handleLogin = () => {
    setAuthed(true);
    history.replace(from);
  };
  return <button onClick={handleLogin}>fakeLogin</button>;
}

function NotMatch() {
  return (
    <>
      <h1>Does not match any Route</h1>
      <div>
        <Link to="/">Top</Link>
      </div>
    </>
  );
}

export function App() {
  return (
    <HashRouter>
      <PersoniumAuthProvider>
        <Switch>
          <Route path="/" exact>
            <Top />
          </Route>
          <PrivateRoute path="/user" authPath="/login">
            <UserPage />
          </PrivateRoute>
          <Route path="/login" component={FakeAuthPage} />
          <Route path="*">
            <NotMatch />
          </Route>
        </Switch>
      </PersoniumAuthProvider>
    </HashRouter>
  );
}
