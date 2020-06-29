import React, { createContext, useContext, useState } from 'react';
import PropTypes from 'prop-types';

const PersoniumConfigContext = createContext({
  appCellUrl: null,
  targetCellUrl: null,
});

export function usePersoniumConfig() {
  const [config] = useContext(PersoniumConfigContext);
  return { appCellUrl: config.appCellUrl, targetCellUrl: config.targetCellUrl };
}

export function PersoniumConfigProvider({ config, setConfig, children }) {
  return (
    <PersoniumConfigContext.Provider value={[config, setConfig]}>
      {children}
    </PersoniumConfigContext.Provider>
  );
}

PersoniumConfigProvider.propTypes = {
  config: PropTypes.objectOf(
    PropTypes.shape({
      appCellUrl: PropTypes.string,
      targetCellUrl: PropTypes.string,
    })
  ),
  setConfig: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
};
