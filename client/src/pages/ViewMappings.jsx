import { useState } from 'react';
import Form from 'react-bootstrap/Form';
import GFacSub from './GFacSub';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import '../styles/App.css';
import '../styles/ViewMappings.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function ViewMappings() {
    const [selectedSemester, setSelectedSemester] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showResultModal, setShowResultModal] = useState(false);
    const [deleteResult, setDeleteResult] = useState('');
    const [refreshKey, setRefreshKey] = useState(0); // Add this line
    const [showGenerateModal, setShowGenerateModal] = useState(false);
    const [showGenerateResultModal, setShowGenerateResultModal] = useState(false);
    const [generateResult, setGenerateResult] = useState('');

    const handleSemesterChange = (e) => {
        setSelectedSemester(e.target.value);
    };
    
    const handleGenerateConfirmation = () => {
        setShowGenerateModal(true);
    };

    const handleGenerateConfirmed = () => {
        setShowGenerateModal(false);
        fetch(`${API_BASE_URL}/generate?semester=${selectedSemester}`)
            .then(response => {
                if (response.ok) {
                    return response.text();
                } else {
                    throw new Error(`Server Error: ${response.status}`);
                }
            })
            .then(() => {
                setGenerateResult(`Timetable, Faculty timetable, and Lab timetable updated for Semester ${selectedSemester}`);
                setShowGenerateResultModal(true);
                setRefreshKey(prevKey => prevKey + 1);
            })
            .catch(err => {
                setGenerateResult(`Error: ${err.message}`);
                setShowGenerateResultModal(true);
            });
    };

    const handleDeleteConfirmation = () => {
        setShowDeleteModal(true);
    };

    const handleDeleteConfirmed = () => {
        setShowDeleteModal(false);
        fetch(`${API_BASE_URL}/deleteData?semester=${selectedSemester}`)
            .then(response => {
                if (response.ok) {
                    return response.text();
                } else {
                    throw new Error(`Server Error: ${response.status}`);
                }
            })
            .then(() => {
                setDeleteResult(`Semester ${selectedSemester} data deleted`);
                setShowResultModal(true);
                setRefreshKey(prevKey => prevKey + 1);
            })
            .catch(() => {
                setDeleteResult(`Semester ${selectedSemester} data deleted`);
                setShowResultModal(true);
                setRefreshKey(prevKey => prevKey + 1);
            });
    };

    return (
        <div className="semester-container">
            <div className="semester-selection">
            <Form>
                <div className="justify-content-center pt-2 pb-2">
                    <div className="d-flex flex-row justify-content-center">
                        <h4 className="justify-content-center rounded mr-2">
                            Select Semester
                            <svg xmlns="http://www.w3.org/2000/svg" width="50" height="25" fill="currentColor" className="bi bi-arrow-right" viewBox="0 0 16 16">
                                <path fillRule="evenodd" d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8" />
                            </svg>
                        </h4>
                        <div>
                            <Form.Select
                                name="semester"
                                value={selectedSemester}
                                onChange={handleSemesterChange}
                                aria-label="Select Semester"
                            >
                                <option value="">Select</option>
                                {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                                    <option key={sem} value={sem}>{sem}</option>
                                ))}
                            </Form.Select>
                        </div>
                    </div>
                </div>
            </Form>
            </div>

            {selectedSemester && 
           <div className="generate-container pt-3 pb-3">
                <h1>Generate for {selectedSemester} semester</h1>
                <div className='d-flex flex-row justify-content-between'>
                    <Button className="btn btn-dark" onClick={handleGenerateConfirmation}> Generate</Button>
                    <Button className="btn btn-dark" onClick={handleDeleteConfirmation}>Delete timetable data</Button>
                </div>
                <GFacSub 
                    key={refreshKey}
                    selectedSemester={selectedSemester}
                    refreshMappings={refreshKey} // Add this prop
                />
            </div>
        }

            {/* Generate Confirmation Modal */}
            <Modal show={showGenerateModal} onHide={() => setShowGenerateModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Generation</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Generating the following semester {selectedSemester}</p>
                    <ul>
                        <li>Timetable data</li>
                        <li>Faculty timetable data</li>
                        <li>Lab timetable data</li>
                    </ul>
                    <p className='text-danger'> * [PREVIOUSLY GENERATED DATA, IF ANY, WILL BE ERASED]</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowGenerateModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={handleGenerateConfirmed}>
                        Confirm
                    </Button>
                </Modal.Footer>
            </Modal>
            {/* Delete Confirmation Modal */}
            <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Deletion</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Are you sure you want to delete the following for semester {selectedSemester}?</p>
                    <ul>
                        <li>Timetable data</li>
                        <li>Faculty timetable data</li>
                        {selectedSemester >= 5 && <li>Elective data</li>}
                        <li>Lab data</li>
                    </ul>
                    <p>This action cannot be undone.</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={handleDeleteConfirmed}>
                        Delete
                    </Button>
                </Modal.Footer>
            </Modal>
            {/* Result Modal */}
            <Modal show={showResultModal} onHide={() => setShowResultModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Deletion Result</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Semester {selectedSemester} data deleted</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowResultModal(false)}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
            {/* Generate Result Modal */}
            <Modal show={showGenerateResultModal} onHide={() => setShowGenerateResultModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Generation Result</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>{generateResult}</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowGenerateResultModal(false)}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}

export default ViewMappings;
