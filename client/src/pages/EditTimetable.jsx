import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Table from 'react-bootstrap/Table';
import {useState } from "react";
import '../styles/DisplayTimetable.css';

const EditTimetable = () => {
  

    const [semester, setSemester] = useState('');
    const [section, setSection] = useState('');
    const [timetable, setTimetable] = useState([]);
    //const [faculty,setFaculty] = useState([]);  
    //const [elective,setElective] = useState([]);
    const [error, setError] = useState(null);
    const [showResults, setShowResults] = useState(false);
    const [selectedCell, setSelectedCell] = useState({ day: null, period: null });

    const days = {1:'Monday',2:'Tuesday',3:'Wednesday',4:'Thursday',5:'Friday'};

    const fetchTimetable = async () => {
      if (!semester || !section) {
          setError('Please select both semester and section.');
          return;
      }
      setError(null);
      setTimetable([]); // Clear timetable data
      setShowResults(false); // Hide previous results
  
      try {
          const response = await fetch('http://localhost:3000/getTimetable', { 
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ semester, section }),
          });
  
          if (!response.ok) throw new Error('Failed to fetch timetable');
  
          const data = await response.json();
          setTimetable(data);
          setShowResults(true); // Show new results
  
      } catch (error) {
          console.error("Fetch error:", error);
          setError('Failed to fetch timetable. Try again.');
          setShowResults(true); // Show error message
      }
  };
  

const handleCellClick = async (day, period) => {
    const selectedEntry = timetable.find(
        (item) => parseInt(item.day) === parseInt(day) && parseInt(item.time) === period
    );

    if (!selectedEntry) {
        console.warn("No subject found for this slot.");
        return;
    }

    const { subject_id } = selectedEntry;

    try {
        const facultyResponse = await fetch("http://localhost:3000/getFaculty", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ section_id: section, semester_id: semester, subject_id })
        });

        if (!facultyResponse.ok) throw new Error("Failed to fetch faculty");

        const facultyData = await facultyResponse.json();
        if (facultyData.length === 0) {
            console.warn("No faculty found for this subject.");
            return;
        }

        const faculty_id = facultyData[0].faculty_name;

        const requestData = {
            day,
            period,
            subject_id,
            faculty_id,
            section_id: section,
            semester_id: semester,
            action: "update"  // ✅ Ensure action is passed correctly
        };

        console.log("Sending data:", requestData);

        const response = await fetch("http://localhost:3000/editTimetable", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestData),
        });

        // ✅ Check for valid JSON response
        const result = await response.json();
        console.log("Response from backend:", result);

    } catch (error) {
        console.error("Error processing cell click:", error);
    }
};





    
//     const fetchFaculty = async () => {
//       if (!semester || !section) {
//           setError('Please select both semester and section.');
//           return;
//       }
//       setError(null);
//       setFaculty([]); // Clear faculty data
//       setShowResults(false); // Hide previous results
  
//       try {
//           const response = await fetch('http://localhost:3000/getFacOfClass', { 
//               method: 'POST',
//               headers: { 'Content-Type': 'application/json' },
//               body: JSON.stringify({ semester, section }),
//           });
  
//           if (!response.ok) throw new Error('Failed to fetch faculty data');
  
//           const data = await response.json();
//           setFaculty(data);
//           setShowResults(true); // Show new results only after fetching data
  
//       } catch (error) {
//           console.error("Fetch error:", error);
//           setError('Failed to fetch faculty data. Try again.');
//           setShowResults(true); // Show error message
//       }
//   };
  
    //   const fetchElective = async () => {
    //     if (!semester) {
    //         setError('Please select a semester.');
    //         return;
    //     }
    //     setError(null);
    //     setElective([]);
    //     setShowResults(false);

    //     try {
    //         const response = await fetch('http://localhost:3000/getElectiveOfClass', {
    //             method: 'POST',
    //             headers: { 'Content-Type': 'application/json' },
    //             body: JSON.stringify({ semester }),
    //         });

    //         if (!response.ok) throw new Error('Failed to fetch elective data');

    //         const data = await response.json();
    //         console.log("Fetched Elective Data:", data); // ✅ Log the data
    //         setElective(data);
    //         setShowResults(true);

    //     } catch (error) {
    //         console.error("Fetch error:", error);
    //         setError('Failed to fetch elective data. Try again.');
    //         setShowResults(true);
    //     }
    // };


    return (
      <div className="items-center display-1">
  <div className="rounded-lg shadow-md w-full max-w-4xl mb-6 cardBox">
    <div className="timetableHeader">
      <h3 className='text-center'>Edit TimeTable</h3>
    </div>

    <div className="d-flex justify-content-center pt-1 pb-3">
      <Form.Select onChange={(e) => setSemester(e.target.value)} aria-label="Select Semester" className="w-auto m-3">
        <option>Select Semester</option>
        {[1, 2, 3, 4, 5, 6, 7].map((num) => (
          <option key={num} value={num}>{num}</option>
        ))}
      </Form.Select>

      <Form.Select onChange={(e) => setSection(e.target.value)} aria-label="Select Section" className="w-auto m-3">
        <option>Select Section</option>
        {['A', 'B', 'C','D','E'].map((sec) => (
          <option key={sec} value={sec}>{sec}</option>
        ))}
      </Form.Select>
    </div>

    <div className="text-center">
      <Button className="btn-dark text-white" onClick={() => {  fetchTimetable();}}>
        VIEW
      </Button>
    </div>
        {error && <p className="text-danger">{error}</p>}

        {showResults ? (
            timetable.length > 0 ?  (
          <div> 
              <div className="rounded-lg shadow-md mb-6" id="timetable-container">
                <h1>Time Table CSE -{timetable[0].semester_id} {timetable[0].section_id}</h1>
                


                <Table className="timetable-table">
                    <thead>
                        <tr>
                            <th>Day</th>
                            {Array.from({ length: 6 }, (_, i) => (
                                <th key={i + 1}>Period {i + 1}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {Object.entries(days).map(([dayKey, dayName]) => (
                            <tr key={dayKey}>
                                <td>{dayName}</td>
                                {Array.from({ length: 6 }, (_, periodIndex) => {
                                    const subject = timetable.find(
                                        (item) => parseInt(item.day) === parseInt(dayKey) && parseInt(item.time) === periodIndex + 1
                                    );
                                    return (
                                        <td 
                                            key={periodIndex} 
                                            onClick={() => handleCellClick(dayKey, periodIndex + 1)}
                                            className="clickable-cell"
                                        >
                                            {subject ? subject.name : ""}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </Table>





              
            </div>          
            </div>
            ) : <div className="text-danger">No timetable available.</div> 
          )  : null}
      </div>
    </div>
    )
};
export default EditTimetable;