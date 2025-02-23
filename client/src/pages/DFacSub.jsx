import { useEffect, useState } from 'react';
import Button from 'react-bootstrap/esm/Button';
import Table from 'react-bootstrap/Table';

// eslint-disable-next-line react/prop-types
function DFacSub({ selectedSemester }) {
    const [mappings, setMappings] = useState([]);
    const [labMappings, setLabMappings] = useState([]);

    useEffect(() => {
        if (selectedSemester) {
            fetchMappings();
            fetchLabMappings();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedSemester]);

    const fetchMappings = () => {
        fetch(`http://localhost:3000/getFacSubMap?semester=${selectedSemester}`)
            .then(response => response.json())
            .then(data => setMappings(data))
            .catch(error => console.error('Error fetching regular mappings:', error));
    };

    const fetchLabMappings = () => {
        fetch(`http://localhost:3000/getLabFacSubMap?semester=${selectedSemester}`)
            .then(response => response.json())
            .then(data => setLabMappings(data))
            .catch(error => console.error('Error fetching lab mappings:', error));
    };

    const handleDelete = (id, isLab) => {
        if (window.confirm('Are you sure you want to delete this mapping?')) {
            fetch(`http://localhost:3000/${isLab ? 'deleteLabFacSubMap' : 'deleteFacSubMap'}/${id}`, {
                method: 'DELETE'
            })
            .then(response => response.json())
            .then(data => {
                console.log('Success:', data);
                if (isLab) {
                    fetchLabMappings();
                } else {
                    fetchMappings();
                }
            })
            .catch(error => console.error('Error:', error));
        }
    };

    return (
        <div className='d-flex justify-content-center align-items-center pt-3 mt-3'>
            <div className='w-75 rounded'>
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
                        {/* Regular Subject Mappings */}
                        {mappings.map((item) => (
                            <tr key={`reg-${item.id}`}>
                                <td>{item.faculty_name}</td>  
                                <td>{item.subject_name}</td>  
                                <td>{item.section_id}</td>
                                <td>{item.semester_id}</td>
                                <td className='d-flex flex-col justify-content-center'>
                                    <div className='p-1'>
                                        <Button variant="danger" onClick={() => handleDelete(item.id, false)}>
                                            Delete
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ))}

                        {/* Lab Subject Mappings */}
                        {labMappings.map((lab) => (
                            <tr key={`lab-${lab.id}`}>
                                <td>{lab.faculty1_name} & {lab.faculty2_name}</td> 
                                <td>{lab.subject_name} (Lab)</td>  
                                <td>{lab.section_id}</td>
                                <td>{lab.semester_id}</td>
                                <td className='d-flex flex-col justify-content-center'>
                                    <div className='p-1'>
                                        <Button variant="danger" onClick={() => handleDelete(lab.id, true)}>
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
