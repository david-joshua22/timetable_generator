import { useEffect, useState } from 'react';
import { Button, Form, Alert, Table } from 'react-bootstrap';
import { FaChevronRight, FaChevronDown } from 'react-icons/fa';
import '../styles/Container.css';

function AddElective() {
  const [electiveSections, setElectiveSections] = useState([]);
  const [electiveId, setElectiveId] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [semester, setSemester] = useState([]);
  const [electiveData, setElectiveData] = useState([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const [selectedValues, setSelectedValues] = useState({
    semester_id: "",
    elective_id: "",
    elective_subject_id: "",
    elective_name: "",
    elective_section: "",
    faculty_id: "",
    hours_per_week: ""
  });

  useEffect(() => {
    fetchElectiveSection();
    fetchElectiveId();
    fetch('http://localhost:3000/faculty')
      .then(response => response.json())
      .then(data => setFaculty(data))
      .catch(error => console.error('Error fetching faculty data:', error));
  }, []);

  const fetchElectiveSection = (semesterId) => {
    fetch(`http://localhost:3000/getElectiveSections?semester=${semesterId}`)
      .then(response => response.json())
      .then(data => setElectiveSections(data))
      .catch(error => console.error('Error fetching elective sections:', error));
  };

  const fetchElectiveId = (semesterId) => {
    fetch(`http://localhost:3000/getElectiveId?semester=${semesterId}`)
      .then(response => response.json())
      .then(data => setElectiveId(data))
      .catch(error => console.error('Error fetching elective IDs:', error));
  };

  const handleSemesterChange = (e) => {
    const semester = e.target.value;
    setSemester(semester);
    fetchElectiveSection(semester);
    fetchElectiveId(semester);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSelectedValues(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    fetch('http://localhost:3000/addElective', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(selectedValues),
    })
      .then(response => response.json())
      .then(data => {
        console.log('Success:', data);
        setElectiveData([...electiveData, selectedValues]);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
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

  return (
    <div className='container'>
      <h1 className='text-center mb-4 pt-4'>Add Elective Subject</h1>

      {showSuccess && (
        <Alert variant="success" className="text-center">
          Elective added successfully!
        </Alert>
      )}

      <div className='elective-container'>
        {/* Select Elective Details */}
        <div className='elective-box'>
          <h2>Select Elective Details</h2>
          <Form>
            <Form.Group className='mb-3'>
              <Form.Select name='semester_id' value={selectedValues.semester_id} onChange={(e) => {
                handleChange(e);
                handleSemesterChange(e);
              }}>
                <option value=''>Select Semester</option>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((semester) => (
                  <option key={semester} value={semester}>{semester}</option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className='mb-3 pt-2'>
              <Form.Select name='elective_id' value={selectedValues.elective_id} onChange={handleChange}>
                <option value=''>Select Elective ID</option>
                {electiveId.map((electiveItem) => (
                  <option key={electiveItem.id} value={electiveItem.id}>
                    {electiveItem.id} - {electiveItem.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className='mb-3 pt-2'>
              <Form.Select name='elective_section' value={selectedValues.elective_section} onChange={handleChange}>
                <option value=''>Select Elective Section</option>
                {electiveSections.map((section) => (
                  <option key={section.section} value={section.section}>{section.section}</option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className='mb-2 pt-2'>
              <Form.Select name='faculty_id' value={selectedValues.faculty_id} onChange={handleChange}>
                <option value=''>Select Faculty</option>
                {faculty.map((fac) => (
                  <option key={fac.id} value={fac.id}>{fac.name}</option>
                ))}
              </Form.Select>
            </Form.Group>
          </Form>

          {/* Toggle Button for Enter Elective Info */}
          <button className={`arrow-button ${isExpanded ? 'rotate' : ''}`} onClick={() => setIsExpanded(!isExpanded)}>
            {isExpanded ? <FaChevronDown /> : <FaChevronRight />}
          </button>
        </div>

        {/* Enter Elective Details (Appears on the Right) */}
        <div className={`elective-details ${isExpanded ? 'show' : ''}`}>
          <h2>Enter Elective Information</h2>
          <Form onSubmit={handleSubmit}>
            <Form.Group className='mb-2'>
              <Form.Label>Enter Subject ID</Form.Label>
              <Form.Control type='text' name='elective_subject_id' value={selectedValues.elective_subject_id} onChange={handleChange} />
            </Form.Group>
            <Form.Group>
              <Form.Label>Enter Elective Name</Form.Label>
              <Form.Control type='text' name='elective_name' value={selectedValues.elective_name} onChange={handleChange} />
            </Form.Group>
            <Form.Group>
              <Form.Label>Hours Per Week</Form.Label>
              <Form.Control type='number' name='hours_per_week' value={selectedValues.hours_per_week} onChange={handleChange} />
            </Form.Group>
            <Button type='submit' className='btn btn-dark w-100 mt-3'>Add Elective</Button>
          </Form>
        </div>
      </div>

      {/* Table to display entered information */}
      <div className='mt-4 added-elective'>
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
            </tr>
          </thead>
          <tbody>
            {electiveData.map((item, index) => (
              <tr key={index}>
                <td>{item.semester_id}</td>
                <td>{item.elective_id}</td>
                <td>{item.elective_subject_id}</td>
                <td>{item.elective_name}</td>
                <td>{item.elective_section}</td>
                <td>{item.faculty_id}</td>
                <td>{item.hours_per_week}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </div>
  );
}

export default AddElective;