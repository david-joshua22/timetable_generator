/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/prop-types */
import { useEffect, useState } from 'react';
import { Table } from 'react-bootstrap';
import '../styles/DFacSub.css';
import '../styles/AddFaculty.css'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function GFacSub({ selectedSemester, refreshMappings }) {
    const [mappings, setMappings] = useState([]);
    const [labMappings, setLabMappings] = useState([]);

    useEffect(() => {
        if (selectedSemester) {
            fetchMappings();
            fetchLabMappings();
        }
    }, [selectedSemester, refreshMappings]);

    useEffect(() => {
    }, [mappings, labMappings]);

    const fetchMappings = () => {
        fetch(`${API_BASE_URL}/getFacSubMap?semester=${selectedSemester}`)
            .then(response => response.json())
            .then(data => setMappings(data))
            .catch(error => console.error('Error fetching regular mappings:', error));
    };

    const fetchLabMappings = () => {
        fetch(`${API_BASE_URL}/getLabFacSubMap?semester=${selectedSemester}`)
            .then(response => response.json())
            .then(data => setLabMappings(data))
            .catch(error => console.error('Error fetching lab mappings:', error));
    };


    return (
        <div className='d-flex flex-column align-items-center pt-3 mt-3'>
            <div className='table-details'>
                <Table striped bordered hover>
                    <thead>
                        <tr>
                            <th>Semester</th>
                            <th>Class</th>
                            <th>Subject</th>
                            <th>Faculty Name</th>
                        </tr>
                    </thead>
                    <tbody>
                        {/* Regular Subject Mappings */}
                        {mappings.map((item) => (
                            <tr key={`reg-${item.id}`}>
                                <td>{item.semester_id}</td>
                                <td>{item.section_id}</td>
                                <td>{item.subject_name}</td>
                                <td>{item.faculty_name}</td>  
                            </tr>
                        ))}

                        {/* Lab Subject Mappings */}
                        {labMappings.map((lab) => (
                            <tr key={`lab-${lab.id}`}>
                                <td>{lab.semester_id}</td>
                                <td>{lab.section_id}</td>
                                <td>{lab.subject_name} (Lab)</td>  
                                <td>
                                    {[lab.faculty1_name, lab.faculty2_name, lab.faculty3_name]
                                        .filter(Boolean)
                                        .join(' & ')}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </div>
        </div>
    );
}

export default GFacSub;
