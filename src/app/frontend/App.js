import React from 'react';
import { HashRouter, Switch, Route, Link } from 'react-router-dom';

import { Top } from './Top';

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
      <Switch>
        <Route path="/" exact>
          <Top />
        </Route>
        <Route path="*">
          <NotMatch />
        </Route>
      </Switch>
    </HashRouter>
  );
}
