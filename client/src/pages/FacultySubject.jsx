import { useState, useEffect } from 'react';
import Form from 'react-bootstrap/Form';
import DFacSub from './DFacSub';
import '../styles/FacultySubject.css';

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
        thirdFaculty: '',
        class: '',
    });

    useEffect(() => {
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
                faculty3: selectedValues.thirdFaculty,
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
                setRefreshMappings((prev) => !prev);

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
        <div className="faculty-subject-container">
            {/* Semester Selection */}
            <div className="faculty-box semester-selection">
                <h1>Select Semester</h1>
                <div className="semester-dropdown">
                    <Form.Select name="semester" value={selectedSemester} onChange={handleSemesterChange}>
                        <option value="">Select</option>
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                            <option key={sem} value={sem}>{sem}</option>
                        ))}
                    </Form.Select>
                </div>
            </div>

            {/* Mapping Section */}
            {selectedSemester && (
                <div className="faculty-box mapping-container">
                    <h3>Add a new Mapping</h3>
                    <Form onSubmit={handleSubmit}>
                        <div className="selection-grid">
                            <Form.Select name="class" value={selectedValues.class} onChange={handleChange}>
                                <option value="">Select Class</option>
                                {['A', 'B', 'C', 'D', 'E'].map((cls) => (
                                    <option key={cls} value={cls}>{cls}</option>
                                ))}
                            </Form.Select>

                            <Form.Select name="subject" value={selectedValues.subject} onChange={handleChange}>
                                <option value="">Select Subject</option>
                                {subjects.map((subject) => (
                                    <option key={subject.id} value={subject.id}>
                                        {subject.name}
                                    </option>
                                ))}
                            </Form.Select>

                            <Form.Select name="faculty" value={selectedValues.faculty} onChange={handleChange}>
                                <option value="">Select Faculty</option>
                                {faculty.map((fac) => (
                                    <option key={fac.id} value={fac.id}>{fac.name}</option>
                                ))}
                            </Form.Select>

                            {isLab && (
                                <>
                                    <Form.Select name="secondFaculty" value={selectedValues.secondFaculty} onChange={handleChange}>
                                        <option value="">Select Second Faculty</option>
                                        {faculty.map((fac) => (
                                            <option key={fac.id} value={fac.id}>{fac.name}</option>
                                        ))}
                                    </Form.Select>

                                    <Form.Select name="thirdFaculty" value={selectedValues.thirdFaculty} onChange={handleChange}>
                                        <option value="">Select Third Faculty</option>
                                        {faculty.map((fac) => (
                                            <option key={fac.id} value={fac.id}>{fac.name}</option>
                                        ))}
                                    </Form.Select>
                                </>
                            )}
                        </div>

                        {/* Submit Button */}
                        <div className="submit-btn">
                            <button type="submit" className="btn btn-success">Submit</button>
                        </div>
                    </Form>
                </div>
            )}

            {/* Display Mapped Data */}
            {selectedSemester && <DFacSub selectedSemester={selectedSemester} refreshMappings={refreshMappings} />}
        </div>
    );
}

export default FacultySubject;
