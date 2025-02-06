import { useState, useContext } from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import "../styles/Login.css";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { useNavigate } from "react-router-dom";
import { userContext } from "../context/UserContext"; // Import userContext

function Login() {
  const navigate = useNavigate();
  const { setAuthenticated, setRole } = useContext(userContext); // Use context to update auth state

  const [role, setRoleState] = useState({
    username: "",
    password: "",
    loginType: "admin",
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setRoleState({ ...role, [e.target.name]: e.target.value });
  };

  const handleLoginTypeChange = (type) => {
    setRoleState({ ...role, loginType: type });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);

    fetch("http://localhost:3000/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(role),
    })
      .then((response) => {
        if (!response.ok) {
          return response.json().then((err) => {
            throw new Error(err.error || "Login failed!");
          });
        }
        return response.json();
      })
      .then((data) => {
        setIsLoading(false);
        if (data.token) {
          localStorage.setItem("token", data.token);
          localStorage.setItem("role", data.user.role);

          // Update the authentication state in context
          setAuthenticated(true); // Mark as authenticated
          setRole(data.user.role); // Update the role

          if (data.user.role === "admin") {
            navigate("/display");
          }
          if (data.user.role === "student") {
            navigate("/student");
          }
          if (data.user.role === "faculty") {
            navigate("/displayFaculty");
          }

          console.log("Success:", data);
        } else {
          throw new Error("Login failed! No token received.");
        }
      })
      .catch((error) => {
        setIsLoading(false);
        console.error("Error:", error);
        alert("❌ Bad credentials: " + error.message);
      });
  };

  return (
    <div className="login-page">
      <Container>
        <Row>
          <Col>
            <div className="login-form">
              <div className="login-type-switcher">
                {["admin", "faculty", "student"].map((type) => (
                  <button
                    key={type}
                    className={`login-type-btn ${role.loginType === type ? "active" : ""}`}
                    onClick={() => handleLoginTypeChange(type)}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>
              <h1>{role.loginType.charAt(0).toUpperCase() + role.loginType.slice(1)} Login</h1>
              <Form onSubmit={handleSubmit}>
                <Form.Group controlId="formUsername">
                  <Form.Control
                    type="text"
                    name="username"
                    placeholder={`Enter ${role.loginType} Username`}
                    value={role.username}
                    onChange={handleChange}
                  />
                </Form.Group>
                <Form.Group controlId="formPassword">
                  <Form.Control
                    type="password"
                    name="password"
                    placeholder={`Enter ${role.loginType} Password`}
                    value={role.password}
                    onChange={handleChange}
                  />
                </Form.Group>
                <Button className="login-btn" variant="primary" type="submit" disabled={isLoading}>
                  {isLoading ? "Logging in..." : "Login"}
                </Button>
              </Form>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default Login;
