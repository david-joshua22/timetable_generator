/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/prop-types */
import { useEffect, useState } from 'react';
import { Button, Form, Table } from 'react-bootstrap';
import '../styles/DFacSub.css';

function DFacSub({ selectedSemester, refreshMappings }) {
    const [mappings, setMappings] = useState([]);
    const [labMappings, setLabMappings] = useState([]);
    const [deleteMode, setDeleteMode] = useState(false);
    const [selectedIds, setSelectedIds] = useState([]);
    const [selectAll, setSelectAll] = useState(false);

    useEffect(() => {
        if (selectedSemester) {
            fetchMappings();
            fetchLabMappings();
        }
    }, [selectedSemester, refreshMappings]);

    useEffect(() => {
        if (mappings.length + labMappings.length > 0 && selectedIds.length === mappings.length + labMappings.length) {
            setSelectAll(true);
        } else {
            setSelectAll(false);
        }
    }, [selectedIds, mappings, labMappings]);

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

    const handleCheckboxChange = (id) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(deleteId => deleteId !== id) : [...prev, id]
        );
    };

    const handleSelectAll = () => {
        if (selectAll) {
            setSelectedIds([]);
        } else {
            setSelectedIds([...mappings.map(item => item.id), ...labMappings.map(item => item.id)]);
        }
        setSelectAll(!selectAll);
    };

    const confirmDelete = () => {
        if (selectedIds.length > 0) {
            Promise.all(selectedIds.map(id => {
                // Determine if the ID belongs to a lab mapping
                const isLabMapping = labMappings.some(lab => lab.id === id);
                const endpoint = isLabMapping ? 'deleteLabFacSubMap' : 'deleteFacSubMap';
                return fetch(`http://localhost:3000/${endpoint}/${id}`, { method: 'DELETE' });
            }))
                .then(() => {
                    fetchMappings();
                    fetchLabMappings();
                    setSelectedIds([]);
                    setSelectAll(false);
                })
                .catch(error => console.error('Error deleting subjects:', error));
        }
    };

    return (
        <div className='d-flex flex-column align-items-center pt-3 mt-3'>
            <div className='table-details'>
                <div className="delete-mode-toggle mb-2 d-flex justify-content-between align-items-center">
                    <Form.Check
                        type="switch"
                        id="delete-mode-switch"
                        label="Enable Delete Mode"
                        checked={deleteMode}
                        onChange={() => setDeleteMode(!deleteMode)}
                    />
                </div>

                <Table striped bordered hover>
                    <thead>
                        <tr>
                            <th>Faculty Name</th>
                            <th>Subject</th>
                            <th>Class</th>
                            <th>Semester</th>
                            {deleteMode && (
                                <th className="text-center">
                                    <span>Select All</span>
                                    <Form.Check
                                        type="checkbox"
                                        checked={selectAll}
                                        onChange={handleSelectAll}
                                        className="ms-2"
                                    />
                                </th>
                            )}
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
                                {deleteMode && (
                                    <td className="text-center">
                                        <Form.Check
                                            type="checkbox"
                                            checked={selectedIds.includes(item.id)}
                                            onChange={() => handleCheckboxChange(item.id)}
                                        />
                                    </td>
                                )}
                            </tr>
                        ))}

                        {/* Lab Subject Mappings */}
                        {labMappings.map((lab) => (
                            <tr key={`lab-${lab.id}`}>
                                <td>
                                    {[lab.faculty1_name, lab.faculty2_name, lab.faculty3_name]
                                        .filter(Boolean)
                                        .join(' & ')}
                                </td>
                                <td>{lab.subject_name} (Lab)</td>  
                                <td>{lab.section_id}</td>
                                <td>{lab.semester_id}</td>
                                {deleteMode && (
                                    <td className="text-center">
                                        <Form.Check
                                            type="checkbox"
                                            checked={selectedIds.includes(lab.id)}
                                            onChange={() => handleCheckboxChange(lab.id)}
                                        />
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </Table>

                {deleteMode && selectedIds.length > 0 && (
                    <Button
                        variant="danger"
                        className="mt-2"
                        onClick={confirmDelete}
                    >
                        Delete Selected
                    </Button>
                )}
            </div>
        </div>
    );
}

export default DFacSub;
