import { useEffect, useState } from 'react';
import Button from 'react-bootstrap/esm/Button';
import Table from 'react-bootstrap/Table';

function DFacSub() {
    const [mappings, setMappings] = useState([]);
    const section = {1:'A',2:'B',3:'C',4:'D',5:'E'}
    useEffect(() => {
        fetchMappings();
    }, []);

    const fetchMappings = () => {
        fetch('http://localhost:3000/getFacSubMap')
            .then(response => response.json())
            .then(data => setMappings(data))
            .catch(error => console.error('Error fetching mappings:', error));
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this mapping?')) {
            fetch(`http://localhost:3000/deleteFacSubMap/${id}`, {
                method: 'DELETE'
            })
            .then(response => response.json())
            .then(data => {
                console.log('Success:', data);
                fetchMappings(); // Refresh the list after deletion
            })
            .catch(error => console.error('Error:', error));
        }
    };

    return (
        <div className='d-flex justify-content-center align-items-center pt-3 mt-3'>
            <div className='w-50 rounded'>
                <Table striped bordered hover>
                    <thead>
                        <tr>
                            <th>Faculty Name</th>
                            <th>Subject</th>
                            <th>Class</th>
                            <th>Semester</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {mappings.map((item) => (
                            <tr key={item.id}>
                                <td>{item.faculty_name}</td>  
                                <td>{item.subject_name}</td>  
                                <td>{section[item.section_id]}</td>
                                <td>{item.semester_id}</td>
                                <td className='d-flex flex-col justify-content-center'>
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

export default DFacSub;