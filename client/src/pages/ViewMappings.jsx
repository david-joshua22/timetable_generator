import { useState} from 'react';
import Form from 'react-bootstrap/Form';
import DFacSub from './DFacSub';
import Button from 'react-bootstrap/Button';
import '../styles/App.css';
import '../styles/Container.css';

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
                alert(data); // Show the response in the alert
            })
            .catch(err => {
                console.log('Fetch Error:', err);
            });
    }
    

    return (
        <div className="rounded-lg shadow-md w-full max-w-4xl mb-6 cardBox">
            <Form>
                <div className="justify-content-center pt-5 pb-3">
                    <div className="d-flex flex-row justify-content-center">
                        <h1 className="justify-content-center rounded mr-2">
                            Select Semester
                            <svg xmlns="http://www.w3.org/2000/svg" width="50" height="25" fill="currentColor" className="bi bi-arrow-right" viewBox="0 0 16 16">
                                <path fillRule="evenodd" d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8" />
                            </svg>
                        </h1>
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

            {selectedSemester && 
           <div>
                <h1>Generate for {selectedSemester} semester</h1>
                <Button className="btn btn-dark" onClick={handleGenerate}> Generate</Button>
                <DFacSub selectedSemester={selectedSemester} />
            </div>}
        </div>
    );
}

export default ViewMappings;
