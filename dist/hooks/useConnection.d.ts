export type BackgroundHandlerFn = (isOnBackground: boolean) => void;
export type ConnectionConfig = {
  /**
   * Initial connection state.
   * This state will be used to initialize the `isConnected` state, while the first check is being performed.
   * @default true
   */
  initialConnectionState?: boolean;
  /**
   * Timeout in milliseconds for the reachability check.
   * @default 3000
   */
  timeout?: number;
  /**
   * URL to check for reachability.
   * @default "https://clients3.google.com/generate_204"
   */
  reachabilityUrl?: string;
  /**
   * Expected response status codes from the reachability URL.
   * @default [204]
   */
  expectedResponseStatus?: number[];
  /**
   * Reachability check interval in milliseconds.
   * @default 1000
   */
  interval?: number;
  /**
   * Reachability check interval in milliseconds when application is on background. It will be used only if `backgroundSetup` is defined.
   * @default 10000
   */
  backgroundInterval?: number;
  /**
   * Used to configure the handler for background state.
   * @example
   * const isConnected = useReliableConnectivity({
   *  backgroundSetup: (isOnBackground) => {
   *    function visibilityChangeHandler() {
   *      backgroundHandler(document.visibilityState === "hidden");
   *    }
   *
   *    window.addEventListener("visibilitychange", visibilityChangeHandler, false);
   *
   *    return () => {
   *      window.removeEventListener("visibilitychange", visibilityChangeHandler, false);
   *    }
   *  }),
   * });
   * @default undefined
   */
  backgroundSetup?: (backgroundHandler: BackgroundHandlerFn) => (() => void) | void;
};
export declare const useReliableConnectivity: ({
  initialConnectionState,
  timeout,
  reachabilityUrl,
  expectedResponseStatus,
  interval,
  backgroundInterval,
  backgroundSetup,
}: ConnectionConfig) => boolean;
