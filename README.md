# use-reliable-connectivity

A (primitive but reliable) React hook to get user connection state based on network requests.

## 🫶 Support it

Liked it? You can show your support with a star ⭐! :)

## Motivation

While working on our company's app, we encountered some issues using `react-native-netinfo`, that relies on native APIs to detect connectivity, which was reporting false offline states on some devices. Unusual behaviors like these are difficult to track (especially in native applications) and was causing our app to incorrectly enter offline mode, disrupting the user experience.

To solve this, I decided to create a "primitive but reliable" way to check user's connectivity based on HTTP requests. This approach is simple yet reliable, as it tests actual connectivity rather than relying on device-level network status.
By sharing this library, I hope to help others developers who need accurate online/offline detection in their projects.

## How to use it?

You can use the hook in this way:

### Requirements

- The only requirement is that your application should be running on `React >= 16.0.0`.

### Install

```bash
# with npm
npm install use-reliable-connectivity

# with yarn
yarn add use-reliable-connectivity
```

### Usage

- Import the package in your app:

```ts
import { useReliableConnectivity } from "use-reliable-connectivity";
```

- Get the connectivity status from the hook:

```tsx
const isOnline = useReliableConnectivity();
```

- `useReliableConnectivity()` will always return a `boolean` indicating if internet is reachable. The very first return will be the value of `initialConnectionState` config:

  - `true`: the request was successfully made and the response status was expected on `expectedResponseStatus`. Internet is reachable.

  - `false`: the request was not successfully made and/or the response status was not expected on `expectedResponseStatus`. Internet is not reachable.

## Configuration

All configuration options are optional.

| Property Name          | Type                                                             | Description                                                                                                                                     | Default                                                                                |
| ---------------------- | ---------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| backgroundInterval     | number                                                           | Connection reachability check interval in milliseconds when application is on background. It will be used only if `backgroundSetup` is defined. | 10000                                                                                  |
| backgroundSetup        | (backgroundHandler: BackgroundHandlerFn) => (() => void) \| void | Used to configure the handler for background state.                                                                                             | undefined                                                                              |
| expectedResponseStatus | number[]                                                         | Expected response status codes from the connection reachability URL.                                                                            | [204]                                                                                  |
| initialConnectionState | boolean                                                          | The initial state to be used while the first check is being performed.                                                                          | true                                                                                   |
| interval               | number                                                           | Connection reachability check interval in milliseconds.                                                                                         | 1000                                                                                   |
| reachabilityUrl        | string                                                           | URL to check for connection reachability.                                                                                                       | "[https://clients3.google.com/generate_204](https://clients3.google.com/generate_204)" |
| timeout                | number                                                           | Timeout in milliseconds for the connection reachability check.                                                                                  | 3000                                                                                   |

## Background Setup

Since this hook can be used on any application that uses React, we can't provide a built-in background handler, but it can be easily implemented with your custom logic on hook's configuration with `backgroundSetup`.

```tsx
const connectionConfig: ConnectionConfig = {
  interval: 1000,
  backgroundInterval: 5000, // This value will replace "interval" while application is on background.
  backgroundSetup: (backgroundHandler) => {
    function visibilityChangeHandler() {
      backgroundHandler(document.visibilityState === "hidden");
    }
    window.addEventListener("visibilitychange", visibilityChangeHandler, false);

    return () => {
      window.removeEventListener("visibilitychange", visibilityChangeHandler);
    };
  },
};
```
