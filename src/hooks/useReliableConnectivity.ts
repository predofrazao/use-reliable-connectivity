import { useCallback, useEffect, useRef, useState } from "react";

export type BackgroundHandlerFn = (isOnBackground: boolean) => void;

export type ConnectionConfig = {
  /**
   * The initial state to be used while the first check is being performed.
   * @default true
   */
  initialConnectionState?: boolean;

  /**
   * Timeout in milliseconds for the connection reachability check.
   * @default 3000
   */
  timeout?: number;

  /**
   * URL to check for connection reachability.
   * @default "https://clients3.google.com/generate_204"
   */
  reachabilityUrl?: string;

  /**
   * Expected response status codes from the connection reachability URL.
   * @default [204]
   */
  expectedResponseStatus?: number[];

  /**
   * Connection reachability check interval in milliseconds.
   * @default 1000
   */
  interval?: number;

  /**
   * Connection reachability check interval in milliseconds when application is on background. It will be used only if `backgroundSetup` is defined.
   * @default 10000
   */
  backgroundInterval?: number;

  /**
   * Used to configure the handler for background state.
   * @example
   * const isConnected = useReliableConnectivity({
   *  backgroundSetup: (backgroundHandler) => {
   *    function visibilityChangeHandler() {
   *      backgroundHandler(document.visibilityState === "hidden");
   *    }
   *
   *    window.addEventListener("visibilitychange", visibilityChangeHandler, false);
   *
   *    return () => {
   *      window.removeEventListener("visibilitychange", visibilityChangeHandler);
   *    }
   *  }),
   * });
   * @default undefined
   */
  backgroundSetup?: (backgroundHandler: BackgroundHandlerFn) => (() => void) | void;
};

export const useReliableConnectivity = ({
  initialConnectionState = true,
  timeout = 3000,
  reachabilityUrl = "https://clients3.google.com/generate_204",
  expectedResponseStatus = [204],
  interval = 1000,
  backgroundInterval = 10000,
  backgroundSetup,
}: ConnectionConfig) => {
  // Refs
  const reachabilityIntervalRef = useRef<number | null>(null);

  // States
  const [isConnected, setIsConnected] = useState(initialConnectionState);

  // Callbacks
  /**
   * Fetches the reachability URL and checks if the response status is in the expected response status.
   * @returns {Promise<boolean>} - Returns `true` if the response status is in the `expectedResponseStatus`, `false` otherwise.
   */
  const fetchReachabilityUrl = useCallback(async () => {
    const abortController = new AbortController();
    const abort = setTimeout(() => abortController.abort("Reachability timed out."), timeout);

    try {
      const response = await fetch(reachabilityUrl, {
        signal: abortController.signal,
        cache: "no-store",
      });

      if (!expectedResponseStatus.includes(response.status)) {
        throw new Error(`Reachability returned status ${response.status}, that is not expected.`);
      }

      return true;
    } catch (e) {
      if (e instanceof Error) {
        console.error(e.message);
      }

      return false;
    } finally {
      clearTimeout(abort);
    }
  }, [reachabilityUrl, timeout, expectedResponseStatus]);

  /**
   * Sets the reachability interval.
   */
  const setReachabilityInterval = useCallback(
    (interval: number) => {
      reachabilityIntervalRef.current = setInterval(
        async () => setIsConnected(await fetchReachabilityUrl()),
        interval
      );
    },
    [fetchReachabilityUrl]
  );

  /**
   * Clears the reachability interval.
   */
  const clearReachabilityInterval = useCallback(() => {
    if (reachabilityIntervalRef.current) {
      clearInterval(reachabilityIntervalRef.current);
      reachabilityIntervalRef.current = null;
    }
  }, []);

  /**
   * Background handler to set the reachability interval based on the app state. Used as callback of `backgroundSetup`.
   */
  const _backgroundHandler: BackgroundHandlerFn = useCallback(
    (isOnBackground) => {
      clearReachabilityInterval();
      setReachabilityInterval(isOnBackground ? backgroundInterval : interval);
    },
    [clearReachabilityInterval, setReachabilityInterval, backgroundInterval, interval]
  );

  // Effects
  useEffect(() => {
    const unsubscribe = backgroundSetup?.(_backgroundHandler);
    return () => unsubscribe && unsubscribe();
  }, [backgroundSetup, _backgroundHandler]);

  useEffect(() => {
    setReachabilityInterval(interval);
    return clearReachabilityInterval;
  }, [setReachabilityInterval, interval, clearReachabilityInterval]);

  return isConnected;
};
