import { useEffect, useState } from 'react';
import Form from 'react-bootstrap/Form';
import { useNavigate, useParams } from 'react-router-dom';

function UpdateSubject() {
    const [subject, setSubject] = useState({ id: '', name: '', type: '', hours_per_week: '' });
    const navigate = useNavigate();
    const { id } = useParams();

    const handleChange = (e) => {
        setSubject({ ...subject, [e.target.name]: e.target.value });
    };

    useEffect(() => {
        console.log("Fetching subject data for ID:", id);
        if (id) {
            fetch(`http://localhost:3000/viewSubject/${id}`)
                .then(response => response.json())
                .then(data => {
                    if (data && data.length > 0) {
                        setSubject(data[0]);
                    } else {
                        console.error('No subject data found');
                        setSubject({ id: '', name: '', type: '', hours_per_week: '' });
                    }
                })
                .catch(error => {
                    console.error('Error fetching subject data:', error);
                    setSubject({ id: '', name: '', type: '', hours_per_week: '' });
                });
        }
    }, [id]);

    const handleSubmit = (e) => {
        e.preventDefault();
        fetch(`http://localhost:3000/updateSubject/${id}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(subject)
        })
        .then(response => response.json())
        .then(data => {
            console.log('Success:', data);
            navigate('/subjects');
        })
        .catch(error => console.error('Error:', error));
    };

    return (
        <div className="d-flex justify-content-center pt-5">
            <div className="w-50 rounded faculty p-3">
                <h1 className="text-center">Update Subject Details</h1>
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <input 
                            type="text" 
                            name="name" 
                            placeholder="Enter Subject name" 
                            className="form-control" 
                            onChange={handleChange} 
                            value={subject.name || ''}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <input 
                            type="number" 
                            name="id" 
                            placeholder="Enter Subject code" 
                            className="form-control" 
                            value={subject.id || ''}
                            disabled
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <Form.Select 
                            aria-label="Default select example" 
                            name="type" 
                            onChange={handleChange} 
                            value={subject.type || ''}
                            required
                        >
                            <option value="">Enter Subject type</option>
                            <option value="1">Lecture</option>
                            <option value="2">Lab</option>
                            <option value="3">Seminar</option>
                        </Form.Select>
                    </div>
                    <div className="mb-3">
                        <input 
                            type="number" 
                            placeholder="Enter hours per week" 
                            name="hours_per_week" 
                            className="form-control" 
                            onChange={handleChange} 
                            value={subject.hours_per_week || ''}
                            required
                        />
                    </div>
                    <div className='d-flex justify-content-center'>
                        <button className="btn btn-light" type="submit">Update</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default UpdateSubject;