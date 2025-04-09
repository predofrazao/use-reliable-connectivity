import { useReliableConnectivity } from "use-reliable-connectivity";

const App = () => {
  const isOnline = useReliableConnectivity();

  return <div>{String(isOnline)}</div>;
};

export default App;
