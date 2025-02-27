import { useState, useEffect } from 'react';
import Form from 'react-bootstrap/Form';
import DFacSub from './DFacSub';
import '../styles/App.css';
import '../styles/AdminLogin.css';

function FacultySubject() {
    const [faculty, setFaculty] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [subjectTypes, setSubjectTypes] = useState({});
    const [isLab, setIsLab] = useState(false);
    const [selectedSemester, setSelectedSemester] = useState('');
    const [refreshMappings, setRefreshMappings] = useState(false);
    const [selectedValues, setSelectedValues] = useState({
        subject: '',
        faculty: '',
        secondFaculty: '',
        thirdFaculty:'null',
        class: '',
    });


    useEffect(() => {
        if (selectedSemester) {
            // Fetch subjects for the selected semester
            if (selectedSemester) {
                fetch(`http://localhost:3000/getSubjectsBySemester?semester=${selectedSemester}`)
                    .then((response) => response.json())
                    .then((data) => {
                        setSubjects(data);
                        const typeMap = {};
                        data.forEach((sub) => {
                            typeMap[sub.id] = sub.type;
                        });
                        setSubjectTypes(typeMap);
                    })
                    .catch((error) => console.error('Error fetching subjects by semester:', error));
            }   
        }
        fetch('http://localhost:3000/faculty')
            .then((response) => response.json())
            .then((data) => setFaculty(data))
            .catch((error) => console.error('Error fetching faculty data:', error));
    
    }, [selectedSemester, refreshMappings]);

    const handleSemesterChange = (e) => {
        setSelectedSemester(e.target.value);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setSelectedValues((prev) => ({
            ...prev,
            [name]: value,
        }));
        if (name === 'subject') {
            setIsLab(subjectTypes[value] === 'Lab');
        }
    };

    const handleSubmit = (e) => {
            e.preventDefault();
        
            const apiEndpoint = isLab ? 'http://localhost:3000/labEntry' : 'http://localhost:3000/mapSubFac';
        
            const requestBody = isLab
                ? {
                    subject: selectedValues.subject,
                    faculty1: selectedValues.faculty,
                    faculty2: selectedValues.secondFaculty,
                    faculty3:selectedValues.thirdFaculty,
                    class: selectedValues.class,
                    semester: selectedSemester
                }
                : {
                    ...selectedValues,
                    semester: selectedSemester
                };
        
            fetch(apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            })
                .then((response) => response.json())
                .then((data) => {
                    console.log('Success:', data);
                    setRefreshMappings((prev) => !prev); // Refresh table
                    
                    // Clear form inputs
                    setSelectedValues({
                        subject: '',
                        faculty: '',
                        secondFaculty: '',
                        thirdFaculty: '',
                        class: ''
                    });
        
                    setIsLab(false); // Reset lab state
                })
                .catch((error) => console.error('Error:', error));
        };
        

    return (
        <div className="rounded-lg shadow-md w-full max-w-4xl mb-6 cardBox">
            <Form>
                <div className="justify-content-center pt-5 pb-3">
                    <div className="d-flex flex-row justify-content-center">
                        <h1 className="justify-content-center rounded mr-2">
                            Select Semester
                            <svg xmlns="http://www.w3.org/2000/svg" width="50" height="25" fill="currentColor" className="bi bi-arrow-right" viewBox="0 0 16 16">
                                <path fillRule="evenodd" d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8" />
                            </svg>
                        </h1>
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

                {selectedSemester && (
                    <>
                    <Form>
                        <div className="rounded-lg shadow-md w-full max-w-4xl mb-6 cardBox">
                            <h3 className="text-center rounded mr-2">Add a new Mapping</h3>
                            <div className="d-flex flex-row justify-content-center">
                                <div className="m-3 p-3">
                                    <Form.Select
                                        name="class"
                                        value={selectedValues.class}
                                        onChange={handleChange}
                                        aria-label="Select Class"
                                    >
                                        <option value="">Select Class</option>
                                        {['A', 'B', 'C', 'D', 'E'].map((cls) => (
                                            <option key={cls} value={cls}>{cls}</option>
                                        ))}
                                    </Form.Select>
                                </div>

                                <div className="m-3 p-3">
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

                                <div className="m-3 p-3">
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
                                    <div>
                                        <div className="m-3 p-3">
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
                                        <div className="m-3 p-3">
                                        <Form.Select
                                            name="thirdFaculty"
                                            value={selectedValues.thirdFaculty}
                                            onChange={handleChange}
                                            aria-label="Select third Faculty"
                                        >
                                            <option value="">Select third Faculty</option>
                                            {faculty.map((fac) => (
                                                <option key={fac.id} value={fac.id}>
                                                    {fac.name}
                                                </option>
                                            ))}
                                        </Form.Select>
                                    </div>
                                </div>
                                )}
                            </div>

                            <div className="d-flex justify-content-center">
                                <button type="submit" className="btn btn-success" onClick={handleSubmit}>
                                    Submit
                                </button>
                            </div>
                        </div>
                    </Form> 
                    </>
                )}

            {selectedSemester && <DFacSub selectedSemester={selectedSemester} refreshMappings={refreshMappings} />}
        </div>
    );
}

export default FacultySubject;
