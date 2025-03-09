import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Table from 'react-bootstrap/Table';
import {useState,useRef } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import ExcelJS from "exceljs";
import {saveAs} from 'file-saver';
import '../styles/Display.css';
import '../styles/DisplayTimetable.css'

const Display = () => {
  
  const tableRef = useRef(null);

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

  const handleDownloadExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Timetable');

    // Add Main Heading
    worksheet.mergeCells('A1', 'G1');
    const titleCell = worksheet.getCell('A1');
    titleCell.value = `CSE Timetable - ${timetable[0]?.semester_id} ${timetable[0]?.section_id}`;
    titleCell.font = { size: 16, bold: true };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };

    // Define table headers
    const headers = ['Day', 'Period 1', 'Period 2', 'Period 3', 'Period 4', 'Period 5', 'Period 6'];
    worksheet.addRow([]);
    worksheet.addRow(headers);

    // Generate timetable data dynamically
    const periods = [1, 2, 3, 4, 5, 6];
    [1, 2, 3, 4, 5].forEach((day) => {
        const rowData = [days[day]];
        periods.forEach((time) => {
            const subject = timetable.find((item) => item.day === day && item.time === time);
            rowData.push(subject ? subject.name : '');
        });
        worksheet.addRow(rowData);
    });

    // Faculty Heading
    worksheet.addRow([]);
    worksheet.addRow(['Faculty Details']);
    worksheet.mergeCells(worksheet.lastRow.number, 1, worksheet.lastRow.number, 2);
    worksheet.lastRow.font = { bold: true };

    // Faculty Table
    worksheet.addRow(['Subject', 'Faculty']);
    faculty.forEach((item) => {
        worksheet.addRow([item.subject_name, item.faculty_name]);
    });

    // Elective Section (Only for Semesters 5-8)
    if (semester >= 5 && elective && Object.keys(elective).length > 0) {
        worksheet.addRow([]);
        worksheet.addRow(['Elective Details']);
        worksheet.mergeCells(worksheet.lastRow.number, 1, worksheet.lastRow.number, 3);
        worksheet.lastRow.font = { bold: true };

        // Sort electives by ID and group by elective subject name
        Object.keys(elective).sort().forEach((electiveId) => {
            if (elective[electiveId] && elective[electiveId].length > 0) {
                worksheet.addRow([]); // Empty row for spacing
                worksheet.addRow([electiveId.toUpperCase()]); // Elective Name as Section Heading
                worksheet.mergeCells(worksheet.lastRow.number, 1, worksheet.lastRow.number, 3);
                worksheet.lastRow.font = { bold: true };

                worksheet.addRow(['Elective Section', 'Elective Name', 'Faculty']);
                elective[electiveId].forEach((item) => {
                    worksheet.addRow([
                        item.elective_section,
                        item.elective_name,
                        `${item.faculty_name} (${item.department})`,
                    ]);
                });
            }
        });
    }

    // Apply border and alignment
    worksheet.eachRow((row) => {
        row.eachCell((cell) => {
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' },
            };
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
        });
    });

    // Generate and download the Excel file
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, `Timetable CSE-${timetable[0].semester_id}${timetable[0].section_id}.xlsx`);
};




    const [semester, setSemester] = useState('');
    const [section, setSection] = useState('');
    const [timetable, setTimetable] = useState([]);
    const [faculty,setFaculty] = useState([]);  
    const [elective,setElective] = useState([]);
    const [error, setError] = useState(null);
    const [showResults, setShowResults] = useState(false);

    
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
  
    
    const fetchFaculty = async () => {
      if (!semester || !section) {
          setError('Please select both semester and section.');
          return;
      }
      setError(null);
      setFaculty([]); // Clear faculty data
      setShowResults(false); // Hide previous results
  
      try {
          const response = await fetch('http://localhost:3000/getFacOfClass', { 
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ semester, section }),
          });
  
          if (!response.ok) throw new Error('Failed to fetch faculty data');
  
          const data = await response.json();
          setFaculty(data);
          setShowResults(true); // Show new results only after fetching data
  
      } catch (error) {
          console.error("Fetch error:", error);
          setError('Failed to fetch faculty data. Try again.');
          setShowResults(true); // Show error message
      }
  };
  
      const fetchElective = async () => {
        if (!semester) {
            setError('Please select a semester.');
            return;
        }
        setError(null);
        setElective([]);
        setShowResults(false);

        try {
            const response = await fetch('http://localhost:3000/getElectiveOfClass', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ semester }),
            });

            if (!response.ok) throw new Error('Failed to fetch elective data');

            const data = await response.json();
            console.log("Fetched Elective Data:", data); // ✅ Log the data
            setElective(data);
            setShowResults(true);

        } catch (error) {
            console.error("Fetch error:", error);
            setError('Failed to fetch elective data. Try again.');
            setShowResults(true);
        }
    };


    return (
      <div className="display-1">
        <div className="display-2">
          <div className="timetableHeader">
            <h3 className='text-center'>Display TimeTable</h3>
        </div>

          <div className="d-flex justify-content-center pt-2">
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

    <div className="text-center pb-2">
      <Button className="btn-dark text-white" onClick={() => { fetchFaculty(); fetchTimetable();if (semester >= 5) fetchElective();}}>
        VIEW
      </Button>
        </div>
          

    </div>
        {error && <p className="text-danger">{error}</p>}

        {showResults ? (
            timetable.length > 0 ?  (
          <div> 
              <div className="rounded-lg shadow-md mb-6 pt-2" id="timetable-container">
                <h1>Time Table CSE -{timetable[0].semester_id} {timetable[0].section_id}</h1>
              <Table bordered ref={tableRef} className="mt-4 timetable-table">
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
              <h3>Faculty details </h3>
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
              {semester >= 5 ? (
                  elective && Object.keys(elective).length > 0 ? (
                      Object.keys(elective).sort().map((electiveId) => (
                          elective[electiveId] && elective[electiveId].length > 0 && (
                              <div key={electiveId} className="mb-4">
                                  <h4 className="mt-3">{electiveId.toUpperCase()}</h4>
                                  <Table bordered className="mt-2 timetable-table">
                                      <thead>
                                          <tr>
                                              <th>Elective Section</th>
                                              <th>Elective Name</th>
                                              <th>Faculty</th>
                                          </tr>
                                      </thead>
                                      <tbody>
                                          {elective[electiveId].map((item, index) => (
                                              <tr key={item.id || `${item.faculty_name}-${index}`}>
                                                  <td className='text-uppercase'>{item.elective_section}</td>
                                                  <td className='text-uppercase'>{item.elective_name}</td>
                                                  <td>{item.faculty_name} ({item.department})</td>
                                              </tr>
                                          ))}
                                      </tbody>
                                  </Table>
                              </div>
                          )
                      ))
                  ) : (
                      <h2>No elective data available.</h2>
                  )
              ) : null}
            </div>          
              <div className="d-flex flex-row justify-content-center text-center m-3">
                <div className='m-3'>
                  <Button className="btn-dark text-white" onClick={downloadPDF}>
                    Download as PDF
                  </Button> 
                </div>
                <div className='m-3'>
                  <Button className="btn-dark text-white" onClick={handleDownloadExcel}>
                    Download as Excel
                  </Button> 
                </div>
              </div>
            </div>
            ) : <div className="no-info pt-2">No timetable available :(</div> 
          )  : null}
        
      </div>
    )
};
export default Display;