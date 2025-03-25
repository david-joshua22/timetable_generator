import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Table from 'react-bootstrap/Table';
import {useState,useEffect } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import ExcelJS from "exceljs";
import {saveAs} from 'file-saver';
import '../styles/FacultyDashboard.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function FacultyDashboard() {
    const downloadPDF = () => {
        const input = document.getElementById("timetable-container");
    
        html2canvas(input, {
            scale:  4,  
            useCORS: true,
            letterRendering: true,
            scrollX: 0,
            scrollY: 0,
            width: input.scrollWidth,  
            height: input.scrollHeight 
        }).then((canvas) => {
            const imgData = canvas.toDataURL("image/png", 1.0);
            const pdf = new jsPDF("p", "mm", "a4");
    
            const imgWidth = 190;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
            const maxHeight = 270;  
            const finalHeight = imgHeight > maxHeight ? maxHeight : imgHeight;
    
            pdf.addImage(imgData, "PNG", 10, 10, imgWidth, finalHeight, "", "FAST");
            pdf.save(`Timetable_CSE-${timetable[0].semester_id}${timetable[0].section_id}.pdf`);
        });
    };
      const handleDownloadExcel = async () => {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Faculty Timetable');
    
        if (!timetable.length) {
            console.error("No timetable available for download.");
            return;
        }
    
        // Add Main Heading
        worksheet.mergeCells('A1', 'G1');
        const titleCell = worksheet.getCell('A1');
        titleCell.value = `Faculty Timetable - ${timetable[0]?.faculty_name}`;
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
        worksheet.mergeCells(assignedClassesHeader.number, 1, assignedClassesHeader.number, 2);
        assignedClassesHeader.font = { bold: true };
    
        // Assigned Classes Table Headers
        worksheet.addRow(['Subject', 'Class']);
    
        // Add Assigned Classes Data
        classList.forEach((item) => {
            const classInfo = item.type === "Elective" && item.elective_section_id
                ? `${item.semester_id} ${item.elective_section_id}`
                : `${item.semester_id} ${item.section_id || ""}`;
            worksheet.addRow([item.subject_name || item.Elective_name, classInfo]);
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
        saveAs(blob, `Faculty_Timetable-${timetable[0].faculty_name}.xlsx`);
    };
    
    
    const [faculty, setFaculty] = useState([]);
    const [selectedFaculty, setSelectedFaculty] = useState("");
    const [timetable, setTimetable] = useState([]);
    const [showResults, setShowResults] = useState(false);
    const [classList, setClassList] = useState([]);

    const days = {1:'Monday',2:'Tuesday',3:'Wednesday',4:'Thursday',5:'Friday'};

    useEffect(() => {
        fetch(`${API_BASE_URL}/faculty`)
            .then(response => response.json())
            .then(data => setFaculty(data))
            .catch(error => console.error('Error fetching faculty data:', error));
    }, []);

    const fetchTimetable = async () => {
        try {
          const response = await fetch(`${API_BASE_URL}/getFacultyTimetable`, { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ selectedFaculty }),
          });
      
          if (!response.ok) throw new Error('Failed to fetch timetable');
      
          const data = await response.json();
          setTimetable(data);  
          setShowResults(true);
        } catch (error) {
          console.error("Fetch error:", error);
          setShowResults(true); 
        }
    }

    const fetchClass = async () => {
        try {
          const response = await fetch(`${API_BASE_URL}/getClassFaculty`, { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ selectedFaculty }),
          });
      
          if (!response.ok) throw new Error('Failed to fetch faculty data');
      
          const data = await response.json();
          setClassList(data);
        } catch (error) {
          console.error("Fetch error:", error);
        }
    };
    const handleChange = (e) => {
        setSelectedFaculty(e.target.value);
    };
    return (
        <div className="box-1">
            <div className="box-2">
                <div className="timetableHeader text-center">
                    <h3>Display Faculty TimeTable</h3>
                </div>
    
                <div className="d-flex justify-content-center">
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
          <div className='hide-overflow-within'> 
              <div className="rounded-lg shadow-md mb-6 cardBox pt-3" id="timetable-container">
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
                                  return (
                                    <td key={`${day}-${time}`}>
                                    {subject ? (
                                        <div className='text-uppercase'>
                                            <span className='facultyStyle'>
                                            {subject.elective_name
                                                ? `${subject.semester_id} ${subject.section_id || subject.elective_section_id} - ${
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
                  <Table bordered className="mt-4 timetable-table">
                      <thead>
                          <tr>
                              <th>Subject</th>
                              <th>Class</th>
                          </tr>
                      </thead>
                      <tbody>
                          {classList.map((item, index) => (
                              <tr key={item.id || `${item.subject_name}-${item.semester_id}-${item.section_id || item.elective_section_id}-${index}`}>
                                  <td className="text-uppercase">
                                      {item.type === "Elective" && item.elective_name 
                                          ? `${item.elective_name} (Elective)`
                                          : item.subject_name}
                                  </td>
                                  <td>
                                      {item.type === "Elective" && item.elective_section_id
                                          ? `${item.semester_id} ${item.elective_section_id}`
                                          : `${item.semester_id} ${item.section_id || ""}`}
                                  </td>
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

export default FacultyDashboard;
