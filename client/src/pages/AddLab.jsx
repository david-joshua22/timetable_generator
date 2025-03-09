// Remove unused import
import { useState, useEffect } from 'react';
import Form from 'react-bootstrap/Form';
import Table from 'react-bootstrap/Table';
import { FaTrashAlt } from 'react-icons/fa';

function AddLab() {
    const [lab, setLab] = useState({ lab_name: ''});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [labs, setLabs] = useState([]);
    const [deleteMode, setDeleteMode] = useState(false);
    // Remove: const [editMode, setEditMode] = useState(false);
    // Remove: const [currentLab, setCurrentLab] = useState(null);


    useEffect(() => {
        console.log("Fetching labs..."); // Debug log
        fetchLabs();
    }, []);

    const fetchLabs = () => {
        console.log("Inside fetchLabs"); // Debug log
        fetch('http://localhost:3000/getLab')
            .then(response => {
                console.log("Response received:", response); // Debug log
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                console.log("Labs data:", data); // Debug log
                setLabs(data);
            })
            .catch(error => {
                console.error('Error fetching labs:', error);
                setError('Failed to fetch labs. Please try again.');
            });
    };

    const handleChange = (e) => {
        setLab({ ...lab, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);

        fetch('http://localhost:3000/addLab', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(lab)
        })
        .then(response => response.json())
        .then(() => {  // Remove unused data parameter
            setLoading(false);
            setSuccess(true);
            setLab({ lab_name: '' });
            fetchLabs();
        })
        .catch(error => {
            setLoading(false);
            setError('There was an error adding the lab.');
            console.error('Error:', error);
        });
    };

    const handleDelete = (labName) => {
        fetch(`http://localhost:3000/deleteLab?lab_name=${encodeURIComponent(labName)}`, {
            method: 'DELETE'
        })
        .then(response => response.json())
        .then(() => {  // Remove unused data parameter
            fetchLabs();
        })
        .catch(error => console.error('Error deleting lab:', error));
    };

    // Remove handleEdit and handleUpdate functions

    return (
        <div>
            <div className="d-flex justify-content-center pt-5">
                <div className="w-50 rounded faculty p-3">
                    <h1 className="text-center">Enter Lab Name</h1>
                    {error && <div className="alert alert-danger">{error}</div>}
                    {success && <div className="alert alert-success">Lab added successfully!</div>}
                    <form onSubmit={handleSubmit}>
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
                            <button className="btn btn-light" type="submit" disabled={loading}>
                                {loading ? 'Submitting...' : 'Submit'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <div className="faculty-container mt-4">
                <div className="faculty-card">
                    <div className="faculty-actions">
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

                    <Table striped bordered hover className="faculty-table">
                        <thead>
                            <tr>
                                <th>Lab Name</th>
                                {deleteMode && <th>Delete</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {labs.map((item) => (
                                <tr key={item.id}>
                                    <td>{item.lab_name}</td>
                                    {deleteMode && (
                                        <td className="text-center">
                                            <FaTrashAlt 
                                                className="delete-icon" 
                                                onClick={() => handleDelete(item.lab_name)}
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
