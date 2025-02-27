import { useEffect, useState } from 'react';
import { Button, Modal, Table, Form } from 'react-bootstrap';
import '../styles/SubjectTable.css';

function AddElective() {
    const [electiveSections, setElectiveSections] = useState([]);
    const [elective, setElective] = useState([]);
    const [deleteId, setDeleteId] = useState(null);
    const [faculty, setFaculty] = useState([]);
    const[electiveId,setElectiveId] = useState([]);
    // eslint-disable-next-line no-unused-vars
    const [semester,setSemester] = useState([]);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [selectedValues, setSelectedValues] = useState({
        semester_id: "",
        elective_section: "",
        elective_id: "",
        elective_subject_id: "",
        elective_name: "",
        faculty_id: "",
        hours_per_week: ""
    });

    useEffect(() => {
        fetchElectiveSection();
        fetchElectives();
        fetchElectiveId();
        fetch('http://localhost:3000/faculty')
        .then((response) => response.json())
        .then((data) => setFaculty(data))
        .catch((error) => console.error('Error fetching faculty data:', error));
    }, []);

    const fetchElectiveSection = (semesterId) => {
        fetch(`http://localhost:3000/getElectiveSections?semester=${semesterId}`)
            .then(response => response.json())
            .then(data => {
                console.log(data);
                setElectiveSections(data);
            })
            .catch(error => console.error('Error fetching elective sections data:', error));
    };
    
    const fetchElectiveId = (semesterId) =>{
        fetch(`http://localhost:3000/getElectiveId?semester=${semesterId}`)
            .then(response => response.json())
            .then(data => {
                console.log(data);
                setElectiveId(data);
            })
            .catch(error => console.error('Error fetching elective sections data:', error));
    }

    const fetchElectives = () => {
        fetch('http://localhost:3000/getElectives')
            .then(response => response.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setElective(data);
                } else {
                    console.error('Expected an array but got:', data);
                    setElective([]);
                }
            })
            .catch(error => console.error('Error fetching elective data:', error));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setSelectedValues({
            ...selectedValues,
            [name]: value
        });
    };

    const handleSemesterChange = (e) => {
        const semester = e.target.value;
        setSemester(semester);
        fetchElectiveSection(semester); 
        fetchElectiveId(semester);
    };
    
    
    const handleSubmit = (e) => {
        e.preventDefault();

        fetch('http://localhost:3000/addElective', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(selectedValues),
        })
            .then(response => response.json())
            .then(data => {
                console.log('Success:', data);
                fetchElectiveSection(); // Refresh the list after adding
                setSelectedValues({
                    semester_id: "",
                    elective_id: "",
                    elective_subject_id: "",
                    elective_name: "",
                    elective_section: "",
                    faculty_id: "",
                    hours_per_week: ""
                });
            })
            .catch(error => console.error('Error:', error));
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
                    fetchElectiveSection(); // Refresh the list after deletion
                })
                .catch(error => console.error('Error:', error));
        }
        setShowConfirmation(false);
        setDeleteId(null);
    };

    return (
        <div>
            <Form onSubmit={handleSubmit}>
        <div className='rounded-lg shadow-md w-full max-w-4xl mb-6 cardBox'>
            <h1 className='text-center'>Add Elective Subject</h1>
            <div className='d-flex flex-row'>
                <Form.Select
                    name='semester_id'
                    value={selectedValues.semester_id}
                    onChange={(e) => {
                        handleChange(e);
                        handleSemesterChange(e);
                    }}
                    aria-label='Select Semester'
                >
                    <option value=''>Select Semester</option>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((semester) => (
                        <option key={semester} value={semester}>{semester}</option>
                    ))}
                </Form.Select>

                <Form.Select
                    name='elective_id'
                    value={selectedValues.elective_id}
                    onChange={handleChange}
                    aria-label='Select Elective ID'
                >
                    <option value=''>Select Elective ID</option>
                        {electiveId.map((electiveItem) => (
                            <option key={electiveItem.id} value={electiveItem.id}>
                                {electiveItem.id} - {electiveItem.name}
                            </option>
                        ))}
                </Form.Select>

                <Form.Select
                    name='elective_section'
                    value={selectedValues.elective_section}
                    onChange={handleChange}
                    aria-label='Select Elective Section'
                >
                    <option value=''>Select Elective Section</option>
                    {electiveSections.map((elective) => (
                        <option key={elective.section} value={elective.section}>{elective.section}</option>
                    ))}
                </Form.Select>

                <Form.Select
                    name='faculty'
                    value={selectedValues.faculty}
                    onChange={handleChange}
                    aria-label='Select Faculty'
                >
                    <option value=''>Select Faculty</option>
                    {faculty.map((fac) => (
                        <option key={fac.id} value={fac.id}>{fac.name}</option>
                    ))}
                </Form.Select>
            </div>

            <div className='d-flex flex-row p-3 gap-3'>
                <Form.Group className='flex-grow-1'>
                    <Form.Label>Enter Subject Id
                    </Form.Label>
                    <Form.Control
                        type='text'
                        name='elective_subject_id'
                        value={selectedValues.elective_subject_id}
                        onChange={handleChange}
                        placeholder='Elective Subject ID'
                    />
                </Form.Group>

                <Form.Group className='flex-grow-1'>
                    <Form.Label>Enter Elective Name</Form.Label>
                    <Form.Control
                        type='text'
                        name='elective_name'
                        value={selectedValues.elective_name}
                        onChange={handleChange}
                        placeholder='Elective Name'
                    />
                </Form.Group>

                <Form.Group className='flex-grow-1'>
                    <Form.Label>Hours Per Week</Form.Label>
                    <Form.Control
                        type='number'
                        name='hours_per_week'
                        value={selectedValues.hours_per_week}
                        onChange={handleChange}
                        placeholder='Hours Per Week'
                    />
                </Form.Group>
            </div>

            <div className='d-flex justify-content-center mb-3'>
                <Button type='submit' className='btn btn-dark'>Add Elective</Button>
            </div>
        </div>
    </Form>
        <div className='p-3 m-3'>
            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>Semester ID</th>
                        <th>Elective ID</th>
                        <th>Elective Subject ID</th>
                        <th>Elective Name</th>
                        <th>Elective Section</th>
                        <th>Faculty ID</th>
                        <th>Hours Per Week</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {Array.isArray(elective) && elective.map((section) => (
                        <tr key={`${section.semester_id}-${section.elective_id}-${section.elective_section}`}>
                            <td>{section.semester_id}</td>
                            <td>{section.elective_id}</td>
                            <td>{section.elective_subject_id || 'N/A'}</td>
                            <td>{section.elective_name}</td>
                            <td>{section.elective_section}</td>
                            <td>{section.faculty_id || 'N/A'}</td>
                            <td>{section.hours_per_week}</td>
                            <td>
                                <Button variant="danger" onClick={() => handleDelete(section.id)}>Delete</Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </div>

            <Modal show={showConfirmation} onHide={() => setShowConfirmation(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Delete</Modal.Title>
                </Modal.Header>
                <Modal.Body>Are you sure you want to delete this elective section?</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowConfirmation(false)}>Cancel</Button>
                    <Button variant="danger" onClick={confirmDelete}>Delete</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}

export default AddElective;