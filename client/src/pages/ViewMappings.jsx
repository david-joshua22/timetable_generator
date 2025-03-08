import { useState} from 'react';
import Form from 'react-bootstrap/Form';
import GFacSub from './GFacSub';
import Button from 'react-bootstrap/Button';
import '../styles/App.css';
import '../styles/ViewMappings.css';

function ViewMappings() {
    const [selectedSemester, setSelectedSemester] = useState('');

    const handleSemesterChange = (e) => {
        setSelectedSemester(e.target.value);
    };
    
    function handleGenerate() {
        fetch(`http://localhost:3000/generate?semester=${selectedSemester}`)
            .then(response => {
                if (response.ok) {
                    return response.text(); // Read response body
                } else {
                    throw new Error(`Server Error: ${response.status}`);
                }
            })
            .then(data => {
                alert(data); 
            })
            .catch(err => {
                console.log('Fetch Error:', err);
            });
    }
    
    function handleDeleteTimetableData(){
        fetch(`http://localhost:3000/deleteData?semester=${selectedSemester}`)
        .then(response => {
            if (response.ok) {
                return response.text(); // Read response body
            } else {
                throw new Error(`Server Error: ${response.status}`);
            }
        })
        .then(data => {
            alert(data); 
        })
        .catch(err => {
            console.log('Fetch Error:', err);
        });
    }

    return (
        <div className="semester-container">
            <div className="semester-selection">
            <Form>
                <div className="justify-content-center pt-2 pb-2">
                    <div className="d-flex flex-row justify-content-center">
                        <h4 className="justify-content-center rounded mr-2">
                            Select Semester
                            <svg xmlns="http://www.w3.org/2000/svg" width="50" height="25" fill="currentColor" className="bi bi-arrow-right" viewBox="0 0 16 16">
                                <path fillRule="evenodd" d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8" />
                            </svg>
                        </h4>
                        <div>
                            <Form.Select
                                name="semester"
                                value={selectedSemester}
                                onChange={handleSemesterChange}
                                aria-label="Select Semester"
                            >
                                <option value="">Select</option>
                                {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                                    <option key={sem} value={sem}>{sem}</option>
                                ))}
                            </Form.Select>
                        </div>
                    </div>
                </div>
            </Form>
            </div>

            {selectedSemester && 
           <div className="generate-container pt-3 pb-3">
                <h1>Generate for {selectedSemester} semester</h1>
                <div className='d-flex flex-row justify-content-between'>
                    <Button className="btn btn-dark" onClick={handleGenerate}> Generate</Button>
                    <Button className="btn btn-dark" onClick={handleDeleteTimetableData}>Delete timetable data</Button>
                </div>
                <GFacSub selectedSemester={selectedSemester} />
            </div>}
        </div>
    );
}

export default ViewMappings;
