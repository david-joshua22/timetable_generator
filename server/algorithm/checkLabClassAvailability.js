import db from '../connection.js';
import queryDatabase from './queryDatabase.js';

async function checkLabClassAvailability(lab_name, day, hour) {
    try {
        const availability = await queryDatabase("SELECT * FROM lab_timetable WHERE lab_name = ? AND day = ? AND time = ?", [lab_name, day, hour]);
        return (availability.length === 0);
    } catch (err) {
        console.error('Error in checkLabClassAvailability:', err);
        return false;
    }
}

export default checkLabClassAvailability;