import { useEffect, useState } from 'react';
import { Button, Modal, Table, Form } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaPencilAlt, FaTrashAlt } from 'react-icons/fa';
import '../styles/AddFaculty.css';

function Faculty() {
  const [faculty, setFaculty] = useState([]);
  const [deleteMode, setDeleteMode] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [deleteIds, setDeleteIds] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFaculty, setEditFaculty] = useState({ id: '', name: '', department: '' });

  useEffect(() => {
    fetchFaculty();
  }, []);

  const fetchFaculty = () => {
    fetch('http://localhost:3000/faculty')
      .then(response => response.json())
      .then(data => setFaculty(data))
      .catch(error => console.error('Error fetching faculty data:', error));
  };

  const handleCheckboxChange = (id) => {
    setDeleteIds(prev =>
      prev.includes(id) ? prev.filter(deleteId => deleteId !== id) : [...prev, id]
    );
  };

  const confirmDelete = () => {
    if (deleteIds.length > 0) {
      Promise.all(deleteIds.map(id =>
        fetch(`http://localhost:3000/deleteFaculty/${id}`, { method: 'DELETE' })
      ))
        .then(() => {
          fetchFaculty(); // Refresh the faculty list after deletion
          setDeleteIds([]);
        })
        .catch(error => console.error('Error deleting faculty:', error));
    }
    setShowConfirmation(false);
  };

  const handleEdit = (faculty) => {
    setEditFaculty(faculty);
    setShowEditModal(true);
  };

  const handleEditChange = (e) => {
    setEditFaculty(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const saveEdit = () => {
    fetch(`http://localhost:3000/updateFaculty/${editFaculty.id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: editFaculty.name, department: editFaculty.department })
    })
      .then(() => {
        fetchFaculty();
        setShowEditModal(false);
      })
      .catch(error => console.error('Error updating faculty:', error));
  };

  return (
    <div className="faculty-container">
      <div className="faculty-card">
        <div className="faculty-actions">
          <Link to="/addFaculty" className="add-faculty-btn">Add Faculty</Link>

          {/* ✅ Professional Toggle for Delete Mode */}
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
              <th>ID</th>
              <th>Name</th>
              <th>Department</th>
              <th>Edit</th>
              {deleteMode && <th>Select</th>}
            </tr>
          </thead>
          <tbody>
            {faculty.map((item) => (
              <tr key={item.id} className={deleteMode ? "delete-mode-row" : ""}>
                <td>{item.id}</td>
                <td>{item.name}</td>
                <td>{item.department}</td>
                <td>
                  <FaPencilAlt className="edit-icon" onClick={() => handleEdit(item)} />
                </td>
                {deleteMode && (
                  <td>
                    <Form.Check
                      type="checkbox"
                      checked={deleteIds.includes(item.id)}
                      onChange={() => handleCheckboxChange(item.id)}
                    />
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </Table>

        {/* ✅ Floating Delete Button (Only Visible in Delete Mode) */}
        {deleteMode && (
          <Button
            variant="danger"
            className="delete-fab"
            onClick={() => setShowConfirmation(true)}
          >
            <FaTrashAlt /> Delete Selected
          </Button>
        )}
      </div>

      {/* Confirmation Modal */}
      <Modal show={showConfirmation} onHide={() => setShowConfirmation(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to delete the selected faculty members?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConfirmation(false)}>Cancel</Button>
          <Button variant="danger" onClick={confirmDelete}>Delete</Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Faculty</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="formFacultyName">
              <Form.Label>Name</Form.Label>
              <Form.Control type="text" name="name" value={editFaculty.name} onChange={handleEditChange} />
            </Form.Group>
            <Form.Group controlId="formFacultyDepartment" className="mt-3">
              <Form.Label>Department</Form.Label>
              <Form.Control type="text" name="department" value={editFaculty.department} onChange={handleEditChange} />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={saveEdit}>Save Changes</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default Faculty;