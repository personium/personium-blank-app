import React, { useEffect } from 'react';
import PropTypes from 'prop-types';

import {
  usePersoniumAuthentication,
  usePersoniumConfig,
} from '../lib/Personium';

export function OpenAuthPage({ cellUrl }) {
  const { config } = usePersoniumConfig();
  const { requestAuthURL } = usePersoniumAuthentication(config.appCellUrl);

  useEffect(() => {
    console.log(cellUrl);
    requestAuthURL(cellUrl, '/__/front/app')
      .then(result => {
        location.href = result;
      })
      .catch(err => {
        console.log(err);
      });
    return function cleanup() {};
  }, [requestAuthURL, cellUrl]);

  return (
    <div>
      <h4>Preparing AuthPage</h4>
      <div>Loading...</div>
    </div>
  );
}

OpenAuthPage.propTypes = {
  cellUrl: PropTypes.string.isRequired,
};
