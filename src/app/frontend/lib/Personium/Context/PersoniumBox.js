import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
  useRef,
} from 'react';
import PropTypes from 'prop-types';
import { usePersoniumAuthentication } from './PersoniumAuthentication';
import { usePersoniumConfig } from './PersoniumConfig';

const defaultBoxContext = {
  loading: true,
  error: null,
  boxUrl: null,
  refetchBoxUrl: null,
};

const PersoniumBoxContext = createContext(defaultBoxContext);

export function useBoxUrl() {
  const { loading, error, boxUrl, refetchBoxUrl } = useContext(
    PersoniumBoxContext
  );

  return { loading, error, boxUrl, refetchBoxUrl };
}

export function PersoniumBoxProvider(props) {
  const { config } = usePersoniumConfig();
  const { auth } = usePersoniumAuthentication(config.appCellUrl);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [boxUrl, setBoxUrl] = useState(null);

  const unmounted = useRef(false);
  const prevSchemaUrl = useRef('');
  const prevCellUrl = useRef('');

  const updateBoxUrl = useCallback(
    async (cellUrl, schemaUrl) => {
      if (auth === null || auth.access_token === undefined) {
        throw 'not authorized';
      }
      const access_token = auth.access_token;

      const requestUrl = new URL(`${cellUrl}__box`);
      if (schemaUrl !== null) {
        requestUrl.searchParams.set('schema', schemaUrl);
      }
      const res = await fetch(requestUrl, {
        headers: { Authorization: `Bearer ${access_token}` },
        redirect: 'manual',
      });

      if (!res.ok) {
        // ToDo: Is this Personium core bug?
        if (res.status !== 403) {
          if (!unmounted.current) {
            throw { status: res.status, statusText: res.statusText };
          }
        }
      }

      return res.headers.get('location');
    },
    [auth]
  );

  const refetchBoxUrl = useCallback(() => {
    const schemaUrl = config.appCellUrl;
    const cellUrl = config.targetCellUrl;
    setLoading(true);

    updateBoxUrl(cellUrl, schemaUrl)
      .then(url => {
        console.log('updated box url');
        prevSchemaUrl.current = schemaUrl;
        prevCellUrl.current = cellUrl;
        if (!unmounted.current) {
          setError(null);
          setBoxUrl(url);
          setLoading(false);
        }
      })
      .catch(err => {
        console.log('updating boxUrl failed', err);
        if (!unmounted.current) {
          setError(err);
          setBoxUrl(null);
          setLoading(false);
        }
      });
  }, [config.appCellUrl, config.targetCellUrl, updateBoxUrl]);

  useEffect(
    () => {
      unmounted.current = false;
      if (
        config.appCellUrl === prevSchemaUrl.current &&
        config.targetCellUrl === prevCellUrl.current
      ) {
        // do nothing
        return () => {};
      }

      refetchBoxUrl();

      return function cleanup() {
        unmounted.current = true;
      };
    },
    // dependencies (when appCellUrl or targetCellUrl is changed, refresh boxUrl)
    [config.appCellUrl, config.targetCellUrl, refetchBoxUrl]
  );

  return (
    <PersoniumBoxContext.Provider
      value={{ loading, error, boxUrl, refetchBoxUrl }}
    >
      {props.children}
    </PersoniumBoxContext.Provider>
  );
}

PersoniumBoxProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
