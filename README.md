# use-reliable-connectivity

A (primitive but reliable) React hook to get user connection state based on network requests.

## 🫶 Support it

Liked it? You can show your support with a star ⭐! :)

## Motivation

While working on our company's app, we encountered some issues using `react-native-netinfo`, that relies on native APIs to detect connectivity, which was reporting false offline states on some devices. Unusual behaviors like these are difficult to track (especially in native applications) and was causing our app to incorrectly enter offline mode, disrupting the user experience.

To solve this, I decided to create a "primitive but reliable" way to check user's connectivity based on HTTP requests. This approach tests actual connectivity rather than relying on device-level network status.

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

Use the hook to determine whether the internet is reachable in your React application. It returns a boolean (`true` or `false`) based on the success of HTTP requests and expected response status code.

- `true`: the request was successfully made and the response status was expected on `expectedResponseStatus`. Internet is reachable.

- `false`: the request was not successfully made and/or the response status was not expected on `expectedResponseStatus`. Internet is not reachable.

---

- Import the package in your app:

```ts
import { useReliableConnectivity } from "use-reliable-connectivity";
```

- Get the connectivity status from the hook:

```tsx
const isOnline = useReliableConnectivity();
```

### How to use on localhost

The default reachability endpoint ([https://clients3.google.com/generate_204](https://clients3.google.com/generate_204)) and some other endpoints do not allow requests made from localhost (you will have problems with CORS policy). You can **temporarily and for testing purposes only** bypass this with CORS unblocking extensions, available in most browser stores.

**Warning: Unblocking CORS can pose security risks. Only use this for development and testing purposes.**

## Configuration

All configuration options are optional.

| Property Name          | Type                                                       | Description                                                                                                         | Default                                                                                |
| ---------------------- | ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| backgroundInterval     | number                                                     | Interval (ms) for reachability checks when the app is in the background. Used only if `backgroundSetup` is defined. | 10000                                                                                  |
| backgroundSetup        | ((backgroundHandler) => (() => void) \| void) \| undefined | Used to configure the handler for background state.                                                                 | undefined                                                                              |
| expectedResponseStatus | number[]                                                   | Expected HTTP response codes from the reachability URL                                                              | [204]                                                                                  |
| initialConnectionState | boolean                                                    | Initial state before the first connectivity check completes.                                                        | true                                                                                   |
| interval               | number                                                     | Interval (ms) for reachability checks while in the foreground.                                                      | 1000                                                                                   |
| reachabilityUrl        | string                                                     | URL used to check internet reachability.                                                                            | "[https://clients3.google.com/generate_204](https://clients3.google.com/generate_204)" |
| timeout                | number                                                     | Timeout (ms) for each reachability check request.                                                                   | 3000                                                                                   |

## Background Setup

### Why it matters?

Handling background state can optimize resource usage by reducing the frequency of reachability checks when the app is not actively in use.

### Example

Since this hook can be used on any application that uses React, we can't provide a built-in background handler, but it can be easily implemented with your custom logic on hook's configuration with `backgroundSetup`.

Here's an example of how to configure background handling on web using the hook's `backgroundSetup` option:

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

## Measuring Resources

To estimate resource usage with this hook, you can calculate based on these variables:

- **t**: Time in seconds users spend on your application.
- **i**: Interval in seconds between reachability requests.
- **s**: Size in bytes of reachability endpoint response.

Formula:

```math
R = (t / i) * s
```

Example:

```math
R = (300 / 2) * 184
```

```math
R = 27.600
```

In this example, users spend **5 minutes (300 seconds)** in your app, with reachability checks every **2 seconds** on an endpoint weighing **184 bytes**.

Total resource usage would be approximately **27.600 bytes** (or **27.6 KB**).

## License

This project is licensed under the MIT License.
