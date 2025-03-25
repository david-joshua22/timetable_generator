import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Table from 'react-bootstrap/Table';
import {useState,useEffect } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import ExcelJS from "exceljs";
import {saveAs} from 'file-saver';
import '../styles/DisplayTimetable.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;


const LabTimetable = () => {
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
          pdf.save(`Lab_Timetable_${timetable[0].lab_name}.pdf`);  // Changed from faculty_name based filename
        });
      };
      const handleDownloadExcel = async () => {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Lab Timetable');
    
        if (!timetable.length) {
            console.error("No timetable available for download.");
            return;
        }
    
        // Add Main Heading
        worksheet.mergeCells('A1', 'G1');
        const titleCell = worksheet.getCell('A1');
        titleCell.value = `Lab Timetable - ${timetable[0].lab_name}`;
        titleCell.font = { size: 16, bold: true };
        titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    
        // Define table headers
        const headers = ['Day', 'Period 1', 'Period 2', 'Period 3', 'Period 4', 'Period 5', 'Period 6'];
        worksheet.addRow([]); // Empty row for spacing
        worksheet.addRow(headers);
    
        // Generate timetable data dynamically
        const periods = [1, 2, 3, 4, 5, 6];
        [1, 2, 3, 4, 5].forEach((day) => {
            const rowData = [days[day]];
            periods.forEach((time) => {
                const subject = timetable.find((item) => item.day === day && item.time === time);
                if (subject) {
                    const classInfo = subject.type === "Elective" && subject.elective_section_id
                        ? `${subject.semester_id} ${subject.elective_section_id}`
                        : `${subject.semester_id} ${subject.section_id || ""}`;
                    const subjectName = subject.subject_name || subject.elective_name;
                    const displayName = subjectName.includes('(') && subjectName.includes(')')
                        ? subjectName.match(/\(([^)]+)\)/)[1]
                        : subjectName;
                    rowData.push(`${classInfo}\n${displayName}`);
                } else {
                    rowData.push('');
                }
            });
            worksheet.addRow(rowData);
        });
    
        // Assigned Classes Section
        worksheet.addRow([]); // Empty row for spacing
        const assignedClassesHeader = worksheet.addRow(['Assigned Classes']);
        worksheet.mergeCells(assignedClassesHeader.number, 1, assignedClassesHeader.number, 4);
        assignedClassesHeader.font = { bold: true };
    
        // Assigned Classes Table Headers
        worksheet.addRow(['Semester', 'Section', 'Subject', 'Faculty']);
    
        // Add Assigned Classes Data
        classList.forEach((item) => {
            worksheet.addRow([
                item.semester_id,
                item.section_id,
                item.subject_name,
                item.faculty_names
            ]);
        });
    
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
        saveAs(blob, `Lab_Timetable_${timetable[0].lab_name}.xlsx`);
    };
    
    
    const [labs, setLabs] = useState([]);
    const [selectedLab, setSelectedLab] = useState("");
    const [timetable, setTimetable] = useState([]);
    const [showResults, setShowResults] = useState(false);
    const [classList, setClassList] = useState([]);

    const days = {1:'Monday',2:'Tuesday',3:'Wednesday',4:'Thursday',5:'Friday'};

    useEffect(() => {
        fetch(`${API_BASE_URL}/getLab`)
            .then(response => response.json())
            .then(data => setLabs(data))
            .catch(error => console.error('Error fetching lab data:', error));
    }, []);

    const handleChange = (e) => {
        setSelectedLab(e.target.value);
    };
    const fetchTimetable = async () => {
        try {
          const response = await fetch(`${API_BASE_URL}/getLabTimetable`, {  
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ selectedLab }),  
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
            const response = await fetch(`${API_BASE_URL}/getLabFacTime`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ selectedLab }),
            });
    
            if (!response.ok) throw new Error('Failed to fetch lab timetable');
    
            const data = await response.json();
            
            // Format the data for display
            const formattedData = data.map(item => ({
                semester_id: item.semester_id,
                section_id: item.section_id,
                subject_name: item.subject_name,
                faculty_names: item.faculty_names
            }));
    
            setClassList(formattedData);
        } catch (error) {
            console.error("Fetch error:", error);
        }
    };


    return (
        <div className="box-1">
            <div className="box-2">
                <div className="timetableHeader text-center">
                    <h3>Display Lab TimeTable</h3>
                </div>
    
                <div className="d-flex justify-content-center">
                    <div className='m-3 p-3'>
                        <Form.Select 
                            name="lab"  // Changed from faculty
                            value={selectedLab}  // Changed from selectedFaculty
                            onChange={handleChange}
                            aria-label="Select Lab"
                        >
                            <option value="">Select Lab</option>
                            {labs.map((lab) => (  // Changed from faculty to labs
                                <option key={lab.id} value={lab.id}>
                                    {lab.lab_name}
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
          <div className='hide-overflow-within'> 
              <div className="rounded-lg shadow-md mb-6 cardBox pt-3" id="timetable-container">
              <h1 style={{textTransform: 'uppercase'}}>Time Table - {timetable[0].lab_name}</h1>
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
                                  return (
                                      <td key={`${day}-${time}`}>  {/* Ensure unique key */}
                                          {subject ? (
                                              <div className='text-uppercase'>
                                                  <span className='facultyStyle'>
                                                    {subject.type === 'Elective' && subject.elective_section_id
                                                        ? `${subject.semester_id} ${subject.elective_section_id} - ${
                                                            subject.elective_name.includes('(') && subject.elective_name.includes(')')
                                                                ? subject.elective_name.match(/\(([^)]+)\)/)[1]
                                                                : subject.elective_name
                                                        }`
                                                        : `${subject.semester_id} ${subject.section_id || ""} - ${
                                                            subject.subject_name.includes('(') && subject.subject_name.includes(')')
                                                                ? subject.subject_name.match(/\(([^)]+)\)/)[1]
                                                                : subject.subject_name
                                                        }`
                                                    }
                                                </span>
                                              </div>
                                          ) : ""}
                                      </td>
                                  );
                              })}
                          </tr>
                      ))}
                  </tbody>

                  </Table>
                  <Table bordered className="mt-4 labTimeTable">
                      <thead>
                          <tr>
                              <th>Semester</th>
                              <th>Section</th>
                              <th>Subject</th>
                              <th>Faculty</th>
                          </tr>
                      </thead>
                      <tbody>
                          {classList.map((item, index) => (
                              <tr key={index}>
                                  <td>{item.semester_id}</td>
                                  <td>{item.section_id}</td>
                                  <td className="text-uppercase">{item.subject_name}</td>
                                  <td>{item.faculty_names}</td>
                              </tr>
                          ))}
                      </tbody>
                  </Table>

            </div>

              <div className="download-buttons">
                <Button className="btn-dark text-white" onClick={downloadPDF}>
                  Download as PDF
                </Button> 
                <Button className="btn-dark text-white" onClick={handleDownloadExcel}>
                  Download as Excel
                </Button> 
              </div>
            </div>
            ) : <div className="text-danger">No timetable available.</div> 
          )  : null}
            </div>
        </div>
    );
    
};

export default LabTimetable;
