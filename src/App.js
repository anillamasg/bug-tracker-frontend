import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import NavBar from "./component/NavBar";
import Dashboard from "./dashboard/Dashboard";
import SignIn from "./signin/SignIn";
import Error from "./component/Error";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

function App() {
  function RequireAuth({ children, redirectTo }) {
    const authHeader = useSelector((state) => state.authorizationHeader.value);
    return authHeader === "" ? <Navigate to={redirectTo} /> : children;
  }

  return (
    <>
      <Router>
        <Routes>
          <Route
            path="/*"
            
            element={
              <RequireAuth redirectTo="login">
                <Dashboard />
              </RequireAuth>
            }
          />
          <Route path="login" element={<SignIn />} />
          <Route path="*" element={<Error />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
