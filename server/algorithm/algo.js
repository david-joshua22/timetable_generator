import queryDatabase from './queryDatabase.js';
import checkClassAvailability from './checkClassAvailabilty.js';
import checkFacultyAvailability from './checkFacultyAvailabilty.js';
import checkLabClassAvailability from './checkLabClassAvailability.js';
import shuffleArray from './shuffleArray.js';
import groupElectives from './groupElectives.js';

async function getDataAndSchedule(semesterId) {
    try {
        console.log("New Get Method : ");
        const labMap = await queryDatabase("SELECT flm.*, s.*  FROM faculty_lab_mapping flm JOIN subject s ON s.id = flm.subject_id where flm.semester_id = ?",[semesterId]);
        const lectureMap = await queryDatabase("select * from fac_sec_map inner JOIN subject on subject.id = fac_sec_map.subject_id where type = ? and fac_sec_map.semester_id = ?",['Lecture',semesterId]);
        const sections = await queryDatabase("SELECT section_id FROM section_semester_map WHERE semester_id = ?", [semesterId]);
        const electives = await queryDatabase("SELECT * FROM elective where semester_id = ?",[semesterId]);
        await assignElectivePeriod(electives, sections);
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

async function assignElectivePeriod(fac_map, sections) {
    try {
        const facultyList = Object.values(groupElectives(fac_map, sections));
        if (facultyList.length === 1) return;
        else if(facultyList.length === 2){
            let days = shuffleArray([1, 2, 3, 4, 5]);
            days.pop();
            days.pop();
   
            for (let facultyGroup of facultyList) {
                let { elective_id, hours_per_week, semester_id, faculty_id, sections: allSections, elective_section } = facultyGroup;
                let assigned_hours = 0;
   
                for (let day of days) {
                    if (assigned_hours >= hours_per_week) break;
   
                    let periods = shuffleArray([2, 3]);
                    for (let period of periods) {
                        if (assigned_hours >= hours_per_week) break;
   
                        let allAvailable = await Promise.all(
                            allSections.map(async (section_id) => {
                                let faculty_avail = await Promise.all(faculty_id.map(fac => checkFacultyAvailability(fac, day, period)));
                                let class_avail = await checkClassAvailability(section_id, semester_id, day, period);
                                return faculty_avail.every(Boolean) && class_avail;
                            })
                        );
   
                        if (allAvailable.every(Boolean)) {
                            await Promise.all(allSections.map(async (section_id) => {
                                await queryDatabase(
                                    "INSERT INTO timetable(day, time, semester_id, section_id, subject_id) VALUES(?,?,?,?,?)",
                                    [day, period, semester_id, section_id, elective_id]
                                );
                            }));
   
                            await Promise.all(faculty_id.map(async (faculty, index) => {
                                await queryDatabase(
                                    "INSERT INTO faculty_timetable(faculty_id, day, time, semester_id, elective_section_id, subject_id) VALUES(?,?,?,?,?,?)",
                                    [faculty, day, period, semester_id, elective_section[index], elective_id]
                                );
                            }));
   
                            assigned_hours += 1;
                            break;
                        }
                    }
                }
   
                if (assigned_hours < hours_per_week) {
                    console.log(`⚠️ Not all hours could be assigned for Elective ID: ${facultyGroup.elective_id}`);
                }
            }
        }
        else if(facultyList.length === 3) {
            const facultyList1 = facultyList;
            let days = shuffleArray([1, 2, 3, 4, 5]);
            days.pop();
            days.pop();
            for (let facultyGroup of facultyList1) {
                let { elective_id, hours_per_week, semester_id, faculty_id, sections: allSections, elective_section } = facultyGroup;
                let assigned_hours = 0;
                let days_hours = hours_per_week;
       
                for (let day of days) {
                    if (assigned_hours >= hours_per_week) break;
                    let periods = [];
                    if (days_hours === 1) {
                        periods = shuffleArray([4, 5, 6]);
                    } else {
                        periods = shuffleArray([1, 2, 3]);
                    }
       
                    const assignedPeriods = new Set(); // Track assigned periods for dummy insertion
       
                    for (let period of periods) {
                        if (assigned_hours >= hours_per_week) break;


                        if(faculty_id === null) {
                            let allAvailable = await Promise.all(
                                allSections.map(async (section_id) => {
                                    let class_avail = await checkClassAvailability(section_id, semester_id, day, period);
                                    return class_avail;
                                })
                            );
                            if (allAvailable.every(Boolean)) {
                                await Promise.all(allSections.map(async (section_id) => {
                                    await queryDatabase(
                                        "INSERT INTO timetable(day, time, semester_id, section_id, subject_id) VALUES(?,?,?,?,?)",
                                        [day, period, semester_id, section_id, elective_id]
                                    );
                                    assignedPeriods.add(period);
                                }));
                            }


                        }
                        else {
                            let allAvailable = await Promise.all(
                                allSections.map(async (section_id) => {
                                    let faculty_avail = await Promise.all(faculty_id.map(fac => checkFacultyAvailability(fac, day, period)));
                                    let class_avail = await checkClassAvailability(section_id, semester_id, day, period);
                                    return faculty_avail.every(Boolean) && class_avail;
                                })
                            );
                       
       
                            if (allAvailable.every(Boolean)) {
                                await Promise.all(allSections.map(async (section_id) => {
                                    await queryDatabase(
                                        "INSERT INTO timetable(day, time, semester_id, section_id, subject_id) VALUES(?,?,?,?,?)",
                                        [day, period, semester_id, section_id, elective_id]
                                    );
                                    assignedPeriods.add(period);
                                }));
       
                                await Promise.all(faculty_id.map(async (faculty, index) => {
                                    await queryDatabase(
                                        "INSERT INTO faculty_timetable(faculty_id, day, time, semester_id, elective_section_id, subject_id) VALUES(?,?,?,?,?,?)",
                                        [faculty, day, period, semester_id, elective_section[index], elective_id]
                                    );
                                }));
       
                                assigned_hours += 1;
                                days_hours -= 1;
                                break;
                            }
                        }
                    }
                }
       
                if (assigned_hours < hours_per_week) {
                    console.log(`⚠️ Not all hours could be assigned for Elective ID: ${facultyGroup.elective_id}`);
                }
            }
        }
        else{
            let days = shuffleArray([1, 2, 3, 4, 5]);
            days.pop();
            days.pop();
   
            for (let facultyGroup of facultyList) {
                let { elective_id, hours_per_week, semester_id, faculty_id, sections: allSections, elective_section } = facultyGroup;
                let assigned_hours = 0;
   
                for (let day of days) {
                    if (assigned_hours >= hours_per_week) break;
   
                    let periods = shuffleArray([1,2,3,4,5,6]);
                    for (let period of periods) {
                        if (assigned_hours >= hours_per_week) break;
   
                        let allAvailable = await Promise.all(
                            allSections.map(async (section_id) => {
                                let faculty_avail = await Promise.all(faculty_id.map(fac => checkFacultyAvailability(fac, day, period)));
                                let class_avail = await checkClassAvailability(section_id, semester_id, day, period);
                                return faculty_avail.every(Boolean) && class_avail;
                            })
                        );
   
                        if (allAvailable.every(Boolean)) {
                            await Promise.all(allSections.map(async (section_id) => {
                                await queryDatabase(
                                    "INSERT INTO timetable(day, time, semester_id, section_id, subject_id) VALUES(?,?,?,?,?)",
                                    [day, period, semester_id, section_id, elective_id]
                                );
                            }));
   
                            await Promise.all(faculty_id.map(async (faculty, index) => {
                                await queryDatabase(
                                    "INSERT INTO faculty_timetable(faculty_id, day, time, semester_id, elective_section_id, subject_id) VALUES(?,?,?,?,?,?)",
                                    [faculty, day, period, semester_id, elective_section[index], elective_id]
                                );
                            }));
   
                            assigned_hours += 1;
                            break;
                        }
                    }
                }
   
                if (assigned_hours < hours_per_week) {
                    console.log(`⚠️ Not all hours could be assigned for Elective ID: ${facultyGroup.elective_id}`);
                }
            }
        }
    } catch (err) {
        console.error('❌ Error in assignElectivePeriod:', err);
    }
}

async function assignLabPeriod(lab_map) {
    try {
        const { semester_id, section_id, subject_id, faculty_id_A, faculty_id_B, faculty_id_C, hours_per_week, lab_name } = lab_map;
        let checkAssigned = false;
        let days = shuffleArray([1, 2, 3, 4, 5]); // Shuffled weekdays

        // Define period ranges based on lab hours
        const periodRanges = (hours_per_week === 3) 
            ? [[4, 6],[1,3]]
            : [[4, 5],[5, 6],[1, 2], [2, 3], [3, 4]];

        for (let day of days) {
            if (checkAssigned) break;

            for (let [start, end] of periodRanges) {
                let lab_hour_count = 0;
                let available_periods = [];

                for (let period = start; period <= end; period++) {
                    let faculty_avail = [];
                    
                    // Check availability based on the number of faculties present
                    if (faculty_id_A) {
                        faculty_avail.push(checkFacultyAvailability(faculty_id_A, day, period));
                    }
                    if (faculty_id_B) {
                        faculty_avail.push(checkFacultyAvailability(faculty_id_B, day, period));
                    }
                    if (faculty_id_C) {
                        faculty_avail.push(checkFacultyAvailability(faculty_id_C, day, period));
                    }
                    
                    // Add class availability check
                    faculty_avail.push(checkClassAvailability(section_id, semester_id, day, period));

                    faculty_avail.push(checkLabClassAvailability(lab_name, day, period));

                    // Resolve all promises and validate availability
                    let availability = await Promise.all(faculty_avail);
                    if (availability.every(status => status)) {
                        lab_hour_count++;
                        available_periods.push(period);
                    }
                }

                if (lab_hour_count === hours_per_week) {
                    await insertLabIntoTimetable(day, available_periods, semester_id, section_id, subject_id, faculty_id_A, faculty_id_B, faculty_id_C, lab_name);
                    checkAssigned = true;
                    break;
                }
            }
        }
    } catch (err) {
        console.error('Error in assignLabPeriod:', err);
    }
}

async function insertLabIntoTimetable(day, periods, semester_id, section_id, subject_id, faculty_id_A, faculty_id_B = null, faculty_id_C = null, lab_name) {
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
            "INSERT INTO lab_timetable(day, time, semester_id, section_id, subject_id, lab_name) VALUES(?,?,?,?,?,?)",
            [day, period, semester_id, section_id, subject_id, lab_name]
        );

        if (faculty_id_B) {
            await queryDatabase(
                "INSERT INTO faculty_timetable(faculty_id, day, time, semester_id, section_id, subject_id) VALUES(?,?,?,?,?,?)",
                [faculty_id_B, day, period, semester_id, section_id, subject_id]
            );
        }

        if (faculty_id_C) {
            await queryDatabase(
                "INSERT INTO faculty_timetable(faculty_id, day, time, semester_id, section_id, subject_id) VALUES(?,?,?,?,?,?)",
                [faculty_id_C, day, period, semester_id, section_id, subject_id]
            );
        }
    }
}



async function assignLecturePeriod(fac_map) {
    try {
        let hours = fac_map.hours_per_week;
        let assigned_hours = 0;
        let days = shuffleArray([1, 2, 3, 4, 5]); // Weekdays

        // Loop until all hours are assigned
        while (assigned_hours < hours) {
            for (let day of days) {
                if (assigned_hours >= hours) break; 

                let periods = shuffleArray([2, 3, 4]);
                periods.splice(0, 0, 1); 
                periods.push(5,6);
                for (let period of periods) {

                    // Check availability in parallel
                    let [faculty_avail, class_avail] = await Promise.all([
                        checkFacultyAvailability(fac_map.faculty_id, day, period),
                        checkClassAvailability(fac_map.section_id, fac_map.semester_id, day, period)
                    ]);

                    if (faculty_avail && class_avail) {
                        const { semester_id, section_id, subject_id, faculty_id } = fac_map;

                        // Insert into timetable
                        await queryDatabase(
                            "INSERT INTO timetable(day, time, semester_id, section_id, subject_id) VALUES(?,?,?,?,?)",
                            [day, period, semester_id, section_id, subject_id]
                        );

                        // Insert into faculty timetable
                        await queryDatabase(
                            "INSERT INTO faculty_timetable(faculty_id, day, time, semester_id, section_id, subject_id) VALUES(?,?,?,?,?,?)",
                            [faculty_id, day, period, semester_id, section_id, subject_id]
                        );

                        assigned_hours += 1; // Increment assigned hours
                        break; // Exit period loop to ensure only 1 period per day
                    }
                }
            }

            // If all hours are assigned, exit the loop
            if (assigned_hours >= hours) break;

            // If not all hours are assigned, reshuffle the days and try again
            days = shuffleArray(days);
        }

        if (assigned_hours < hours) {
            console.log(`⚠️ Not all hours could be assigned for Subject: ${fac_map.name} (ID: ${fac_map.subject_id})`);
        }
    } catch (err) {
        console.error('Error in assignLecturePeriod:', err);
    }
}



export default getDataAndSchedule;