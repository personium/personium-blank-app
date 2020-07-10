import React from 'react';
import { Link } from 'react-router-dom';

export function Top() {
  return (
    <div>
      <h2>Top Page</h2>
      <Link to="/user">UserPage</Link>
    </div>
  );
}
