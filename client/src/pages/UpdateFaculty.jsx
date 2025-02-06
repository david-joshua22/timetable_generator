import { useEffect, useState } from 'react';
import Form from 'react-bootstrap/Form';
import { useNavigate, useParams } from 'react-router-dom';

function UpdateFaculty() {
    const [faculty, setFaculty] = useState({ id: '', name: '', department: '' });
    const navigate = useNavigate();
    const { id } = useParams();

    const handleChange = (e) => {
        setFaculty({ ...faculty, [e.target.name]: e.target.value });
    };

    useEffect(() => {
        console.log("Fetching faculty data for ID:", id);
        if (id) {
            fetch(`http://localhost:3000/viewFaculty/${id}`)
                .then(response => response.json())
                .then(data => {
                    if (data && data.length > 0) {
                        setFaculty(data[0]); // Fix: Use data[0] since API returns an array
                    } else {
                        console.error('No faculty data found');
                        setFaculty({ id: '', name: '', department: '' });
                    }
                })
                .catch(error => {
                    console.error('Error fetching faculty data:', error);
                    setFaculty({ id: '', name: '', department: '' });
                });
        }
    }, [id]);

    const handleSubmit = (e) => {
        e.preventDefault();
        // Fix: Corrected URL formation and removed 'id' from the URL
        fetch(`http://localhost:3000/updateFaculty/${id}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: faculty.name,
                department: faculty.department
            })
        })
        .then(response => response.json())
        .then(data => {
            console.log('Success:', data);
            navigate('/faculty');
        })
        .catch(error => console.error('Error:', error));
    };

    return (
        <div className="d-flex justify-content-center pt-5">
            <div className="w-50 rounded faculty p-3">
                <h1 className="text-center">Update Faculty details</h1>
                <form onSubmit={handleSubmit}>
                    <div className="mb-2">
                        <input 
                            type="number" 
                            name="id" 
                            className="form-control" 
                            value={faculty.id}
                            disabled // Make ID field readonly since we're updating
                            required 
                        />
                    </div>
                    <div className="mb-2">
                        <input 
                            type="text" 
                            name="name" 
                            className="form-control" 
                            onChange={handleChange} 
                            value={faculty.name || ''} // Fix: Provide default empty string
                            required 
                        />
                    </div>
                    <div className="mb-2">
                        <Form.Select 
                            name="department" 
                            aria-label="Default select example" 
                            onChange={handleChange} 
                            value={faculty.department || ''} // Fix: Provide default empty string
                            required
                        >
                            <option value="">Select Department</option>
                            <option value="CSE">CSE</option>
                            <option value="IT">IT</option>
                        </Form.Select>
                    </div>
                    <div className='d-flex justify-content-center'>
                        <button className="btn btn-light" type="submit">Update</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default UpdateFaculty;
