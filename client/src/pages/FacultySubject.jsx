import { useState, useEffect } from 'react';
import Form from 'react-bootstrap/Form';
import DFacSub from './DFacSub';
import "../styles/App.css";

function FacultySubject() {
    const [faculty, setFaculty] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [subjectTypes, setSubjectTypes] = useState({}); // Stores subject ID -> type
    const [isLab, setIsLab] = useState(false); // Separate state for lab check

    const [selectedValues, setSelectedValues] = useState({
        subject: '',
        faculty: '',
        secondFaculty: '', // For lab subjects
        class: '',
        semester: ''
    });

    useEffect(() => {
        // Fetch faculty data
        fetch('http://localhost:3000/faculty')
            .then(response => response.json())
            .then(data => setFaculty(data))
            .catch(error => console.error('Error fetching faculty data:', error));

        // Fetch subjects data
        fetch('http://localhost:3000/subjects')
            .then(response => response.json())
            .then(data => {
                setSubjects(data);
                
                // Create a dictionary for quick lookup
                const typeMap = {};
                data.forEach(sub => {
                    typeMap[sub.id] = sub.type; // Mapping subject ID to its type
                });
                setSubjectTypes(typeMap);
            })
            .catch(error => console.error('Error fetching subjects data:', error));
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;

        // Update selected values
        setSelectedValues(prev => ({
            ...prev,
            [name]: value
        }));

        // Check if the selected subject is a lab
        if (name === 'subject') {
            setIsLab(subjectTypes[value] === 'Lab'); // Ensures real-time update
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Decide the API endpoint based on subject type
        const apiEndpoint = isLab ? 'http://localhost:3000/labEntry' : 'http://localhost:3000/mapSubFac';
    
        // Prepare request body
        const requestBody = isLab 
            ? {
                subject: selectedValues.subject,
                faculty1: selectedValues.faculty,
                faculty2: selectedValues.secondFaculty,
                class: selectedValues.class,
                semester: selectedValues.semester
            }
            : selectedValues;
    
        fetch(apiEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        })
        .then(response => response.json())
        .then(data => {
            console.log('Success:', data);
            location.reload();
        })
        .catch(error => console.error('Error:', error));
    };

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <div className="d-flex justify-content-center pt-5 pb-3">
                    <div className='d-flex flex-col justify-content-center faculty rounded'>
                        <div className='m-3 p-3'>
                            <Form.Select 
                                name="subject"
                                value={selectedValues.subject}
                                onChange={handleChange}
                                aria-label="Select Subject"
                            >
                                <option value="">Select Subject</option>
                                {subjects.map((subject) => (
                                    <option key={subject.id} value={subject.id}>
                                        {subject.name}
                                    </option>
                                ))}
                            </Form.Select>
                        </div>

                        <div className='m-3 p-3'>
                            <Form.Select 
                                name="faculty"
                                value={selectedValues.faculty}
                                onChange={handleChange}
                                aria-label="Select Faculty"
                            >
                                <option value="">Select Faculty</option>
                                {faculty.map((fac) => (
                                    <option key={fac.id} value={fac.id}>
                                        {fac.name}
                                    </option>
                                ))}
                            </Form.Select>
                        </div>

                        {isLab && (
                            <div className='m-3 p-3'>
                                <Form.Select 
                                    name="secondFaculty"
                                    value={selectedValues.secondFaculty}
                                    onChange={handleChange}
                                    aria-label="Select Second Faculty"
                                >
                                    <option value="">Select Second Faculty</option>
                                    {faculty.map((fac) => (
                                        <option key={fac.id} value={fac.id}>
                                            {fac.name}
                                        </option>
                                    ))}
                                </Form.Select>
                            </div>
                        )}

                        <div className='m-3 p-3'>
                            <Form.Select 
                                name="class"
                                value={selectedValues.class}
                                onChange={handleChange}
                                aria-label="Select Class"
                            >
                                <option value="">Select Class</option>
                                <option value="A">A</option>
                                <option value="B">B</option>
                                <option value="C">C</option>
                                <option value="D">D</option>
                                <option value="E">E</option>
                            </Form.Select>
                        </div>

                        <div className='m-3 p-3'>
                            <Form.Select 
                                name="semester"
                                value={selectedValues.semester}
                                onChange={handleChange}
                                aria-label="Select Semester"
                            >
                                <option value="">Select Semester</option>
                                {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                                    <option key={sem} value={sem}>{sem}</option>
                                ))}
                            </Form.Select>
                        </div>
                    </div>
                </div>

                <div className='d-flex justify-content-center'>
                    <button type="submit" className="btn btn-success">Submit</button>
                </div>
            </form>
            <DFacSub />
        </div>
    );
}

export default FacultySubject;
