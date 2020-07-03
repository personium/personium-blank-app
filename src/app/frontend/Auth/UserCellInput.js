import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';

export function UserCellInput({ onSubmit, defaultUrl }) {
  const [inputVal, setInputVal] = useState(defaultUrl);

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
  defaultUrl: PropTypes.string.isRequired,
};
