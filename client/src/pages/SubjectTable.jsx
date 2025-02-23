import { useEffect, useState } from 'react';
import { Button, Modal, Table } from 'react-bootstrap';
import { Link} from 'react-router-dom';
import '../styles/SubjectTable.css';

function SubjectTable() {
    const [subjects, setSubjects] = useState([]);
    const [showDeleteSymbol, setShowDeleteSymbol] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const [showConfirmation, setShowConfirmation] = useState(false);

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
        setDeleteId(id);
        setShowConfirmation(true);
    };

    const confirmDelete = () => {
        if (deleteId !== null) {
            fetch(`http://localhost:3000/deleteSubject/${deleteId}`, {
                method: 'DELETE'
            })
            .then(response => response.json())
            .then(data => {
                console.log('Success:', data);
                fetchSubjects(); // Refresh the list after deletion
            })
            .catch(error => console.error('Error:', error));
        }
        setShowConfirmation(false);
        setDeleteId(null);
    };

    return (
        <div className="subject-container">
            <div className="subject-card">
                <div className="subject-actions">
                    <Link to="/addSubjects" className="bg-black add-subject-btn">
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
                <Table striped bordered hover className="subject-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Semester</th>
                            <th>Name</th>
                            <th>Subject Type</th>
                            <th>Hours Per Week</th>
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
        </div>
    );
}

export default SubjectTable;
