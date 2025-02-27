import db from '../connection.js';
import queryDatabase from './queryDatabase.js';

async function checkFacultyAvailability(faculty, day, hour) {
    try {
        const availability = await queryDatabase("SELECT * FROM faculty_timetable WHERE faculty_id = ? AND day = ? AND time = ?", [faculty, day, hour]);
        return (availability.length === 0);
    } catch (err) {
        console.error('Error in checkFacultyAvailability:', err);
        return false;
    }
}

export default checkFacultyAvailability;