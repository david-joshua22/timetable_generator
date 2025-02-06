import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import Button from 'react-bootstrap/Button';
import MvgrLogo from '../assets/mvgrlogo.png';
import '../styles/Headerstyling.css';
import { useContext } from 'react';
import { userContext } from '../context/UserContext'; // Import userContext

function Header() {
  const { authenticated, setAuthenticated, setRole } = useContext(userContext); // Access auth state

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("token");  // Remove the token from localStorage
    localStorage.removeItem("role");   // Remove the role from localStorage
    setAuthenticated(false);           // Update context state
    setRole(null);                     // Reset the role state (optional)
  };

  return (
    <Navbar bg="black" expand="lg" data-bs-theme="dark">
      <Container>
        <Navbar.Brand href="/">
          <img
            alt="MVGR Logo"
            src={MvgrLogo}
            width="50"
            height="30"
            className="d-inline-block align-top"
          />{' '}
          Time Table
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link href="/faculty">Enter Faculty</Nav.Link>
            <Nav.Link href="/subjects">Enter Subjects</Nav.Link>
            <Nav.Link href="/sfmap">Faculty Subject Mapping</Nav.Link>
            <Nav.Link href="/display">Display Time Table</Nav.Link>
          </Nav>
          <Nav className="ms-auto">
            {authenticated ? (
              <Nav.Link>
                <Button
                  className="white-button"
                  style={{
                    backgroundColor: 'white',
                    color: 'black',
                    border: 'none',
                  }}
                  onClick={handleLogout} // Call logout function
                >
                  Logout
                </Button>
              </Nav.Link>
            ) : (
              <Nav.Link href="/login">
                <Button
                  className="white-button"
                  style={{
                    backgroundColor: 'white',
                    color: 'black',
                    border: 'none',
                  }}
                >
                  Login
                </Button>
              </Nav.Link>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default Header;
