import { useEffect, useState } from 'react';
import { Button, Modal, Table, Form } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaPencilAlt, FaTrashAlt } from 'react-icons/fa';
import '../styles/SubjectTable.css';

function SubjectTable() {
    const [subjects, setSubjects] = useState([]);
    const [selectedSemester, setSelectedSemester] = useState('all'); // Add this state
    const [deleteMode, setDeleteMode] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [deleteIds, setDeleteIds] = useState([]);
    const [selectAll, setSelectAll] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editSubject, setEditSubject] = useState({
        id: '', semester_id: '', name: '', type: '', hours_per_week: ''
    });

    useEffect(() => {
        fetchSubjects();
    }, [selectedSemester]); // Add selectedSemester to dependency array

    const fetchSubjects = () => {
        const url = selectedSemester === 'all' 
            ? 'http://localhost:3000/subjects'
            : `http://localhost:3000/subjects?semester=${selectedSemester}`;
            
        fetch(url)
            .then(response => response.json())
            .then(data => setSubjects(data))
            .catch(error => console.error('Error fetching subjects data:', error));
    };

    const handleCheckboxChange = (id) => {
        setDeleteIds(prev =>
            prev.includes(id) ? prev.filter(deleteId => deleteId !== id) : [...prev, id]
        );
    };

    const handleSelectAll = () => {
        if (selectAll) {
            setDeleteIds([]);
        } else {
            setDeleteIds(subjects.map(item => item.id));
        }
        setSelectAll(!selectAll);
    };

    const confirmDelete = () => {
        if (deleteIds.length > 0) {
            Promise.all(deleteIds.map(id =>
                fetch(`http://localhost:3000/deleteSubject/${id}`, { method: 'DELETE' })
            ))
                .then(() => {
                    fetchSubjects();
                    setDeleteIds([]);
                    setSelectAll(false);
                })
                .catch(error => console.error('Error deleting subjects:', error));
        }
        setShowConfirmation(false);
    };

    const handleEdit = (subject) => {
        setEditSubject(subject);
        setShowEditModal(true);
    };

    const handleEditChange = (e) => {
        setEditSubject(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const saveEdit = () => {
        fetch(`http://localhost:3000/updateSubject/${editSubject.id}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(editSubject)
        })
            .then(() => {
                fetchSubjects();
                setShowEditModal(false);
            })
            .catch(error => console.error('Error updating subject:', error));
    };

    return (
        <div className="subject-container">
            <div className="subject-card">
                <div className="subject-actions">
                    <Link to="/admin/addSubjects" className="add-subject-btn btn-dark">
                        Add Subject
                    </Link>
                

                    <div className="delete-mode-toggle">
                        <Form.Check
                            type="switch"
                            id="delete-mode-switch"
                            label="Enable Delete Mode"
                            checked={deleteMode}
                            onChange={() => setDeleteMode(!deleteMode)}
                        />
                    </div>
                </div>

                <Table striped bordered hover className="subject-table mt-3">
                    <thead>
                        <tr>
                        <th>
                            <Form.Select value={selectedSemester} onChange={(e) => setSelectedSemester(e.target.value)}>
                            <option value="">All Semesters</option>
                            {[1, 2, 3, 4, 5, 6, 7, 8].map(semester => (
                                <option key={semester} value={semester}>Semester {semester}</option>
                            ))}
                            </Form.Select>
                        </th>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Subject Type</th>
                            <th>Hours Per Week</th>
                            <th>Edit</th>
                            {deleteMode && (
                                <th className="text-center">
                                    <span>Select All</span>
                                    <Form.Check
                                        type="checkbox"
                                        checked={selectAll}
                                        onChange={handleSelectAll}
                                        className="ms-2 large-checkbox"
                                    />
                                </th>
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {subjects.map((item) => (
                            <tr key={item.id} className={deleteMode ? "delete-mode-row" : ""}>
                                <td>{item.semester_id}</td>
                                <td>{item.id}</td>
                                <td>{item.name}</td>
                                <td>
                                    {item.type === '1' ? 'Lecture' :
                                        item.type === '2' ? 'Lab' :
                                            item.type === '3' ? 'Seminar' : item.type}
                                </td>
                                <td>{item.hours_per_week}</td>
                                <td className="text-center">
                                    <FaPencilAlt className="edit-icon" onClick={() => handleEdit(item)} />
                                </td>
                                {deleteMode && (
                                    <td className="text-center">
                                        <Form.Check
                                            type="checkbox"
                                            className="large-checkbox"
                                            checked={deleteIds.includes(item.id)}
                                            onChange={() => handleCheckboxChange(item.id)}
                                        />
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </Table>

                {deleteMode && deleteIds.length > 0 && (
                    <Button
                        variant="danger"
                        className="delete-fab"
                        onClick={() => setShowConfirmation(true)}
                    >
                        <FaTrashAlt /> Delete Selected
                    </Button>
                )}

                <Modal show={showConfirmation} onHide={() => setShowConfirmation(false)}>
                    <Modal.Header closeButton>
                        <Modal.Title>Confirm Deletion</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <p>Are you sure you want to delete the selected subjects?</p>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowConfirmation(false)}>Cancel</Button>
                        <Button variant="danger" onClick={confirmDelete}>Delete</Button>
                    </Modal.Footer>
                </Modal>

                {/* Edit Subject Modal */}
                <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
                    <Modal.Header closeButton>
                        <Modal.Title>Edit Subject</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form>
                            <Form.Group controlId="formSubjectCode">
                                <Form.Label>Subject Code</Form.Label>
                                <Form.Control type="text" name="id" value={editSubject.id} onChange={handleEditChange} disabled />
                            </Form.Group>
                            <Form.Group controlId="formSubjectName" className="mt-3">
                                <Form.Label>Subject Name</Form.Label>
                                <Form.Control type="text" name="name" value={editSubject.name} onChange={handleEditChange} />
                            </Form.Group>
                            <Form.Group controlId="formSubjectSemester" className="mt-3">
                                <Form.Label>Semester</Form.Label>
                                <Form.Control type="number" name="semester_id" value={editSubject.semester_id} onChange={handleEditChange} />
                            </Form.Group>
                            <Form.Group controlId="formSubjectType" className="mt-3">
                                <Form.Label>Subject Type</Form.Label>
                                <Form.Select name="type" value={editSubject.type} onChange={handleEditChange}>
                                    <option value="1">Lecture</option>
                                    <option value="2">Lab</option>
                                    <option value="3">Elective</option>
                                </Form.Select>
                            </Form.Group>
                            <Form.Group controlId="formSubjectHours" className="mt-3">
                                <Form.Label>Hours Per Week</Form.Label>
                                <Form.Control type="number" name="hours_per_week" value={editSubject.hours_per_week} onChange={handleEditChange} />
                            </Form.Group>
                        </Form>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowEditModal(false)}>Cancel</Button>
                        <Button variant="primary" onClick={saveEdit}>Save Changes</Button>
                    </Modal.Footer>
                </Modal>
            </div>
        </div>
    );
}

export default SubjectTable;
