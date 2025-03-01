import { useEffect, useState, useCallback } from 'react';
import { Button, Modal, Table, Form } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import '../styles/SubjectTable.css';

function SubjectTable() {
    const [subjects, setSubjects] = useState([]);
    const [showDeleteSymbol, setShowDeleteSymbol] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [subject, setSubject] = useState({ id: '', name: '', type: '', hours_per_week: '', semester_id: '' });

    // Optimized function to fetch subjects
    const fetchSubjects = useCallback(() => {
        fetch('http://localhost:3000/subjects')
            .then(response => response.json())
            .then(data => setSubjects(data))
            .catch(error => console.error('Error fetching subjects data:', error));
    }, []);

    useEffect(() => {
        fetchSubjects();
    }, [fetchSubjects]);

    // Handle subject deletion
    const handleDelete = (id) => {
        setDeleteId(id);
        setShowConfirmation(true);
    };

    const confirmDelete = () => {
        if (deleteId !== null) {
            fetch(`http://localhost:3000/deleteSubject/${deleteId}`, {
                method: 'DELETE'
            })
            .then(response => response.json())
            .then(() => {
                fetchSubjects();
                setShowConfirmation(false);
                setDeleteId(null);
            })
            .catch(error => console.error('Error:', error));
        }
    };

    // Handle edit button click
    const handleEdit = (subjectData) => {
        setSubject(subjectData);
        setShowEditModal(true);
    };

    // Handle form input changes
    const handleChange = (e) => {
        setSubject({ ...subject, [e.target.name]: e.target.value });
    };

    // Handle form submission (Edit Subject)
    const handleSubmit = (e) => {
        e.preventDefault();
        fetch(`http://localhost:3000/updateSubject/${subject.id}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(subject)
        })
        .then(response => response.json())
        .then(() => {
            fetchSubjects(); // Refresh table
            setShowEditModal(false); // Close modal
        })
        .catch(error => console.error('Error:', error));
    };

    return (
        <div className="subject-container">
            <div className="subject-card">
                <div className="subject-actions">
                    <Link to="/admin/addSubjects" className="bg-black add-subject-btn">
                        Add Subject
                    </Link>
                    <Button
                        variant="danger"
                        onClick={() => setShowDeleteSymbol(!showDeleteSymbol)}
                        className="delete-mode-btn"
                    >
                        Delete Mode
                    </Button>
                </div>

                <Table striped bordered hover className="subject-table table-responsive">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Semester</th>
                            <th>Name</th>
                            <th>Subject Type</th>
                            <th>Hours Per Week</th>
                            <th>Edit</th>
                            {showDeleteSymbol && <th>Delete</th>}
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
                                <td>
                                    <Button
                                        variant="warning"
                                        className="edit-btn"
                                        onClick={() => handleEdit(item)}
                                    >
                                        Edit
                                    </Button>
                                </td>
                                {showDeleteSymbol && (
                                    <td>
                                        <Button
                                            variant="danger"
                                            className="delete-btn"
                                            onClick={() => handleDelete(item.id)}
                                        >
                                            -
                                        </Button>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </Table>

                {/* Delete Confirmation Modal */}
                <Modal show={showConfirmation} onHide={() => setShowConfirmation(false)}>
                    <Modal.Header closeButton>
                        <Modal.Title>Confirm Deletion</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <p>Are you sure you want to delete this subject?</p>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowConfirmation(false)}>
                            Cancel
                        </Button>
                        <Button variant="danger" onClick={confirmDelete}>
                            Delete
                        </Button>
                    </Modal.Footer>
                </Modal>
            </div>

            {/* Edit Subject Modal */}
            <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Edit Subject</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <input 
                                type="text" 
                                name="name" 
                                placeholder="Enter Subject Name" 
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
                                placeholder="Enter Subject Code" 
                                className="form-control" 
                                value={subject.id || ''}
                                disabled
                                required
                            />
                        </div>
                        <div className="mb-3">
                            <input 
                                type="number" 
                                name="semester_id" 
                                placeholder="Enter Semester ID" 
                                className="form-control" 
                                onChange={handleChange} 
                                value={subject.semester_id || ''}
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
                                <option value="">Select Subject Type</option>
                                <option value="1">Lecture</option>
                                <option value="2">Lab</option>
                                <option value="3">Elective</option>
                            </Form.Select>
                        </div>
                        <div className="mb-3">
                            <input 
                                type="number" 
                                name="hours_per_week" 
                                placeholder="Enter Hours Per Week" 
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
                </Modal.Body>
            </Modal>
        </div>
    );
}

export default SubjectTable;
