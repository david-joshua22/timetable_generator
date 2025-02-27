function groupElectives(rowDataPackets, sections) {
    const grouped = rowDataPackets.reduce((acc, row) => {
        const { elective_id, semester_id, elective_section, elective_subject_id, elective_name, faculty_id, hours_per_week } = row;

        if (!acc[elective_id]) {
            acc[elective_id] = {
                semester_id,
                elective_id,
                elective_section: [],
                elective_subject_id: [],
                elective_name: [],
                faculty_id: [],
                hours_per_week,
                sections: sections.map(s => s.section_id)
            };
        }

        acc[elective_id].elective_section.push(elective_section);
        acc[elective_id].elective_subject_id.push(elective_subject_id);
        acc[elective_id].elective_name.push(elective_name);
        acc[elective_id].faculty_id.push(faculty_id);

        return acc;
    }, {});

    // Add a dummy counseling period
    const semester_id = rowDataPackets.length > 0 ? rowDataPackets[0].semester_id : '';
    grouped['MVGRCOUN6'] = {
        semester_id: semester_id,
        elective_id: 'MVGRCOUN6',
        elective_section: [],
        elective_subject_id: [],
        elective_name: [],
        faculty_id: [],
        hours_per_week: 3,
        sections: sections.map(s => s.section_id)
    };

    return grouped;
}

export default groupElectives;
