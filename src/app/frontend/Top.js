import React from 'react';
import { Link } from 'react-router-dom';

export function Top() {
  return (
    <div>
      <h1>Top Page</h1>
      <Link to="/user">UserPage</Link>
    </div>
  );
}
