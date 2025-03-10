/* eslint-disable react/prop-types */
import { useEffect, useState } from 'react';
import { Button, Form, Table } from 'react-bootstrap';
import '../styles/DFacSub.css';
import '../styles/AddFaculty.css';
import { FaTrashAlt } from 'react-icons/fa';
import Modal from 'react-bootstrap/Modal';

function DFacSub({ selectedSemester, refreshMappings }) {
    const [mappings, setMappings] = useState([]);
    const [labMappings, setLabMappings] = useState([]);
    const [deleteMode, setDeleteMode] = useState(false);
    const [selectedIds, setSelectedIds] = useState([]);
    const [selectAll, setSelectAll] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    useEffect(() => {
        if (selectedSemester) {
            fetchMappings();
            fetchLabMappings();
        }
    }, [selectedSemester, refreshMappings]);

    useEffect(() => {
        setSelectAll(selectedIds.length === mappings.length + labMappings.length);
    }, [selectedIds, mappings, labMappings]);

    const fetchMappings = () => {
        fetch(`http://localhost:3000/getFacSubMap?semester=${selectedSemester}`)
            .then(response => response.json())
            .then(setMappings)
            .catch(console.error);
    };

    const fetchLabMappings = () => {
        fetch(`http://localhost:3000/getLabFacSubMap?semester=${selectedSemester}`)
            .then(response => response.json())
            .then(setLabMappings)
            .catch(console.error);
    };

    const handleCheckboxChange = (id) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(deleteId => deleteId !== id) : [...prev, id]
        );
    };

    const handleSelectAll = () => {
        setSelectedIds(selectAll ? [] : [...mappings.map(item => item.id), ...labMappings.map(item => item.id)]);
        setSelectAll(!selectAll);
    };

    const handleDeleteClick = () => {
        if (selectedIds.length > 0) setShowDeleteModal(true);
    };

    const handleDeleteConfirmed = () => {
        setShowDeleteModal(false);
        Promise.all(
            selectedIds.map(id => {
                const isLabMapping = labMappings.some(lab => lab.id === id);
                const endpoint = isLabMapping ? 'deleteLabFacSubMap' : 'deleteFacSubMap';
                return fetch(`http://localhost:3000/${endpoint}/${id}`, { method: 'DELETE' });
            })
        )
            .then(() => {
                fetchMappings();
                fetchLabMappings();
                setSelectedIds([]);
                setSelectAll(false);
            })
            .catch(console.error);
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
                            <th>Lab Name</th>
                            {deleteMode && (
                                <th className="text-center">
                                    <span>Select All</span>
                                    <Form.Check type="checkbox" checked={selectAll} onChange={handleSelectAll} className="ms-2" />
                                </th>
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {mappings.map(item => (
                            <tr key={item.id}>
                                <td>{item.faculty_name}</td>
                                <td>{item.subject_name}</td>
                                <td>{item.section_id}</td>
                                <td>{item.semester_id}</td>
                                <td>-</td>
                                {deleteMode && (
                                    <td className="text-center">
                                        <Form.Check type="checkbox" checked={selectedIds.includes(item.id)} onChange={() => handleCheckboxChange(item.id)} />
                                    </td>
                                )}
                            </tr>
                        ))}
                        {labMappings.map(lab => (
                            <tr key={lab.id}>
                                <td>{[lab.faculty1_name, lab.faculty2_name, lab.faculty3_name].filter(Boolean).join(' & ')}</td>
                                <td>{lab.subject_name} (Lab)</td>
                                <td>{lab.section_id}</td>
                                <td>{lab.semester_id}</td>
                                <td>{lab.lab_name || '-'}</td>
                                {deleteMode && (
                                    <td className="text-center">
                                        <Form.Check type="checkbox" checked={selectedIds.includes(lab.id)} onChange={() => handleCheckboxChange(lab.id)} />
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </Table>

                {deleteMode && selectedIds.length > 0 && (
                    <Button variant="danger" className="delete-fab" onClick={handleDeleteClick}>
                        <FaTrashAlt /> Delete Selected
                    </Button>
                )}

                <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
                    <Modal.Header closeButton>
                        <Modal.Title>Confirm Deletion</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <p>Are you sure you want to delete {selectedIds.length} selected mapping(s)?</p>
                        <p>This action cannot be undone.</p>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
                        <Button variant="danger" onClick={handleDeleteConfirmed}>Delete</Button>
                    </Modal.Footer>
                </Modal>
            </div>
        </div>
    );
}

export default DFacSub;
