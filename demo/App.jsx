import React from "react";
import { Route, HashRouter as Router, Routes } from "react-router";

import Main from "./Main";

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<Main />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
