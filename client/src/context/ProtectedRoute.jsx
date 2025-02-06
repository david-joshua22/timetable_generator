import { ClipLoader } from "react-spinners";
import { useContext, useEffect, useState } from "react";
import { userContext } from "./UserContext";
import { Navigate } from "react-router-dom";
import PropTypes from 'prop-types';

const ProtectedRoute = ({ children, roles }) => {
  const { role, authenticated } = useContext(userContext);
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    setTimeout(() => setIsVerifying(false), 600);
  }, []);

  if (isVerifying) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <ClipLoader size={50} color={"#3498db"} />
      </div>
    );
  }

  if (!authenticated) {
    return <Navigate to="/login" />;
  }

  if (!roles.includes(role)) {
    return <Navigate to="/" />;
  }

  return children;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired, 
  roles: PropTypes.arrayOf(PropTypes.string).isRequired, 
};

export default ProtectedRoute;