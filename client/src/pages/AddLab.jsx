import { useState, useEffect } from 'react';
import Form from 'react-bootstrap/Form';
import Table from 'react-bootstrap/Table';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import { FaTrashAlt } from 'react-icons/fa';
import { FaPencil } from 'react-icons/fa6';

function AddLab() {
    const [lab, setLab] = useState({ lab_name: ''});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [labs, setLabs] = useState([]);
    const [deleteMode, setDeleteMode] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [currentLab, setCurrentLab] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [labToDelete, setLabToDelete] = useState(null);

    useEffect(() => {
        fetchLabs();
    }, []);

    const fetchLabs = () => {
        fetch('http://localhost:3000/getLab')
            .then(response => response.json())
            .then(data => setLabs(data));
    };

    const handleChange = (e) => {
        setLab({ ...lab, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        fetch('http://localhost:3000/addLab', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(lab)
        })
        .then(response => response.json())
        .then(() => {
            setLoading(false);
            setLab({ lab_name: '' });
            fetchLabs();
            setSuccessMessage('Lab added successfully!');
        })
        .catch(() => {
            setLoading(false);
            setError('There was an error adding the lab.');
        });
    };

    const confirmDelete = (labName) => {
        setLabToDelete(labName);
        setShowDeleteConfirm(true);
    };

    const handleDelete = () => {
        if (!labToDelete) return;
        fetch(`http://localhost:3000/deleteLab?lab_name=${encodeURIComponent(labToDelete)}`, {
            method: 'DELETE'
        })
        .then(() => {
            fetchLabs();
            setSuccessMessage('Lab deleted successfully!');
            setShowDeleteConfirm(false);
            setLabToDelete(null);
        })
        .catch(() => setError('Error deleting lab'));
    };

    const handleEdit = (lab) => {
        setCurrentLab(lab);
        setEditMode(true);
        setLab({ lab_name: lab.lab_name });
    };

    const handleUpdate = () => {
        fetch('http://localhost:3000/updateLab', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ old_lab_name: currentLab.lab_name, new_lab_name: lab.lab_name })
        })
        .then(() => {
            setEditMode(false);
            setCurrentLab(null);
            setLab({ lab_name: '' });
            fetchLabs();
            setSuccessMessage('Lab updated successfully!');
        })
        .catch(() => setError('Error updating lab'));
    };

    return (
        <div>
            <Modal show={!!successMessage} onHide={() => setSuccessMessage(null)}>
                <Modal.Header closeButton>
                    <Modal.Title>Success</Modal.Title>
                </Modal.Header>
                <Modal.Body>{successMessage}</Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" onClick={() => setSuccessMessage(null)}>OK</Button>
                </Modal.Footer>
            </Modal>

            <Modal show={showDeleteConfirm} onHide={() => setShowDeleteConfirm(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Delete</Modal.Title>
                </Modal.Header>
                <Modal.Body>Are you sure you want to delete {labToDelete}?</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)}>Cancel</Button>
                    <Button variant="danger" onClick={handleDelete}>Delete</Button>
                </Modal.Footer>
            </Modal>

            <div className="d-flex justify-content-center pt-5">
                <div className="w-50 rounded faculty p-3">
                    <h1 className="text-center text-dark">Enter Lab Name</h1>
                    {error && <div className="alert alert-danger">{error}</div>}
                    <form onSubmit={(e) => {
                        e.preventDefault();
                        editMode ? handleUpdate() : handleSubmit(e);
                    }}>
                        <div className="mb-2">
                            <input 
                                type="text" 
                                name="lab_name" 
                                placeholder="Enter Lab Name" 
                                className="form-control" 
                                onChange={handleChange} 
                                value={lab.lab_name} 
                                required 
                            />
                        </div>
                        <div className="d-flex justify-content-center">
                            <button className="btn btn-dark" type="submit" disabled={loading}>
                                {loading ? 'Submitting...' : (editMode ? 'Update' : 'Submit')}
                            </button>
                            {editMode && (
                                <button 
                                    className="btn btn-secondary ms-2" 
                                    type="button"
                                    onClick={() => {
                                        setEditMode(false);
                                        setCurrentLab(null);
                                        setLab({ lab_name: '' });
                                    }}
                                >
                                    Cancel
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>

            <div className="faculty-container mt-4">
                <div className="faculty-card">
                    <div className="faculty-actions d-flex justify-content-end">
                        <Form.Check
                            type="switch"
                            id="delete-mode-switch"
                            label="Enable Delete Mode"
                            checked={deleteMode}
                            onChange={() => setDeleteMode(!deleteMode)}
                        />
                    </div>

                    <Table striped bordered hover className="w-100">
                        <thead>
                            <tr>
                                <th className="w-50">Lab Name</th>
                                <th className="w-25">Actions</th>
                                {deleteMode && <th className="w-25">Delete</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {labs.map((item) => (
                                <tr key={item.id}>
                                    <td className="w-50">{item.lab_name}</td>
                                    <td className="w-25">
                                        <FaPencil 
                                            className="edit-icon me-2" 
                                            onClick={() => handleEdit(item)}
                                            style={{ cursor: 'pointer', color: 'blue' }}
                                        />
                                    </td>
                                    {deleteMode && (
                                        <td className="w-25 text-center">
                                            <FaTrashAlt 
                                                className="delete-icon" 
                                                onClick={() => confirmDelete(item.lab_name)}
                                                style={{ cursor: 'pointer', color: 'red' }}
                                            />
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </div>
            </div>
        </div>
    );
}

export default AddLab;