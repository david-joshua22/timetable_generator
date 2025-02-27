import queryDatabase from './queryDatabase.js';
import checkClassAvailability from './checkClassAvailabilty.js';
import checkFacultyAvailability from './checkFacultyAvailabilty.js';
import shuffleArray from './shuffleArray.js';
import groupElectives from './groupElectives.js';




async function getDataAndSchedule(semesterId) {
    try {
        console.log("New Get Method : ");
        const sections = await queryDatabase("SELECT section_id FROM section_semester_map WHERE semester_id = ?", [semesterId]);
        const electives = await queryDatabase("SELECT * FROM elective where semester_id = ?",[semesterId]);
        await assignElectivePeriod(electives, sections);
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
            console.log(facultyList1);
            for (let facultyGroup of facultyList1) {
                console.log(facultyGroup);
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
export default getDataAndSchedule;
