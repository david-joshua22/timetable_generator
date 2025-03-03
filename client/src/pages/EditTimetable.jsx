import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Table from 'react-bootstrap/Table';
import { useState, useEffect } from "react";
import '../styles/DisplayTimetable.css';

const EditTimetable = () => {
    const [semester, setSemester] = useState('');
    const [section, setSection] = useState('');
    const [timetable, setTimetable] = useState([]);
    const [error, setError] = useState(null);
    const [showResults, setShowResults] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [selectedCell, setSelectedCell] = useState(null);
    const [deletedEntries, setDeletedEntries] = useState([]);
    const [showSelectMessage, setShowSelectMessage] = useState(false);

    useEffect(() => {
        const storedData = JSON.parse(localStorage.getItem("deletedEntries")) || [];
        setDeletedEntries(storedData);
    }, []);

    const days = { 1: 'Monday', 2: 'Tuesday', 3: 'Wednesday', 4: 'Thursday', 5: 'Friday' };

    const fetchTimetable = async () => {
        if (!semester || !section) {
            setError('Please select both semester and section.');
            return;
        }
        setError(null);
        setShowResults(false);

        try {
            const response = await fetch('http://localhost:3000/getTimetable', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ semester, section }),
            });

            if (!response.ok) throw new Error('Failed to fetch timetable');

            const data = await response.json();
            setTimetable(data);
            setShowResults(true);
        } catch (error) {
            console.error("Fetch error:", error);
            setError('Failed to fetch timetable. Try again.');
            setShowResults(true);
        }
    };

    const handleCellClick = async (day, time) => {
        if (showSelectMessage) {
            await handleAddToTimetable(day, time);
            return;
        }

        if (!editMode) return;

        setShowSelectMessage(false); 

        const selectedEntry = timetable.find(
            (item) => parseInt(item.day) === parseInt(day) && parseInt(item.time) === time
        );

        if (!selectedEntry) {
            console.warn("No subject found for this slot.");
            return;
        }
        const { subject_id,name } = selectedEntry;

        const facultyResponse = await fetch("http://localhost:3000/getFaculty", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ section_id: section, semester_id: semester, subject_id })
        });

        if (!facultyResponse.ok) throw new Error("Failed to fetch faculty");

        const facultyData = await facultyResponse.json();
        console.log(facultyData);

        setSelectedCell({
            semester_id: semester,
            section_id: section,
            day,
            time,
            subject_id: subject_id,
            faculty_id: facultyData[0]?.faculty_id || "Unknown",
            faculty_name : facultyData[0]?.faculty_name || "Unknown",
            subject_name :name
        });
    };

    const handleRestore = (entry) => {
        setSelectedCell({
            semester_id: entry.semester_id,
            section_id: entry.section_id,
            day: entry.day,
            time: entry.time,
            subject_id: entry.subject_id,
            faculty_id: entry.faculty_id
        });

        setShowSelectMessage(true);
    };

    const handleAddToTimetable = async (day, time) => {
        if (!selectedCell) return;
    
        try {
            const response = await fetch('http://localhost:3000/addToTimetable', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    semester: selectedCell.semester_id,
                    section: selectedCell.section_id,
                    day: day,
                    time: time,
                    subject_id: selectedCell.subject_id,
                    faculty_id: selectedCell.faculty_id
                })
            });
    
            if (!response.ok) throw new Error('Failed to add to timetable');
    
            // Refresh the timetable
            await fetchTimetable();
    
            // Remove the restored entry from deletedEntries correctly
            setDeletedEntries(prevDeletedEntries => {
                const updatedDeletedEntries = prevDeletedEntries.filter(e =>
                    !(e.day === selectedCell.day &&
                      e.time === selectedCell.time &&
                      e.subject_id === selectedCell.subject_id &&
                      e.faculty_id === selectedCell.faculty_id)
                );
    
                localStorage.setItem("deletedEntries", JSON.stringify(updatedDeletedEntries));
                return updatedDeletedEntries;
            });
    
            setSelectedCell(null);
            setShowSelectMessage(false);
        } catch (error) {
            console.error("Error adding to timetable:", error);
        }
    };
    
    const handleDelete = async () => {
        if (!selectedCell) return;

        try {
            const response = await fetch('http://localhost:3000/editTimetable', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    semester: selectedCell.semester_id,
                    section: selectedCell.section_id,
                    day: selectedCell.day,
                    time: selectedCell.time
                })
            });

            if (!response.ok) throw new Error('Failed to update timetable');

            // Store the full entry (including subject_id and faculty_id) in deletedEntries
            const newDeletedEntries = [...deletedEntries, selectedCell];
            setDeletedEntries(newDeletedEntries);
            localStorage.setItem("deletedEntries", JSON.stringify(newDeletedEntries));

            // Remove from timetable
            setTimetable(prev => prev.filter(
                item => !(item.day === selectedCell.day && item.time === selectedCell.time)
            ));

            setSelectedCell(null);
            fetchTimetable();
        } catch (error) {
            console.error("Error deleting entry:", error);
        }
    };

    return (
        <div className="items-center display-1">
            <div className="rounded-lg shadow-md w-full max-w-4xl mb-6 cardBox">
                <div className="timetableHeader">
                    <h3 className='text-center'>Edit TimeTable</h3>
                    {showResults && (
                        <Button className="btn-warning" onClick={() => setEditMode(!editMode)}>
                            {editMode ? "Exit Edit Mode" : "Edit"}
                        </Button>
                    )}
                </div>

                <div className="d-flex justify-content-center pt-1 pb-3">
                    <Form.Select onChange={(e) => setSemester(e.target.value)} className="w-auto m-3">
                        <option>Select Semester</option>
                        {[1, 2, 3, 4, 5, 6, 7].map(num => <option key={num} value={num}>{num}</option>)}
                    </Form.Select>
                    <Form.Select onChange={(e) => setSection(e.target.value)} className="w-auto m-3">
                        <option>Select Section</option>
                        {['A', 'B', 'C', 'D', 'E'].map(sec => <option key={sec} value={sec}>{sec}</option>)}
                    </Form.Select>
                </div>

                <div className="text-center">
                    <Button className="btn-dark text-white" onClick={fetchTimetable}>VIEW</Button>
                </div>

                {error && <p className="text-danger">{error}</p>}
                
                {showResults && timetable.length > 0 && (
                    <div>
                        <h1>Time Table CSE - {semester} {section}</h1>
                        <Table className="timetable-table">
                            <thead>
                                <tr>
                                    <th>Day</th>
                                    {[...Array(6)].map((_, i) => <th key={i}>Period {i + 1}</th>)}
                                </tr>
                            </thead>
                            <tbody>
                                {Object.entries(days).map(([dayKey, dayName]) => (
                                    <tr key={dayKey}>
                                        <td>{dayName}</td>
                                        {[...Array(6)].map((_, periodIndex) => {
                                            const subject = timetable.find(
                                                (item) => parseInt(item.day) === parseInt(dayKey) && parseInt(item.time) === periodIndex + 1
                                            );
                                            return (
                                                <td 
                                                    key={periodIndex} 
                                                    onClick={() => handleCellClick(dayKey, periodIndex + 1)}
                                                    className="clickable-cell"
                                                    style={{ cursor: editMode ? 'pointer' : 'default' }}
                                                >
                                                    {subject ? subject.name : ""}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                        {selectedCell && <Button className="btn-danger" onClick={handleDelete}>Delete</Button>}
                    </div>
                )}
                {showSelectMessage && (
                    <p className="text-warning text-center mt-3">Select the cell to add the entry</p>
                )}
                {deletedEntries.length > 0 && (
                    <div>
                        <h2>Deleted Entries</h2>
                        <Table className='timetable-table'>
                            <thead>
                                <tr>
                                    <th>Day</th>
                                    <th>Period</th>
                                    <th>Subject</th>
                                    <th>Faculty</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {deletedEntries
                                    .filter(entry => entry.semester_id === semester && entry.section_id === section)
                                    .map((entry, index) => (
                                        <tr key={index}>
                                            <td>{days[entry.day]}</td>
                                            <td>{entry.time}</td>
                                            <td>{entry.subject_name || entry.subject_id}</td>
                                            <td>{entry.faculty_name}</td>
                                            <td>
                                                <Button className="btn-success" onClick={() => handleRestore(entry)}>
                                                    Add
                                                </Button>
                                            </td>
                                        </tr>
                                ))}
                            </tbody>
                        </Table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EditTimetable;