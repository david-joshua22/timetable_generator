import db from './connection.js';

function queryDatabase(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.query(sql, params, (err, results) => {
            if (err) reject(err);
            else resolve(results);
        });
    });
}

async function getDataAndSchedule() {
    try {
        console.log("New Get Method : ");
        const facSecMap = await queryDatabase("select * from fac_sec_map inner JOIN subject on subject.id = fac_sec_map.subject_id where type = ?",['Elective']);
        const labMap = await queryDatabase("SELECT flm.*, s.*  FROM faculty_lab_mapping flm JOIN subject s ON s.id = flm.subject_id");
        const lectureMap = await queryDatabase("select * from fac_sec_map inner JOIN subject on subject.id = fac_sec_map.subject_id where type = ?",['Lecture']);
        const groupedBySubject = facSecMap.reduce((acc, item) => {
            if (!acc[item.subject_id]) {
                acc[item.subject_id] = [];
            }
            acc[item.subject_id].push(item);
            return acc;
        }, {});
        for (let subject_id in groupedBySubject) {
            await assignElectivePeriod(groupedBySubject[subject_id]);
        }
        for (let item of labMap) {
            await assignLabPeriod(item);
        }
        for (let item of lectureMap) {
            await assignLecturePeriod(item);
        }
    } catch (err) {
        console.error('Error:', err);
    }
}
function shuffleArray(array) {
    let shuffled = [...array]; // Create a copy to avoid modifying the original array
    for (let i = shuffled.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1)); // Pick a random index
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]; // Swap elements
    }
    return shuffled;
}

function groupBySectionFaculty(rows) {
    const grouped = {};

    rows.forEach(row => {
        if (!grouped[row.subject_id]) {
            grouped[row.subject_id] = {
                subject_id: row.subject_id,
                name: row.name,
                type: row.type,
                semester_id: row.semester_id,
                hours_per_week: row.hours_per_week,
                faculty_list: []  // Store section-faculty mappings
            };
        }

        grouped[row.subject_id].faculty_list.push({
            faculty_id: row.faculty_id,
            section_id: row.section_id
        });
    });

    // Flatten the grouped object to return an array of section-faculty mappings
    return Object.values(grouped).flatMap(group => 
        group.faculty_list.map(entry => ({
            subject_id: group.subject_id,
            name: group.name,
            type: group.type,
            semester_id: group.semester_id,
            hours_per_week: group.hours_per_week,
            faculty_id: entry.faculty_id,
            section_id: entry.section_id
        }))
    );
}

async function assignLabPeriod(lab_map) {
    try {
        const { semester_id, section_id, subject_id, faculty_id_A, faculty_id_B, hours_per_week } = lab_map;
        let checkAssigned = false;
        let days = [1, 2, 3, 4, 5];
        let shuffledDays = shuffleArray(days);
        for (let day of shuffledDays) {
            if (checkAssigned) break;

            let lab_hour_count = 0;
            let available_periods = [];

            for (let period = 1; period <= 3; period++) {
                let [faculty_avail_A, faculty_avail_B, class_avail] = await Promise.all([
                    checkFacultyAvailability(faculty_id_A, day, period),
                    checkFacultyAvailability(faculty_id_B, day, period),
                    checkClassAvailability(section_id, day, period)
                ]);

                if (faculty_avail_A && faculty_avail_B && class_avail) {
                    lab_hour_count++;
                    available_periods.push(period);
                }
            }

            if (lab_hour_count === hours_per_week) {
                await insertLabIntoTimetable(day, available_periods, semester_id, section_id, subject_id, faculty_id_A, faculty_id_B);
                checkAssigned = true;
                break;
            }

            lab_hour_count = 0;
            available_periods = [];

            for (let period = 4; period <= 6; period++) {
                let [faculty_avail_A, faculty_avail_B, class_avail] = await Promise.all([
                    checkFacultyAvailability(faculty_id_A, day, period),
                    checkFacultyAvailability(faculty_id_B, day, period),
                    checkClassAvailability(section_id, day, period)
                ]);

                if (faculty_avail_A && faculty_avail_B && class_avail) {
                    lab_hour_count++;
                    available_periods.push(period);
                }
            }

            if (lab_hour_count === hours_per_week) {
                await insertLabIntoTimetable(day, available_periods, semester_id, section_id, subject_id, faculty_id_A, faculty_id_B);
                checkAssigned = true;
                break;
            }
        }
    } catch (err) {
        console.error('Error in assignLabPeriod:', err);
    }
}

async function insertLabIntoTimetable(day, periods, semester_id, section_id, subject_id, faculty_id_A, faculty_id_B) {
    for (let period of periods) {
        await queryDatabase(
            "INSERT INTO timetable(day, time, semester_id, section_id, subject_id) VALUES(?,?,?,?,?)",
            [day, period, semester_id, section_id, subject_id]
        );

        await queryDatabase(
            "INSERT INTO faculty_timetable(faculty_id, day, time, semester_id, section_id, subject_id) VALUES(?,?,?,?,?,?)",
            [faculty_id_A, day, period, semester_id, section_id, subject_id]
        );

        await queryDatabase(
            "INSERT INTO faculty_timetable(faculty_id, day, time, semester_id, section_id, subject_id) VALUES(?,?,?,?,?,?)",
            [faculty_id_B, day, period, semester_id, section_id, subject_id]
        );
    }
}

async function assignElectivePeriod(fac_map) {
    try {
        const facultyList = groupBySectionFaculty(fac_map);
        if (facultyList.length === 0) return;

        let { subject_id, hours_per_week, semester_id } = facultyList[0]; // All will have the same properties
        let assigned_hours = 0;

        let days = [1, 2, 3, 4, 5];
        let shuffledDays = shuffleArray(days); // Shuffle for randomness

        for (let day of shuffledDays) {
            if (assigned_hours === hours_per_week) break; // Stop when hours are fulfilled

            let periods = shuffleArray([2, 3]); // Only considering 2nd and 3rd periods
            for (let period of periods) {
                // Check if all faculty and sections are available at the same time
                let allAvailable = await Promise.all(
                    facultyList.map(async (fac_map) => {
                        let faculty_avail = await checkFacultyAvailability(fac_map.faculty_id, day, period);
                        let class_avail = await checkClassAvailability(fac_map.section_id, day, period);
                        return faculty_avail && class_avail;
                    })
                );

                if (allAvailable.every(Boolean)) { 
                    for (let fac_map of facultyList) {
                        const { section_id, faculty_id } = fac_map;

                        await queryDatabase(
                            "INSERT INTO timetable(day, time, semester_id, section_id, subject_id) VALUES(?,?,?,?,?)",
                            [day, period, semester_id, section_id, subject_id]
                        );

                        await queryDatabase(
                            "INSERT INTO faculty_timetable(faculty_id, day, time, semester_id, section_id, subject_id) VALUES(?,?,?,?,?,?)",
                            [faculty_id, day, period, semester_id, section_id, subject_id]
                        );
                    }

                    assigned_hours += 1; // Increment assigned hours
                    break; // Move to the next day after scheduling
                }
            }
        }

        if (assigned_hours < hours_per_week) {
            console.log(`⚠️ Not all hours could be assigned for ${subject_id}`);
        }
    } catch (err) {
        console.error('❌ Error in assignElectivePeriod:', err);
    }
}


async function assignLecturePeriod(fac_map) {
    try {
        let hours = fac_map.hours_per_week;
        let check_hours = 0;
        let days = [1, 2, 3, 4, 5];
        let shuffledDays = shuffleArray(days);
        for (let day of shuffledDays) {
            if (check_hours === hours) break; // Exit if all hours are assigned
        
            let periods = shuffleArray([1,2,3,4,5,6]); // Only considering 2nd and 3rd periods
            for (let period of periods) {
                // Check availability in parallel
                let [faculty_avail, class_avail] = await Promise.all([
                    checkFacultyAvailability(fac_map.faculty_id, day, period),
                    checkClassAvailability(fac_map.section_id, day, period)
                ]);
        
                if (faculty_avail && class_avail) {
                    const { semester_id, section_id, subject_id, faculty_id } = fac_map;
        
                    //Insert into timetable
                    await queryDatabase(
                        "INSERT INTO timetable(day, time, semester_id, section_id, subject_id) VALUES(?,?,?,?,?)",
                        [day, period, semester_id, section_id, subject_id]
                    );
        
                    // Insert into faculty timetable
                    await queryDatabase(
                        "INSERT INTO faculty_timetable(faculty_id, day, time, semester_id, section_id, subject_id) VALUES(?,?,?,?,?,?)",
                        [faculty_id, day, period, semester_id, section_id, subject_id]
                    );
        
                    check_hours += 1; // Increment assigned hours
        
                    break; //  Break inner loop to move to the next day
                }
            }
        }        
        if (check_hours < hours) {
            console.log("Not all hours could be assigned.");
        }
    } catch (err) {
        console.error('Error in assignElectivePeriod:', err);
    }
}




async function checkFacultyAvailability(faculty, day, hour) {
    try {
        const availability = await queryDatabase("SELECT * FROM faculty_timetable WHERE faculty_id = ? AND day = ? AND time = ?", [faculty, day, hour]);
        return (availability.length === 0);
    } catch (err) {
        console.error('Error in checkFacultyAvailability:', err);
        return false;
    }
}

async function checkClassAvailability(section, day, hour) {
    try {
        const availability = await queryDatabase(
            "SELECT subject_id FROM timetable WHERE section_id = ? AND day = ? AND time = ?", 
            [section, day, hour]
        );
        return (availability.length === 0);
    } catch (err) {
        console.error('Error in checkClassAvailability:', err);
        return false;
    }
}


export default getDataAndSchedule;
