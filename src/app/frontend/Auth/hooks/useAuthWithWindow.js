import { useCallback, useRef, useState, useEffect } from 'react';

export function useAuthWithWindow() {
  const windowRef = useRef(null);
  const [result, setResult] = useState(null);

  const openWindow = useCallback(authUrl => {
    if (windowRef.current !== null) window.close(windowRef.current);
    windowRef.current = window.open(authUrl);
  }, []);

  const closeWindow = useCallback(() => {
    window.close(windowRef.current);
  }, []);

  const handleMessage = useCallback(
    event => {
      // checking event source is equal to iframe
      if (windowRef.current === null || windowRef.current !== event.source) {
        // do nothing
        return;
      }

      // it should be same origin and then you can call function in event.source.
      const dat =
        event.source.getCodeAndState && event.source.getCodeAndState();
      setResult(dat);
    },
    [setResult]
  );

  useEffect(() => {
    window.addEventListener('message', handleMessage);
    return function cleanup() {
      window.removeEventListener('message', handleMessage);
    };
  }, [handleMessage]);

  return { result, openWindow, closeWindow };
}
