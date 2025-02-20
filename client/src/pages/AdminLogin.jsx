import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import '../styles/AdminLogin.css';

const AdminDashboard = () => {
  return (
    <div className="items-center display-1">  
      <div className="rounded-lg shadow-md w-full max-w-4xl mb-6 cardBox">
        <div className="adminHeader">
          <h3>Admin Dashboard</h3>
        </div>

        <div className="card-container">
          <Card className="card1">
            <Card.Body>
              <Card.Title> Add Faculty </Card.Title> 
              <Button className="btn-dark text-white" href="/faculty">Enter Faculty</Button>
            </Card.Body>
          </Card>

          <Card className="card2">
            <Card.Body>
              <Card.Title> Add Subjects </Card.Title>
              <Button className="btn-dark text-white" href="/subjects">Enter Subjects</Button>
            </Card.Body>
          </Card>

          <Card className="card3">
            <Card.Body>
              <Card.Title> Map Faculty-Subject </Card.Title>
              <Button className="btn-dark text-white" href="/sfmap">Map</Button>
            </Card.Body>
          </Card>

          <Card className="card4">
            <Card.Body>
              <Card.Title> View Time Table </Card.Title>
              <Button className="btn-dark text-white" href="/display">View</Button>
            </Card.Body>
          </Card>

          <Card className="card4">
            <Card.Body>
              <Card.Title> View Faculty Mappings </Card.Title>
              <Button className="btn-dark text-white" href="/sfmap">View</Button>
            </Card.Body>
          </Card>

          <Card className="card4">
            <Card.Body>
              <Card.Title> Generate Timetable </Card.Title>
              <Button className="btn-dark text-white" href="/display">Generate</Button>
            </Card.Body>
          </Card>
        </div>

    </div>
    </div>
)}

export default AdminDashboard;
