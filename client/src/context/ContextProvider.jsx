import { useState, useEffect } from "react";
import { userContext } from "./UserContext";
import PropTypes from 'prop-types';

const ContextProvider = ({ children }) => {
  const [role, setRole] = useState(null);
  const [authenticated, setAuthenticated] = useState(null);  // Initially null to indicate verification is in progress

  useEffect(() => {
    const storedToken = localStorage.getItem("token");

    if (storedToken) {
      // Verify token with backend
      fetch("http://localhost:3000/verify-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${storedToken}`,
        },
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.valid) {
            setRole(data.role);
            setAuthenticated(true);  // Valid token
          } else {
            localStorage.removeItem("token");
            localStorage.removeItem("role");
            setAuthenticated(false);  // Invalid token
          }
        })
        .catch(() => {
          setAuthenticated(false);  // Error in fetching/validating token
        });
    } else {
      setAuthenticated(false);  // No token available
    }
  }, []);

  return (
    <userContext.Provider value={{ role, authenticated, setRole, setAuthenticated }}>
      {children}
    </userContext.Provider>
  );
};

ContextProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ContextProvider;


