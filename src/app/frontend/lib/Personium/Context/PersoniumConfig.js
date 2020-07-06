import React, { createContext, useContext, useCallback, useState } from 'react';
import PropTypes from 'prop-types';

const defaultConfig = {
  appCellUrl: null,
  targetCellUrl: null,
  launchArgs: null,
};

const PersoniumConfigContext = createContext(defaultConfig);

export function usePersoniumConfig() {
  const [config, setConfig] = useContext(PersoniumConfigContext);

  return {
    config: {
      appCellUrl: config.appCellUrl,
      targetCellUrl: config.targetCellUrl,
      launchArgs: config.launchArgs,
    },
    setConfig: {
      setAppCellUrl: useCallback(
        appCellUrl => setConfig(c => Object.assign({}, c, { appCellUrl })),
        [setConfig]
      ),
      setTargetCellUrl: useCallback(
        targetCellUrl =>
          setConfig(c => Object.assign({}, c, { targetCellUrl })),
        [setConfig]
      ),
      setLaunchArgs: useCallback(
        launchArgs => setConfig(c => Object.assign({}, c, { launchArgs })),
        [setConfig]
      ),
      rawSetConfig: setConfig,
    },
  };
}

export function PersoniumConfigProvider({ children }) {
  const [config, setConfig] = useState(defaultConfig);
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
