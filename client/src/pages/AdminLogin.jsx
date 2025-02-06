import { Link, useNavigate } from "react-router-dom";
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Card from 'react-bootstrap/Card';
import '../styles/AdminLogin.css';

const AdminLogin = () => {
    const navigate = useNavigate();
  return (
    <div className="p-6 bg-gray-100 min-h-screen flex flex-col items-center">  
      <div className="bg-white p-4 rounded-lg shadow-md Â¡w-full max-w-4xl mb-6 cardBox">
        <div className="d-flex justify-content-center pt-5">
        <Card style={{ width: '18rem' }} className="m-2 ">
            <Card.Body className="text-center">
                <Card.Title> <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" className="bi bi-person-add" viewBox="0 0 16 16">
                    <path d="M12.5 16a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7m.5-5v1h1a.5.5 0 0 1 0 1h-1v1a.5.5 0 0 1-1 0v-1h-1a.5.5 0 0 1 0-1h1v-1a.5.5 0 0 1 1 0m-2-6a3 3 0 1 1-6 0 3 3 0 0 1 6 0M8 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4"/>
                    <path d="M8.256 14a4.5 4.5 0 0 1-.229-1.004H3c.001-.246.154-.986.832-1.664C4.484 10.68 5.711 10 8 10q.39 0 .74.025c.226-.341.496-.65.804-.918Q8.844 9.002 8 9c-5 0-6 3-6 4s1 1 1 1z"/>
                </svg>Add Faculty </Card.Title> 
                <Link to='/faculty'><Button className="btn-primary" >Enter Faculty</Button></Link>
            </Card.Body>
        </Card>

        <Card style={{ width: '18rem' }} className="m-2 ">
            <Card.Body className="text-center">
                <Card.Title> <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" className="bi bi-book" viewBox="0 0 16 16">
                    <path d="M1 2.828c.885-.37 2.154-.769 3.388-.893 1.33-.134 2.458.063 3.112.752v9.746c-.935-.53-2.12-.603-3.213-.493-1.18.12-2.37.461-3.287.811zm7.5-.141c.654-.689 1.782-.886 3.112-.752 1.234.124 2.503.523 3.388.893v9.923c-.918-.35-2.107-.692-3.287-.81-1.094-.111-2.278-.039-3.213.492zM8 1.783C7.015.936 5.587.81 4.287.94c-1.514.153-3.042.672-3.994 1.105A.5.5 0 0 0 0 2.5v11a.5.5 0 0 0 .707.455c.882-.4 2.303-.881 3.68-1.02 1.409-.142 2.59.087 3.223.877a.5.5 0 0 0 .78 0c.633-.79 1.814-1.019 3.222-.877 1.378.139 2.8.62 3.681 1.02A.5.5 0 0 0 16 13.5v-11a.5.5 0 0 0-.293-.455c-.952-.433-2.48-.952-3.994-1.105C10.413.809 8.985.936 8 1.783"/>
                    </svg> Add Subjects</Card.Title>
                    <Link to='/subjects'><Button className="btn-success">Enter Subjects</Button></Link>
            </Card.Body>
        </Card>

        <Card style={{ width: '18rem' }} className="m-2 ">
            <Card.Body className="text-center">
                <Card.Title><svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" className="bi bi-paperclip" viewBox="0 0 16 16">
                    <path d="M4.5 3a2.5 2.5 0 0 1 5 0v9a1.5 1.5 0 0 1-3 0V5a.5.5 0 0 1 1 0v7a.5.5 0 0 0 1 0V3a1.5 1.5 0 1 0-3 0v9a2.5 2.5 0 0 0 5 0V5a.5.5 0 0 1 1 0v7a3.5 3.5 0 1 1-7 0z"/>
                    </svg>Faculty-Subject Mapping</Card.Title>
                    <Link to='/sfmap'><Button className="btn-secondary">Faculties Area</Button></Link>
            </Card.Body>
        </Card>
        
        </div>
      </div>
  
      <div className="bg-white p-4 rounded-lg shadow-md w-full max-w-4xl mb-6 flex justify-between">
      <Form.Select aria-label="Default select example">
                <option>Select Department</option>
                <option value="1">CSE</option>
                <option value="2">IT</option>
                <option value="3">ECE</option>
                <option value="4">EEE</option>
                <option value="5">MECH</option>
                <option value="6">CIVIL</option>
                <option value="7">CHEM</option>
            </Form.Select>
            
            <Form.Select aria-label="Default select example">
                <option>Select Semester</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
                <option value="6">6</option>
                <option value="7">7</option>
            </Form.Select>

            <Form.Select aria-label="Default select example">
                <option>Select Section</option>
                <option value="1">A</option>
                <option value="2">B</option>
                <option value="3">C</option>
            </Form.Select>
      </div>

      <Button className="bg-black text-white px-6 py-3" onClick={() => navigate('/display')}>VIEW</Button>
    </div>
  );
};

export default AdminLogin;