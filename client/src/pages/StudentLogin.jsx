import { useNavigate } from "react-router-dom";
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import '../styles/AdminLogin.css';

const StudentDashboard = () => {
    const navigate = useNavigate();
  return (
        <div className="items-center display-1">  
            <div className="rounded-lg shadow-md Â¡w-full max-w-4xl mb-6 cardBox">
                <div>
                <div className="timetableHeader">
                    <h3>Display TimeTable</h3>
                </div>

        <div className="d-flex justify-content-center pt-5 pb-3">
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

        <div className="center-button">
            <Button className="btn-dark text-white" onClick={() => navigate('/display')}>VIEW</Button>
        </div>  
      </div>
            </div>

    </div>
  );
};

export default StudentDashboard;