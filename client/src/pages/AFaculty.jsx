import { useState } from 'react';
import Form from 'react-bootstrap/Form';
import { useNavigate } from 'react-router-dom';

function AFaculty() {
    const [faculty, setFaculty] = useState({ id: '', name: '', department: '' });
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFaculty({ ...faculty, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        fetch('http://localhost:3000/addFaculty', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(faculty)
        })
        .then(response => response.json())
        .then(data =>{
            console.log('Success:', data),
            navigate('/faculty')
    })
        .catch(error => console.error('Error:', error));
    };

    return (
        <div className="d-flex justify-content-center pt-5">
            <div className="w-50 rounded faculty p-3">
                <h1 className="text-center">Enter Faculty details</h1>
                <form onSubmit={handleSubmit}>
                    <div className="mb-2">
                        <input type="number" name="id" placeholder="Enter Faculty ID" className="form-control" onChange={handleChange} required />
                    </div>
                    <div className="mb-2">
                        <input type="text" name="name" placeholder="Enter Faculty Name" className="form-control" onChange={handleChange} required />
                    </div>
                    <div className="mb-2">
                        <Form.Select name="department" aria-label="Default select example" onChange={handleChange} required>
                            <option value="">Select Department</option>
                            <option value="CSE">CSE</option>
                            <option value="IT">IT</option>
                        </Form.Select>
                    </div>
                    <div className='d-flex justify-content-center'>
                        <button className="btn btn-light" type="submit">Submit</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AFaculty;
