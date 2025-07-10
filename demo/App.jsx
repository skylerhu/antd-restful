import React from "react";
import { Route, HashRouter as Router, Routes, Navigate } from "react-router";

import Main from "./Main";

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path=":tab" element={<Main />} />
          <Route path="/" element={<Navigate to="form" replace />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
