import { useEffect, useState } from 'react';
import Button from 'react-bootstrap/esm/Button';
import Table from 'react-bootstrap/Table';
import { Link } from 'react-router-dom';

function Faculty() {
    const [faculty, setFaculty] = useState([]);

    useEffect(() => {
        fetch('http://localhost:3000/faculty')
            .then(response => response.json())
            .then(data => setFaculty(data))
            .catch(error => console.error('Error fetching faculty data:', error));
    }, []);

    const handleDelete = (id)=>{
        if (window.confirm('Are you sure you want to delete this faculty?')) {
            fetch('http://localhost:3000/deleteFaculty/'+id, {
                method: 'DELETE'
            })
            .then(response => response.json())
            .then(data =>{
                console.log('Success:', data),
                location.reload()
        })
            .catch(error => console.error('Error:', error));
        }
            
    }

    return (
        <div className='d-flex vh-100 justify-content-center pt-5'>
            <div className='w-50 rounded'>
                <Link to="/addFaculty" className="btn btn-success mb-3">Add Faculty</Link>
                <Table striped bordered hover>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Department</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {faculty.map((item) => (
                            <tr key={item.id}>
                                <td>{item.id}</td>
                                <td>{item.name}</td>
                                <td>{item.department}</td>
                                <td className='d-flex flex-col justify-content-center'>
                                    <div className='p-1'>
                                        <Link className="btn btn-warning"  to={'/updateFaculty/'+item.id}>Edit</Link>
                                    </div>
                                    <div className='p-1'>
                                        <Button variant="danger" onClick={()=>handleDelete(item.id)}>Delete</Button>
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

export default Faculty;
