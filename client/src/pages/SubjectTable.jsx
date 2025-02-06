import Button from 'react-bootstrap/esm/Button';
import Table from 'react-bootstrap/Table';
import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

function SubjectTable() {
    const [subjects, setSubjects] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetchSubjects();
    }, []);

    const fetchSubjects = () => {
        fetch('http://localhost:3000/subjects')
            .then(response => response.json())
            .then(data => setSubjects(data))
            .catch(error => console.error('Error fetching subjects data:', error));
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this subject?')) {
            fetch(`http://localhost:3000/deleteSubject/${id}`, {
                method: 'DELETE'
            })
            .then(response => response.json())
            .then(data => {
                console.log('Success:', data);
                fetchSubjects(); // Refresh the list after deletion
            })
            .catch(error => console.error('Error:', error));
        }
    };

    const handleEdit = (id) => {
        navigate(`/updateSubject/${id}`);
    };

    return (
        <div className='d-flex vh-100 justify-content-center pt-5'>
            <div className='w-50 rounded'>
                <Link to="/addSubjects" className="btn btn-success mb-3">Add Subject</Link>
                <Table striped bordered hover>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Semester</th>
                            <th>Name</th>
                            <th>Subject Type</th>
                            <th>Hours Per Week</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {subjects.map((item) => (
                            <tr key={item.id}>
                                <td>{item.id}</td>
                                <td>{item.semester_id}</td>
                                <td>{item.name}</td>
                                <td>
                                    {item.type === '1' ? 'Lecture' : 
                                     item.type === '2' ? 'Lab' : 
                                     item.type === '3' ? 'Seminar' : item.type}
                                </td>
                                <td>{item.hours_per_week}</td>
                                <td className='d-flex flex-col justify-content-center'>
                                    <div className='p-1'>
                                        <Button variant="warning" onClick={() => handleEdit(item.id)}>
                                            Edit
                                        </Button>
                                    </div>
                                    <div className='p-1'>
                                        <Button variant="danger" onClick={() => handleDelete(item.id)}>
                                            Delete
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </div>
        </div>
    );
}

export default SubjectTable;