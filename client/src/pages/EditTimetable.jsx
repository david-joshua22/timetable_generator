import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Table from 'react-bootstrap/Table';
import { useEffect, useRef, useState } from "react";
import '../styles/DisplayTimetable.css';

const EditTimetable = () => {
    const [semester, setSemester] = useState('');
    const [section, setSection] = useState('');
    const [timetable, setTimetable] = useState([]);
    const [error, setError] = useState(null);
    const [showResults, setShowResults] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [manualEditMode, setManualEditMode] = useState(false);
    const [selectedCell, setSelectedCell] = useState(null);
    const [deletedEntries, setDeletedEntries] = useState([]);
    const [showSelectMessage, setShowSelectMessage] = useState(false);
    const [pendingRestoreEntry, setPendingRestoreEntry] = useState(null);
    const [isAddingEntry, setIsAddingEntry] = useState(false);
    const [unavailableCells, setUnavailableCells] = useState([]); 
    const tableRef = useRef(null); // Reference for the table

    useEffect(() => {
        const fetchDeletedEntries = async () => {
            try {
                const response = await fetch('http://localhost:3000/getDeletedEntries', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ semester, section })
                });
    
                if (!response.ok) throw new Error('Failed to fetch deleted entries');
    
                const data = await response.json();
                setDeletedEntries(data);
            } catch (error) {
                console.error("Error fetching deleted entries:", error);
            }
        };
    
        if (semester && section) {
            fetchDeletedEntries();
            fetchTimetable();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [semester, section]); 
    
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (tableRef.current && !tableRef.current.contains(event.target)) {
                // ✅ Prevent resetting selection if clicking Delete button
                if (event.target.closest(".delete-btn")) return;
                setSelectedCell(null);
            }
        };
    
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [tableRef]); 

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

    const handlePrepareForManualAdd =async (entry) => {
        if (!editMode) setEditMode(true);
        setPendingRestoreEntry(entry);
        setShowSelectMessage(true);
        setIsAddingEntry(true);
        try {
            const response = await fetch('http://localhost:3000/checkCellAvailability', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    faculty_id: entry.faculty_id,
                    semester_id: entry.semester_id,
                    section_id: entry.section_id
                })
            });
    
            if (!response.ok) throw new Error('Failed to fetch unavailable cells');
    
            const data = await response.json();
            setUnavailableCells(data); // Store unavailable cells
        } catch (error) {
            console.error("Error fetching unavailable cells:", error);
        }
    };

    const handleCellClick = async (day, time) => {
        if (pendingRestoreEntry) {
            await handleAddToTimetable(day, time, pendingRestoreEntry);
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
        const { subject_id, name } = selectedEntry;
    
        const facultyResponse = await fetch("http://localhost:3000/getFaculty", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ section_id: section, semester_id: semester, subject_id })
        });
    
        if (!facultyResponse.ok) throw new Error("Failed to fetch faculty");
    
        const facultyData = await facultyResponse.json();
    
        setSelectedCell({
            semester_id: semester,
            section_id: section,
            day,
            time,
            subject_id: subject_id,
            faculty_id: facultyData[0]?.faculty_id || "Unknown",
            faculty_name: facultyData[0]?.faculty_name || "Unknown",
            subject_name: name
        });
    };    

    const handleCancelAdd = () => {
        setEditMode(false); // Exit edit mode
            setManualEditMode(false); // Exit manual edit mode
            setPendingRestoreEntry(null); // Remove pending entry
            setShowSelectMessage(false); // Hide select message
            setIsAddingEntry(false); // Hide "Cancel" button
            setUnavailableCells([]); // Clear 
    };
    
    const handleAddToTimetable = async (day, time, entry) => {
        if (!entry) return;
    
        try {
            const response = await fetch('http://localhost:3000/addToTimetable', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    semester: entry.semester_id,
                    section: entry.section_id,
                    day: day,
                    time: time,
                    subject_id: entry.subject_id,
                    faculty_id: entry.faculty_id,
                    faculty_name: entry.faculty_name,
                    subject_name: entry.subject_name
                })
            });
    
            if (!response.ok) throw new Error('Failed to add to timetable');
            console.log("Entry added successfully!");
    
            const deleteResponse = await fetch('http://localhost:3000/removeDeletedEntry', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    semester: entry.semester_id,
                    section: entry.section_id,
                    day: entry.day,
                    time: entry.time
                })
            });
    
            if (!deleteResponse.ok) throw new Error('Failed to remove entry from deleted records');
            console.log("Deleted entry removed from database!");
    
            setDeletedEntries(prevDeletedEntries => prevDeletedEntries.filter(
                e => !(e.day === entry.day && e.time === entry.time && e.subject_id === entry.subject_id)
            ));
    
            await fetchTimetable();

            if (!manualEditMode) {
                setEditMode(false);
            }
            setPendingRestoreEntry(null);
            setShowSelectMessage(false);
            setIsAddingEntry(false);
            setUnavailableCells([]);
    
        } catch (error) {
            console.error("Error adding to timetable:", error);
        }
    };
    
    const fetchDeletedEntries = async () => {
        try {
            const response = await fetch('http://localhost:3000/getDeletedEntries', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ semester, section })
            });
    
            if (!response.ok) {
                console.error("Failed to fetch deleted entries, response status:", response.status);
                throw new Error('Failed to fetch deleted entries');
            }
    
            const data = await response.json();
            console.log("Fetched Deleted Entries:", data); // ✅ Debugging log
    
            setDeletedEntries(data || []); // ✅ Ensure it's always an array
            return data;
        } catch (error) {
            console.error("Error fetching deleted entries:", error);
            setDeletedEntries([]); // ✅ Prevents undefined errors
            return [];
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
                    time: selectedCell.time,
                    subject_id: selectedCell.subject_id,
                    faculty_id: selectedCell.faculty_id,
                    faculty_name: selectedCell.faculty_name,
                    subject_name: selectedCell.subject_name
                })
            });
    
            if (!response.ok) throw new Error('Failed to update timetable');
    
            // Fetch updated deleted entries from DB
            await fetchDeletedEntries(); // ✅ Now correctly calls the function
    
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

                {error && <p className="text-danger error-timetable">{error}</p>}
                
                {showResults && timetable.length > 0 ? (
                    <div>
                    <div className='d-flex flex-row justify-content-between'>
                        <h1>Time Table CSE - {semester} {section}</h1>
                        {showResults && (
                            <div className='m-1'>
                                <Button className="btn-warning" onClick={() => {
                                    setEditMode(!editMode);
                                    setManualEditMode(!editMode); // ✅ Track manual toggling
                                }}>
                                    {editMode ? "Exit Edit Mode" : "Edit"}
                                </Button>
                            </div>
                    )}
                    </div>
                    {showSelectMessage && (
                        <div className="text-center d-flex flex-row m-2 justify-content-between">
                            <p className="text-danger text-center error">
                                *Select the cell in the timetable to add the subject - {pendingRestoreEntry.subject_name}
                            </p>
                            {isAddingEntry && (
                                    <Button className="btn-danger" onClick={handleCancelAdd}>
                                        Cancel
                                    </Button>
                            )}
                        </div>
                    )}
                        <Table ref={tableRef} className={`timetable-table ${editMode ? 'table-edit-mode' : ''}`}>
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
                                            const isUnavailable = unavailableCells.some(
                                                (cell) => cell.day === parseInt(dayKey) && cell.time === periodIndex + 1
                                            );
                                            return (
                                                <td 
                                                    key={periodIndex} 
                                                    onClick={() => !isUnavailable && handleCellClick(dayKey, periodIndex + 1)}
                                                    className={`clickable-cell ${selectedCell?.day === dayKey && selectedCell?.time === (periodIndex + 1) ? "selected-cell" : ""} ${isUnavailable ? "unavailable-cell" : ""}`}
                                                    style={{ cursor: editMode && !isUnavailable ? 'pointer' : 'not-allowed', backgroundColor: isUnavailable ? 'lightgray' : 'inherit' }}
                                                >
                                                    {subject ? subject.name : ""}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                        {selectedCell && <Button className="btn-danger delete-btn" onClick={handleDelete}>Delete</Button>}
                    </div>
                ):(showResults && timetable.length === 0 &&  (<p className='noTimetable'>No TimeTable</p>))}
               {deletedEntries.length > 0 ? (
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
                                {deletedEntries.map((entry, index) => (
                                    <tr key={index}>
                                        <td>{days[entry.day]}</td>
                                        <td>{entry.time}</td>
                                        <td>{entry.subject_name || entry.subject_id}</td>
                                        <td>{entry.faculty_name}</td>
                                        <td>
                                                <Button className="btn-primary m-2" onClick={() => handlePrepareForManualAdd(entry)}>
                                                    Add
                                                </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </div>
                ) : showResults && timetable.length > 0 &&  (
                    <p className="text-center text-muted error-timetable">No deleted entries found.</p>
                )}

            </div>
        </div>
    );
};

export default EditTimetable;