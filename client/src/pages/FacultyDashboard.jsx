import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Table from 'react-bootstrap/Table';
import {useState,useEffect } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import '../styles/AdminLogin.css';

const FacultyDashboard = () => {
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
          pdf.save("Timetable CSE-"+timetable[0].faculty_name+".pdf");
        });
      };
    const [faculty, setFaculty] = useState([]);
    const [selectedFaculty, setSelectedFaculty] = useState("");
    const [timetable, setTimetable] = useState([]);
    const [showResults, setShowResults] = useState(false);
    const [classList, setClassList] = useState([]);

    const days = {1:'Monday',2:'Tuesday',3:'Wednesday',4:'Thursday',5:'Friday'};

    useEffect(() => {
        fetch('http://localhost:3000/faculty')
            .then(response => response.json())
            .then(data => setFaculty(data))
            .catch(error => console.error('Error fetching faculty data:', error));
    }, []);

    const handleChange = (e) => {
        setSelectedFaculty(e.target.value);
    };
    const fetchTimetable = async () => {
        
        try {
          const response = await fetch('http://localhost:3000/getFacultyTimetable', { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ selectedFaculty}),
          });
      
          if (!response.ok) throw new Error('Failed to fetch timetable');
      
          const data = await response.json();
          setTimetable(data);  
          setShowResults(true); // Set showResults after data is fetched
      
        } catch (error) {
          console.error("Fetch error:", error);
          setShowResults(true); 
        }
      }
      const fetchClass = async () => {
        
        try {
          const response = await fetch('http://localhost:3000/getClassFaculty', { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({selectedFaculty}),
          });
      
          if (!response.ok) throw new Error('Failed to fetch faculty data');
      
          const data = await response.json();
          setClassList(data);
      
        } catch (error) {
          console.error("Fetch error:", error);
        }
      };
    return (
        <div className="items-center display-1">
            <div className="rounded-lg shadow-md w-full max-w-4xl mb-6 cardBox">
                <div className="timetableHeader">
                    <h3>Display TimeTable</h3>
                </div>
    
                <div className="d-flex justify-content-center pt-5 pb-3">
                    <div className='m-3 p-3'>
                        <Form.Select 
                            name="faculty"
                            value={selectedFaculty}
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
                </div>
    
                <div className="center-button">
                    <Button className="btn-dark text-white" onClick={() => { fetchClass(); fetchTimetable();}}>VIEW</Button>
                </div>  
                {showResults ? (
            timetable.length > 0 ?  (
          <div> 
              <div className="rounded-lg shadow-md mb-6 cardBox" id="timetable-container">
                <h1>Time Table CSE - {timetable[0].faculty_name}</h1>
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
                        return <td key={time}>{subject ? 
                        <div>
                           <span className='facultyStyle'>{subject.semester_id}{subject.section_id}</span> <br/>
                            {subject.subject_name}
                        </div> : ""}</td>;
                      })}
                    </tr>
                  ))}
                </tbody>
              </Table>
              <Table bordered className="mt-4 timetable-table">
              <thead>
                  <tr>
                    <th>Subject</th>
                    <th>Class</th>
                  </tr>
                </thead>
                <tbody>
                {classList.map((item) => (
                    <tr key={item.id || item.faculty_name} >
                      <td>{item.subject_name}</td>
                      <td>{item.semester_id}{item.section_id}</td>
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
    );
    
};

export default FacultyDashboard;
