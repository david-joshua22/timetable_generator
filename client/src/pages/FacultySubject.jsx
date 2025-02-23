import { useState, useEffect } from 'react';
import Form from 'react-bootstrap/Form';
import DFacSub from './DFacSub';
import '../styles/App.css';

function FacultySubject() {
    const [faculty, setFaculty] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [subjectTypes, setSubjectTypes] = useState({});
    const [isLab, setIsLab] = useState(false);
    const [selectedSemester, setSelectedSemester] = useState('');
    const [selectedValues, setSelectedValues] = useState({
        subject: '',
        faculty: '',
        secondFaculty: '',
        class: '',
    });

    useEffect(() => {
        fetch('http://localhost:3000/faculty')
            .then((response) => response.json())
            .then((data) => setFaculty(data))
            .catch((error) => console.error('Error fetching faculty data:', error));

            if (selectedSemester) {
                fetch(`http://localhost:3000/getSubjectsBySemester?semester=${selectedSemester}`)
                    .then(response => response.json())
                    .then(data => {
                        setSubjects(data);
                        const typeMap = {};
                        data.forEach((sub) => {
                            typeMap[sub.id] = sub.type;
                        });
                        setSubjectTypes(typeMap);
                    })
                    .catch((error) => console.error('Error fetching subjects by semester:', error));
            }
    }, [selectedSemester]);

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
        fetch('http://localhost:3000/getFacSubMap', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ semester: selectedSemester }),
        })
            .then((response) => response.json())
            .then((data) => {
                console.log('Success:', data);
                alert('Mappings fetched successfully');
            })
            .catch((error) => console.error('Error:', error));
    };

    return (
        <div>
            <form onSubmit={handleSubmit}>
            <div className="d-flex justify-content-center pt-5 pb-3">
            <div className="d-flex flex-col justify-content-center faculty rounded">
                <div className="m-3 p-3">
                    <Form.Select
                        name="semester"
                        value={selectedSemester}
                        onChange={handleSemesterChange}
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

                {selectedSemester && (
                    <>
                        <div className="d-flex justify-content-center pt-5 pb-3">
                            <div className="d-flex flex-col justify-content-center faculty rounded">
                                <div className="m-3 p-3">
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
                                )}

                            </div>
                        </div>

                        <div className="d-flex justify-content-center">
                            <button type="submit" className="btn btn-success">
                                Submit
                            </button>
                        </div>
                    </>
                )}
            </form>

            {selectedSemester && <DFacSub selectedSemester={selectedSemester} />}
        </div>
    );
}

export default FacultySubject;
