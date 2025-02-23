import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Table from 'react-bootstrap/Table';
import {useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import '../styles/AdminLogin.css';

const Display = () => {

  const downloadPDF = () => {
    const input = document.getElementById("timetable-container");
  
    html2canvas(input, {
      scale: 4, 
      useCORS: true,
      letterRendering: true, 
    }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png", 1.0);
      const pdf = new jsPDF("p", "mm", "a4");
  
      const imgWidth = 190;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
  
      pdf.addImage(imgData, "PNG", 10, 10, imgWidth, imgHeight, "", "FAST");
      pdf.save("Timetable CSE-"+timetable[0].semester_id+timetable[0].section_id+".pdf");
    });
  };
    const [semester, setSemester] = useState('');
    const [section, setSection] = useState('');
    const [timetable, setTimetable] = useState([]);
    const [faculty,setFaculty] = useState([]);  
    const [error, setError] = useState(null);
    const [showResults, setShowResults] = useState(false);

    
    const days = {1:'Monday',2:'Tuesday',3:'Wednesday',4:'Thursday',5:'Friday'};

    const fetchTimetable = async () => {
      if (!semester || !section) {
        setError('Please select both semester and section.');
        return;
      }
      setError(null);
      
      try {
        const response = await fetch('http://localhost:3000/getTimetable', { 
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ semester, section }),
        });
    
        if (!response.ok) throw new Error('Failed to fetch timetable');
    
        const data = await response.json();
        setTimetable(data);  
        setShowResults(true); // Set showResults after data is fetched
    
      } catch (error) {
        console.error("Fetch error:", error);
        setError('Failed to fetch timetable. Try again.');
        setShowResults(true); // Show error message if fetch fails
      }
    }
    
    const fetchFaculty = async () => {
      if (!semester || !section) {
        setError('Please select both semester and section.');
        return;
      }
      setError(null);
    
      try {
        const response = await fetch('http://localhost:3000/getFacOfClass', { 
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ semester, section }),
        });
    
        if (!response.ok) throw new Error('Failed to fetch faculty data');
    
        const data = await response.json();
        setFaculty(data);
    
      } catch (error) {
        console.error("Fetch error:", error);
        setError('Failed to fetch faculty data. Try again.');
      }
    };
    return (
      <div className="items-center display-1">
  <div className="rounded-lg shadow-md w-full max-w-4xl mb-6 cardBox">
    <div className="timetableHeader">
      <h3>Display TimeTable</h3>
    </div>

    <div className="d-flex justify-content-center pt-5 pb-3">
      <Form.Select onChange={(e) => setSemester(e.target.value)} aria-label="Select Semester" className="w-auto">
        <option>Select Semester</option>
        {[1, 2, 3, 4, 5, 6, 7].map((num) => (
          <option key={num} value={num}>{num}</option>
        ))}
      </Form.Select>

      <Form.Select onChange={(e) => setSection(e.target.value)} aria-label="Select Section" className="w-auto">
        <option>Select Section</option>
        {['A', 'B', 'C'].map((sec) => (
          <option key={sec} value={sec}>{sec}</option>
        ))}
      </Form.Select>
    </div>

    <div className="text-center">
      <Button className="btn-dark text-white" onClick={() => { fetchFaculty(); fetchTimetable();}}>
        VIEW
      </Button>
    </div>
        {error && <p className="text-danger">{error}</p>}

        {showResults ? (
            timetable.length > 0 ?  (
          <div> 
              <div className="rounded-lg shadow-md mb-6 cardBox" id="timetable-container">
                <h1>Time Table CSE -{timetable[0].semester_id} {timetable[0].section_id}</h1>
              <Table bordered className="mt-4 timetable-table">
                <thead>
                  <tr>
                    <th></th>
                    {[1, 2, 3, 4, 5, 6].map((time) => (
                      <th key={time} className='colorChange'>Period {time}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[1, 2, 3, 4, 5].map((day) => (
                    <tr key={day}>
                      <td className='days colorChange'>{days[day]}</td>
                      {[1, 2, 3, 4, 5, 6].map((time) => {
                        const subject = timetable.find((item) => item.day === day && item.time === time);
                        return <td key={time}>{subject ? subject.name : ""}</td>;
                      })}
                    </tr>
                  ))}
                </tbody>
              </Table>
              <Table bordered className="mt-4 timetable-table">
              <thead>
                  <tr>
                    <th>Subject</th>
                    <th>Faculty</th>
                  </tr>
                </thead>
                <tbody>
                {faculty.map((item) => (
                    <tr key={item.id || item.faculty_name} >
                      <td>{item.subject_name}</td>
                      <td>{item.faculty_name}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>          
              <div className="text-center mt-3">
                <Button className="btn-dark text-white" onClick={downloadPDF}>
                  Download as PDF
                </Button> 
              </div>
            </div>
            ) : <div className="text-danger">No timetable available.</div> 
          )  : null}
      </div>
    </div>
    )
};
export default Display;