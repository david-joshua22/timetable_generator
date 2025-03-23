import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Table from 'react-bootstrap/Table';
import { useEffect, useRef, useState } from "react";
import { FaMagic, FaTrash, FaPlus } from 'react-icons/fa';
import '../styles/DisplayTimetable.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

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
    const tableRef = useRef(null);

    useEffect(() => {
        const fetchDeletedEntries = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/getDeletedEntries`, {
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
            const response = await fetch(`${API_BASE_URL}/getTimetable`, {
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

    const handlePrepareForManualAdd = async (entry) => {
        if (!editMode) setEditMode(true);
        setPendingRestoreEntry(entry);
        setShowSelectMessage(true);
        setIsAddingEntry(true);
        
        try {
            // Use values directly from the deleted entry
            const response = await fetch(`${API_BASE_URL}/checkCellAvailability`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    faculty_id: entry.faculty_id,
                    semester_id: entry.semester_id,
                    section_id: entry.section_id,
                    subject_type: entry.type || null,
                    lab_name: entry.lab_name || null
                })
            });
    
            if (!response.ok) throw new Error('Failed to fetch unavailable cells');
            const data = await response.json();
            setUnavailableCells(data);
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
        const { subject_id, name, type } = selectedEntry; 
    
        const facultyResponse = await fetch(`${API_BASE_URL}/getFaculty`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                section_id: section, 
                semester_id: semester, 
                subject_id,
                subject_type: type
            })
        });
    
        if (!facultyResponse.ok) throw new Error("Failed to fetch faculty");
    
        const facultyData = await facultyResponse.json();
        console.log(facultyData);

        // Handle lab faculty format
        let facultyIds = [];
        let facultyNames = [];
        if (type === 'Lab') {
            let idA = facultyData[0].faculty_id_A;
            let idB = facultyData[0].faculty_id_B;
            let idC = facultyData[0].faculty_id_C;
            let facultyNameA = facultyData[0].faculty_name_A;
            let facultyNameB = facultyData[0].faculty_name_B;
            let facultyNameC = facultyData[0].faculty_name_C;
            facultyIds = [idA, idB, idC].filter(id => id !== null);
            facultyNames = [facultyNameA, facultyNameB, facultyNameC].filter(name => name !== null);
        } else {
            facultyIds = Array.isArray(facultyData) ? 
                facultyData.map(f => f.faculty_id) : 
                [facultyData[0]?.faculty_id];
            facultyNames = Array.isArray(facultyData) ? 
                facultyData.map(f => f.faculty_name) : 
                [facultyData[0]?.faculty_name];
        }
    
        setSelectedCell({
            semester_id: semester,
            section_id: section,
            day,
            time,
            subject_id: subject_id,
            faculty_id: facultyIds,
            faculty_name: facultyNames|| "Unknown",
            subject_name: name,
            subject_type: type,
            lab_name : facultyData[0].lab_name || null
        });

        console.log(selectedCell);
    };    

    const handleCancelAdd = () => {
        setEditMode(false); 
            setManualEditMode(false); 
            setPendingRestoreEntry(null);
            setShowSelectMessage(false); 
            setIsAddingEntry(false); 
            setUnavailableCells([]); 
    };
    
    const handleAddToTimetable = async (day, time, entry) => {
        if (!entry) return;
    
        try {
            const response = await fetch(`${API_BASE_URL}/addToTimetable`, {
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
                    subject_name: entry.subject_name,
                    subject_type: entry.type || null,
                    lab_name: entry.lab_name || null
                })
            });
    
            if (!response.ok) throw new Error('Failed to add to timetable');
            console.log("Entry added successfully!");
    
            const deleteResponse = await fetch(`${API_BASE_URL}/removeDeletedEntry`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    semester: entry.semester_id,
                    section: entry.section_id,
                    day: entry.day,
                    time: entry.time,
                    subject_id: entry.subject_id,
                    subject_type: entry.type || null,
                    lab_name: entry.lab_name || null
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
            const response = await fetch(`${API_BASE_URL}/getDeletedEntries`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ semester, section })
            });
    
            if (!response.ok) {
                console.error("Failed to fetch deleted entries, response status:", response.status);
                throw new Error('Failed to fetch deleted entries');
            }
    
            const data = await response.json();
            
            // Format the data to handle both array and string faculty information
            const formattedData = data.map(entry => ({
                ...entry,
                faculty_id: Array.isArray(entry.faculty_id) ? entry.faculty_id : [entry.faculty_id],
                faculty_name: Array.isArray(entry.faculty_name) ? 
                    entry.faculty_name.join(', ') : 
                    entry.faculty_name,
                subject_type: entry.subject_type || null,  // Added subject_type with default
                lab_name: entry.lab_name || null               // Added lab_name with default
            }));
    
            console.log("Fetched Deleted Entries:", formattedData);
            setDeletedEntries(formattedData || []);
            return formattedData;
        } catch (error) {
            console.error("Error fetching deleted entries:", error);
            setDeletedEntries([]);
            return [];
        }
    };
    
    const handleDelete = async () => {
        if (!selectedCell) return;
    
        try {
            console.log("Deleting entry:", selectedCell); // Debugging log
            const response = await fetch(`${API_BASE_URL}/editTimetable`, {
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
                    subject_name: selectedCell.subject_name,
                    subject_type: selectedCell.subject_type,
                    lab_name : selectedCell.lab_name
                })
            });
    
            if (!response.ok) throw new Error('Failed to update timetable');
    
            console.log("Entry deleted successfully!"); 
            await fetchDeletedEntries(); 
    
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
        <div className="display-1">
            <div className="display-2">
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
                                <FaMagic 
                                    className={`edit-icon ${editMode ? 'glowing' : ''}`} 
                                    onClick={() => {
                                        setEditMode(!editMode);
                                        setManualEditMode(!editMode);
                                    }}
                                />
                            </div>
                    )}
                    </div>
                    {showSelectMessage && (
                        <div className="text-center d-flex flex-row m-2 justify-content-between">
                            <p className="text-danger text-center error">
                                Select the cell in the timetable to add the subject {pendingRestoreEntry.subject_name}
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
                                                    {subject ? (
                                                            subject.name.includes('(') && subject.name.includes(')')
                                                                ? subject.name.match(/\(([^)]+)\)/)[1]
                                                                : subject.name
                                                        ) : ""}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                        {selectedCell && <div className='delete-container'> <Button className="btn-danger delete-btn" onClick={handleDelete}><FaTrash /></Button></div>}
                    </div>
                ):(showResults && timetable.length === 0 &&  (<p className='noTimetable'>No TimeTable</p>))}
               {deletedEntries.length > 0 ? (
                    <div>
                        <h2>Deleted Entries</h2>
                        <Table className='timetable-table'>
                            <thead className='text-center'>
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
                                        <td>
                                            {Array.isArray(entry.faculty_name) ? 
                                                entry.faculty_name.join(', ') : 
                                                entry.faculty_name}
                                        </td>
                                        <td className='text-center'>
                                            <Button className="add-btn btn btn-dark" onClick={() => handlePrepareForManualAdd(entry)}>
                                                <FaPlus />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </div>
                ) : showResults && timetable.length > 0 &&  (
                    <h2 className="text-center text-black error-timetable">No deleted entries found</h2>
                )}

            </div>
        </div>
    );
};

export default EditTimetable;