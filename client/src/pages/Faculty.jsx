import { useEffect, useState } from 'react';
import { Button, Modal, Table, Form } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import '../styles/AddFaculty.css';

function Faculty() {
  const [faculty, setFaculty] = useState([]);
  const [showDeleteSymbol, setShowDeleteSymbol] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFaculty, setEditFaculty] = useState({ id: '', name: '', department: '' });

  useEffect(() => {
    fetchFaculty();
  }, []);

  const fetchFaculty = () => {
    fetch('http://localhost:3000/faculty')
      .then(response => response.json())
      .then(data => {
        console.log('Fetched Faculty:', data);
        setFaculty(data);
      })
      .catch(error => console.error('Error fetching faculty data:', error));
  };

  // Handle deletion
  const handleDelete = (id) => {
    setDeleteId(id);
    setShowConfirmation(true);
  };

  const confirmDelete = () => {
    if (deleteId !== null) {
      fetch(`http://localhost:3000/deleteFaculty/${deleteId}`, {
        method: 'DELETE',
      })
        .then(response => response.json())
        .then(data => {
          console.log('Deleted Faculty:', data);
          fetchFaculty(); // Fetch updated list after deletion
        })
        .catch(error => console.error('Error deleting faculty:', error));
    }
    setShowConfirmation(false);
    setDeleteId(null);
  };

  // Handle edit functionality
  const handleEdit = (faculty) => {
    setEditFaculty(faculty);
    setShowEditModal(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFaculty(prev => ({ ...prev, [name]: value }));
  };

  const saveEdit = () => {
    if (editFaculty.name && editFaculty.department) {
        fetch(`http://localhost:3000/updateFaculty/${editFaculty.id}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: editFaculty.name,
                department: editFaculty.department
            })
        })
        .then(response => response.json())
        .then(data => {
            console.log('Updated Faculty:', data);
            fetchFaculty(); // Refresh the faculty list after saving changes
            setShowEditModal(false); // Close the edit modal
        })
        .catch(error => console.error('Error updating faculty:', error));
    } else {
        console.error('Name and Department are required fields.');
    }
};


  return (
    <div className="faculty-container">
      <div className="faculty-card">
        <div className="faculty-actions">
          <Link to="/addFaculty" className="add-faculty-btn">
            Add Faculty
          </Link>
          <Button
            variant="danger"
            onClick={() => setShowDeleteSymbol(!showDeleteSymbol)}
            className="delete-mode-btn"
          >
            Delete Mode
          </Button>
        </div>

        <Table striped bordered hover className="faculty-table table-responsive">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Department</th>
              {showDeleteSymbol && <th>Delete</th>}
              <th>Edit</th>
            </tr>
          </thead>
          <tbody>
            {faculty.map((item) => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>{item.name}</td>
                <td>{item.department}</td>
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
                <td>
                  <Button
                    variant="warning"
                    className="edit-btn"
                    onClick={() => handleEdit(item)}
                  >
                    Edit
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      <Modal show={showConfirmation} onHide={() => setShowConfirmation(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to delete this faculty?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConfirmation(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDelete}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Faculty</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="formFacultyName">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={editFaculty.name}
                onChange={handleEditChange}
                placeholder="Enter Faculty Name"
              />
            </Form.Group>
            <Form.Group controlId="formFacultyDepartment" className="mt-3">
              <Form.Label>Department</Form.Label>
              <Form.Select 
                            name="department" 
                            aria-label="Select Department" 
                            onChange={handleEditChange} 
                            value={faculty.department} 
                            className='formSelect'
                            required
                        >
                            <option value="">Select Department</option>
                            <option value="CSE">CSE</option>
                            <option value="IT">IT</option>
                            <option value="CSIT">CSIT</option>
                            <option value="DE">DE</option>
                            <option value="CIVIL">CIVIL</option>
                            <option value="CHEM">CHEM</option>
                            <option value="ECE">ECE</option>
                            <option value="EEE">EEE</option>
                            <option value="MECH">MECH</option>
                            <option value="S&H">S&H</option>
                            <option value="T&P">T&P</option>
                        </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={saveEdit}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default Faculty;
