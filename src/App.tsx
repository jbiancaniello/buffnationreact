import React from "react";
import AppRoutes from "./routes/Routes";
import Topbar from "./components/Topbar";

const App: React.FC = () => {
  return (
    <>
      <Topbar />
      <AppRoutes />
    </>
  );
};

export default App;
