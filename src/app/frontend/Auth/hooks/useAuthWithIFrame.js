import { useCallback, useEffect, useState, useRef } from 'react';

export function useAuthWithIFrame() {
  const iframeRef = useRef(null);
  const [result, setResult] = useState(null);

  const handleMessage = useCallback(
    event => {
      // checking event source is equal to iframe
      if (
        iframeRef.current === null ||
        iframeRef.current.contentWindow !== event.source
      ) {
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

  return { result, iframeRef };
}
