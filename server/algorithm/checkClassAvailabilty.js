import queryDatabase from './queryDatabase.js';


async function checkClassAvailability(section, semester, day, hour) {
    try {
        const availability = await queryDatabase(
            "SELECT subject_id FROM timetable WHERE section_id = ? AND semester_id = ? AND day = ? AND time = ?", 
            [section, semester, day, hour]
        );
        return (availability.length === 0);
    } catch (err) {
        console.error('Error in checkClassAvailability:', err);
        return false;
    }
}

export default checkClassAvailability;
