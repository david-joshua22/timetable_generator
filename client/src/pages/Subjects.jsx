import Form from 'react-bootstrap/Form';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/InputContainer.css';

function Subjects(){
    const [subject, setFaculty] = useState({ id: '', name: '', type: '', hours_per_week:'',semester:''});
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFaculty({ ...subject, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        fetch('http://localhost:3000/addSubjects', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(subject)
        })
        .then(response => response.json())
        .then(data =>{
            console.log('Success:', data),
            navigate('/admin/subjects')
    })
        .catch(error => console.error('Error:', error));
    };
    return(
        <div className="d-flex justify-content-center pt-5">
            <div className="w-50 rounded faculty p-3">
                <h1 className='text-center text-black'>Enter Subject details</h1>
                <form onSubmit={handleSubmit}>
                <div className="mb-3 ">
                <input type="text" name = "name" placeholder="Enter Subject name" className="form-control" onChange={handleChange} required/>
            </div>
            <div className="mb-3 ">
                <input type="text" name = "id" placeholder="Enter Subject code" className="form-control" onChange={handleChange} required/>
            </div>
            <div className="mb-3 ">
            <Form.Select aria-label="Default select example" name = "type" onChange={handleChange} className='formSelect' required>
                <option>Enter Subject type</option>
                <option value="1">Lecture</option>
                <option value="2">Lab</option>
                <option value="3">Elective</option>
            </Form.Select>
            </div>
            <div className="mb-3 ">
                <input type="number" placeholder="Enter hours per week" name = "hours_per_week" className="form-control" onChange={handleChange} required/>
            </div>
            <div className='mb-3'>
            <Form.Select 
                            name="semester"
                            onChange={handleChange}
                            aria-label="Select Semester"
                            className='formSelect'
                        >
                            <option value="">Select Semester</option>
                            {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                                <option key={sem} value={sem}>{sem}</option>
                            ))}
            </Form.Select>
            </div>
            <div className='d-flex justify-content-center'>
                <button className="btn btn-dark" type="submit">Submit</button>
                </div>
            </form>
            </div>
        </div>
    )
}
 export default Subjects;