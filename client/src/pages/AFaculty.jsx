import { useState } from 'react';
import Form from 'react-bootstrap/Form';
import { useNavigate } from 'react-router-dom';

function AFaculty() {
    const [faculty, setFaculty] = useState({ id: '', name: '', department: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFaculty({ ...faculty, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);  // Reset error message on new submit attempt
        setSuccess(false); // Reset success state

        fetch('http://localhost:3000/addFaculty', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(faculty)
        })
        .then(response => response.json())
        .then(data => {
            setLoading(false);
            console.log(data);
            navigate('/admin/faculty');
        })
        .catch(error => {
            setLoading(false);
            setError('There was an error adding the faculty.');
            console.error('Error:', error);
        });
    };

    return (
        <div className="d-flex justify-content-center pt-5">
            <div className="w-50 rounded faculty p-3">
                <h1 className="text-center">Enter Faculty details</h1>
                {error && <div className="alert alert-danger">{error}</div>}
                {success && <div className="alert alert-success">Faculty added successfully!</div>}
                <form onSubmit={handleSubmit}>
                    <div className="mb-2">
                        <input 
                            type="number" 
                            name="id" 
                            placeholder="Enter Faculty ID" 
                            className="form-control" 
                            onChange={handleChange} 
                            value={faculty.id} 
                            required 
                        />
                    </div>
                    <div className="mb-2">
                        <input 
                            type="text" 
                            name="name" 
                            placeholder="Enter Faculty Name" 
                            className="form-control" 
                            onChange={handleChange} 
                            value={faculty.name} 
                            required 
                        />
                    </div>
                    <div className="mb-2">
                        <Form.Select 
                            name="department" 
                            aria-label="Select Department" 
                            onChange={handleChange} 
                            value={faculty.department} 
                            className='formSelect'
                            required
                        >
                            <option value="">Select Department</option>
                            <option value="CSE">CSE</option>
                            <option value="IT">IT</option>
                            <option value="CSIT">CSIT</option>
                            <option value="DE">DE</option>
                            <option value="CIVIL">CIVIL</option>
                            <option value="CHEM">CHEM</option>
                            <option value="ECE">ECE</option>
                            <option value="EEE">EEE</option>
                            <option value="MECH">MECH</option>
                            <option value="S&H">S&H</option>
                            <option value="T&P">T&P</option>
                        </Form.Select>
                    </div>
                    <div className="d-flex justify-content-center">
                        <button className="btn btn-light" type="submit" disabled={loading}>
                            {loading ? 'Submitting...' : 'Submit'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AFaculty;
