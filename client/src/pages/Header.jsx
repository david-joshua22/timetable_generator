import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import Button from 'react-bootstrap/Button';
import MvgrLogo from '../assets/mvgrlogo.png';
import '../styles/Headerstyling.css';
import { useContext } from 'react';
import { userContext } from '../context/UserContext'; 

function Header() {
  // eslint-disable-next-line no-unused-vars
  const { authenticated, setAuthenticated, setRole, role } = useContext(userContext);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setAuthenticated(false);
    setRole(null);
  };

  return (
    <Navbar bg="dark" expand="lg" data-bs-theme="dark">
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
            {localStorage.getItem("role") === 'admin' && (
              <Nav.Link href="/admin">Admin Dashboard</Nav.Link>
            )}
          </Nav>
          <Nav className="ms-auto">
            {authenticated ? (
              <Button
                className="white-button"
                style={{ backgroundColor: 'white', color: 'black', border: 'none' }}
                onClick={handleLogout}
              >
                Logout
              </Button>
            ) : (
              <Nav.Link href="/login">
                <Button
                  className="white-button"
                  style={{ backgroundColor: 'white', color: 'black', border: 'none' }}
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
