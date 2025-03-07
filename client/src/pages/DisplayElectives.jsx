import { useEffect, useState } from 'react';
import { Button, Modal, Table, Form } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaPencilAlt, FaTrashAlt } from 'react-icons/fa';
import '../styles/DisplayElectives.css';

function DisplayElectives() {
  const [electives, setElectives] = useState([]);
  const [filteredElectives, setFilteredElectives] = useState([]);
  const [deleteMode, setDeleteMode] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [deleteIds, setDeleteIds] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [selectedSemester, setSelectedSemester] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editElective, setEditElective] = useState({
    id: '',
    semester_id: '',
    elective_id: '',
    elective_subject_id: '',
    elective_name: '',
    elective_section: '',
    faculty_id: '',
    hours_per_week: ''
  });

  useEffect(() => {
    fetchElectives();
  }, []);

  useEffect(() => {
    if (electives.length > 0 && deleteIds.length === electives.length) {
      setSelectAll(true);
    } else {
      setSelectAll(false);
    }
  }, [deleteIds, electives]);

  useEffect(() => {
    if (selectedSemester) {
      setFilteredElectives(electives.filter(e => e.semester_id == selectedSemester));
    } else {
      setFilteredElectives(electives);
    }
  }, [selectedSemester, electives]);

  const fetchElectives = () => {
    fetch('http://localhost:3000/getElectives')
      .then(response => response.json())
      .then(data => {
        setElectives(data);
        setFilteredElectives(data);
      })
      .catch(error => console.error('Error fetching electives data:', error));
  };

  const handleCheckboxChange = (compositeKey) => {
    setDeleteIds(prev =>
        prev.includes(compositeKey) ? prev.filter(key => key !== compositeKey) : [...prev, compositeKey]
    );
  };

  const handleSelectAll = () => {
    if (selectAll) {
        setDeleteIds([]);
    } else {
        setDeleteIds(filteredElectives.map(item => 
            `${item.semester_id}-${item.elective_section}-${item.elective_id}`
        ));
    }
    setSelectAll(!selectAll);
  };

  const confirmDelete = () => {
    if (deleteIds.length > 0) {
        Promise.all(deleteIds.map(compositeKey => {
            console.log('Attempting to delete:', compositeKey);
            return fetch(`http://localhost:3000/deleteElective/${compositeKey}`, { method: 'DELETE' })
                .then(response => {
                    if (!response.ok) {
                        console.error('Failed to delete:', compositeKey, response.status);
                        throw new Error(`Failed to delete elective with composite key: ${compositeKey}`);
                    }
                    return response.json();
                })
                .then(data => {
                    console.log('Delete response:', data); // Log server response
                    return data;
                });
        }))
        .then(responses => {
            console.log('All deletion responses:', responses);
            // Verify all deletions were successful
            if (responses.every(response => response.success)) {
                console.log('Deletion successful for all selected electives');
                fetchElectives(); // Refresh data from server
                setDeleteIds([]);
                setSelectAll(false);
                setShowConfirmation(false);
            } else {
                throw new Error('Some deletions failed');
            }
        })
        .catch(error => {
            console.error('Error deleting electives:', error);
            // Optionally show error to user
        });
    }
  };

  const handleEdit = (elective) => {
    setEditElective(elective);
    setShowEditModal(true);
  };

  const handleEditChange = (e) => {
    setEditElective(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const saveEdit = () => {
    fetch(`http://localhost:3000/updateElective/${editElective.id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editElective)
    })
      .then(() => {
        fetchElectives();
        setShowEditModal(false);
      })
      .catch(error => console.error('Error updating elective:', error));
  };

  return (
    <div className="electives-container">
      <div className="electives-card">
        <div className="electives-actions">
          <Link to="/admin/addElective" className="btn btn-dark">
            Add Elective
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

        <Table striped bordered hover className="electives-table mt-3">
          <thead>
            <tr>
              <th>
                <Form.Select value={selectedSemester} onChange={(e) => setSelectedSemester(e.target.value)}>
                  <option value="">All Semesters</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(semester => (
                    <option key={semester} value={semester}>{semester}</option>
                  ))}
                </Form.Select>
              </th>
              <th>Elective ID</th>
              <th>Elective Subject ID</th>
              <th>Elective Name</th>
              <th>Elective Section</th>
              <th>Faculty ID</th>
              <th>Hours per Week</th>
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
            {filteredElectives.map((section) => {
                const compositeKey = `${section.semester_id}-${section.elective_section}-${section.elective_id}`;
                return (
                    <tr key={compositeKey} className={deleteMode ? "delete-mode-row" : ""}>
                        <td>{section.semester_id}</td>
                        <td>{section.elective_id}</td>
                        <td>{section.elective_subject_id || 'N/A'}</td>
                        <td>{section.elective_name}</td>
                        <td>{section.elective_section}</td>
                        <td>{section.faculty_id || 'N/A'}</td>
                        <td>{section.hours_per_week}</td>
                        <td>
                          <FaPencilAlt className="edit-icon" onClick={() => handleEdit(section)} />
                        </td>
                        {deleteMode && (
                            <td className="text-center">
                                <Form.Check
                                    type="checkbox"
                                    className="large-checkbox"
                                    checked={deleteIds.includes(compositeKey)}
                                    onChange={() => handleCheckboxChange(compositeKey)}
                                />
                            </td>
                        )}
                    </tr>
                );
            })}
          </tbody>
        </Table>

        {/* Delete Selected Button */}
        {deleteMode && deleteIds.length > 0 && (
          <Button
            variant="danger"
            className="delete-fab"
            onClick={() => setShowConfirmation(true)}
          >
            <FaTrashAlt /> Delete Selected
          </Button>
        )}

        {/* Confirmation Modal */}
        <Modal show={showConfirmation} onHide={() => setShowConfirmation(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Confirm Deletion</Modal.Title>
          </Modal.Header>
          <Modal.Body>Are you sure you want to delete the selected electives?</Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowConfirmation(false)}>Cancel</Button>
            <Button variant="danger" onClick={confirmDelete}>Delete</Button>
          </Modal.Footer>
        </Modal>

        {/* Edit Modal */}
        <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Edit Elective</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group>
                <Form.Label>Elective Name</Form.Label>
                <Form.Control type="text" name="elective_name" value={editElective.elective_name} onChange={handleEditChange} />
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

export default DisplayElectives;