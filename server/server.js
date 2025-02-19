import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import db from './connection.js';
import getDataAndSchedule from './algo.js';

const SECRET_KEY = 'AJH7O9q5MHhJbzC5GidFE1fsmVyTnQqU';

const app = express();

app.use(cors());
app.use(express.json()); 


app.get('/', (req, res) => {
    return res.json('Hello');
});

app.get('/faculty', (req, res) => {
    const sql = "SELECT * FROM faculty";
    db.query(sql, (err, data) => {
        if (err) return res.json({ err: err.message });
        res.json(data);
        console.log(data);
    });
});

app.get('/subjects', (req, res) => {
    const sql = "SELECT * FROM subject order by semester_id";
    db.query(sql, (err, data) => {
        if (err) return res.json({ err: err.message });
        res.json(data);
        console.log(data);
    });
});

app.post('/addFaculty', (req, res) => {
    const sql = "INSERT INTO faculty(`id`,`name`,`department`) VALUES(?)";
    const values = [
        req.body.id,
        req.body.name,
        req.body.department
    ];
    
    db.query(sql, [values], (err, data) => {
        if (err) return res.json({ err: err.message });
        console.log("Faculty added successfully");
        res.json({ message: "Faculty added successfully" });
    });
});

app.post('/addSubjects', (req, res) => {
    const sql = "INSERT INTO subject(`id`,`name`,`type`,`hours_per_week`,`semester_id`) VALUES(?)";
    const values = [
        req.body.id,
        req.body.name,
        req.body.type,
        req.body.hours_per_week,
        req.body.semester
    ];
    
    db.query(sql, [values], (err, data) => {
        if (err) return res.json({ err: err.message });
        console.log("Faculty added successfully");
        res.json({ message: "Faculty added successfully" });
    });
});

app.delete('/deleteFaculty/:id',(req,res)=>{
    const id = req.params.id;
    const sql = "DELETE FROM faculty WHERE id = ?"
    db.query(sql, id, (err, data) => {
        if (err) return res.json({ err: err.message });
        console.log("Faculty added successfully");
        res.json({ message: "Faculty deleted successfully" });
    })
})

app.get('/viewFaculty/:id',(req,res)=>{
    const id = req.params.id;
    const sql = "SELECT * FROM faculty WHERE id = ?";
    db.query(sql,id, (err, data) => {
        if (err) return res.json({ err: err.message });
        res.json(data);
        console.log(data);
    });
})

app.post('/updateFaculty/:id', (req, res) => {
    const id = req.params.id;
    const sql = "UPDATE faculty SET name = ?, department = ? WHERE id = ?";
    const values = [req.body.name, req.body.department, id];
    
    db.query(sql, values, (err, data) => {
        if (err) {
            console.error('Error updating faculty:', err);
            return res.json({ error: err.message });
        }
        console.log("Faculty updated successfully");
        res.json({ message: "Faculty updated successfully" });
    });
});

app.get('/viewSubject/:id', (req, res) => {
    const id = req.params.id;
    const sql = "SELECT * FROM subject WHERE id = ?";
    db.query(sql, id, (err, data) => {
        if (err) return res.json({ err: err.message });
        res.json(data);
        console.log(data);
    });
});

// Update subject
app.post('/updateSubject/:id', (req, res) => {
    const id = req.params.id;
    const sql = "UPDATE subject SET name = ?, type = ?, hours_per_week = ? WHERE id = ?";
    const values = [
        req.body.name,
        req.body.type,
        req.body.hours_per_week,
        id
    ];
    
    db.query(sql, values, (err, data) => {
        if (err) {
            console.error('Error updating subject:', err);
            return res.json({ error: err.message });
        }
        console.log("Subject updated successfully");
        res.json({ message: "Subject updated successfully" });
    });
});

// Delete subject
app.delete('/deleteSubject/:id', (req, res) => {
    const id = req.params.id;
    const sql = "DELETE FROM subject WHERE id = ?";
    db.query(sql, id, (err, data) => {
        if (err) return res.json({ err: err.message });
        console.log("Subject deleted successfully");
        res.json({ message: "Subject deleted successfully" });
    });
});

app.post('/mapSubFac', (req, res) => {
    console.log("Received data:", req.body); 

    const sql = "INSERT INTO fac_sec_map(`semester_id`,`section_id`,`subject_id`,`faculty_id`) VALUES(?)";
    const values = [
        req.body.semester,
        req.body.class,
        req.body.subject,
        req.body.faculty
    ];

    db.query(sql, [values], (err, data) => {
        if (err) {
            console.error('Error inserting mapping:', err);
            return res.status(500).json({ error: err.message });
        }
        console.log("Mapping added successfully");
        res.json({ message: "Mapping added successfully" });
    });
});

app.post('/labEntry', (req, res) => {
    console.log("Received lab mapping data:", req.body);

    const sql = "INSERT INTO faculty_lab_mapping(`semester_id`, `section_id`, `subject_id`, `faculty_id_A`, `faculty_id_B`) VALUES (?)";

    const values = [
        req.body.semester,
        req.body.class,
        req.body.subject,
        req.body.faculty1,
        req.body.faculty2
    ];

    db.query(sql, [values], (err, data) => {
        if (err) {
            console.error('Error inserting lab mapping:', err);
            return res.status(500).json({ error: err.message });
        }
        console.log("Lab mapping added successfully");
        res.json({ message: "Lab mapping added successfully" });
    });
});

app.post('/getTimetable', (req, res) => {
    const { semester, section } = req.body;

    if (!semester || !section) {
        return res.status(400).json({ error: "Semester and section are required" });
    }

    const sql = `SELECT * from timetable as t inner join subject on t.subject_id = subject.id where t.semester_id = ? and section_id = ? order by day,time; `;

    db.query(sql, [semester, section], (err, results) => {
        if (err) {
            console.error("Database error:", err); // Log error
            return res.status(500).json({ error: err.message });
        }
        
        res.json(results);
    });
});

app.post('/getFacOfClass', (req, res) => {
    const { semester, section } = req.body;
    
    if (!semester || !section) {
        return res.status(400).json({ error: "Semester and section are required" });
    }

    const theoryQuery = `SELECT faculty.name AS faculty_name, subject.name AS subject_name 
                         FROM fac_sec_map AS fp 
                         INNER JOIN faculty ON fp.faculty_id = faculty.id 
                         INNER JOIN subject ON fp.subject_id = subject.id 
                         WHERE fp.section_id = ? AND fp.semester_id = ?`;
    
    const labQuery = `SELECT 
                        f1.name AS faculty_name_A, 
                        f2.name AS faculty_name_B, 
                        subject.name AS subject_name,
                        fp.subject_id
                      FROM faculty_lab_mapping AS fp 
                      INNER JOIN faculty f1 ON fp.faculty_id_A = f1.id 
                      INNER JOIN faculty f2 ON fp.faculty_id_B = f2.id 
                      INNER JOIN subject ON fp.subject_id = subject.id 
                      WHERE fp.section_id = ? AND fp.semester_id = ?`;

    Promise.all([
        new Promise((resolve, reject) => {
            db.query(theoryQuery, [section, semester], (err, results) => {
                if (err) reject(err);
                else resolve(results);
            });
        }),
        new Promise((resolve, reject) => {
            db.query(labQuery, [section, semester], (err, results) => {
                if (err) reject(err);
                else resolve(results);
            });
        })
    ])
    .then(([theoryResults, labResults]) => {
        // Process theory results
        const theory = theoryResults.map(item => ({
            faculty_name: item.faculty_name,
            subject_name: item.subject_name
        }));
        
        // Process lab results - combine faculty A and B
        const lab = labResults.map(item => ({
            faculty_name: `${item.faculty_name_A}, ${item.faculty_name_B}`,
            subject_name: item.subject_name
        }));
        
        // Combine all results
        const combinedResults = [...theory, ...lab];
        res.json(combinedResults);
    })
    .catch(err => {
        console.error("Database error:", err);
        res.status(500).json({ error: err.message });
    });
});


app.get('/getFacSubMap', (req, res) => {
    const sql = `
        SELECT 
            fsm.id,
            fsm.semester_id, 
            fsm.section_id, 
            f.name AS faculty_name, 
            s.name AS subject_name 
        FROM fac_sec_map fsm
        JOIN faculty f ON fsm.faculty_id = f.id
        JOIN subject s ON fsm.subject_id = s.id
    `;

    db.query(sql, (err, data) => {
        if (err) {
            console.error('Error fetching mappings:', err);
            return res.status(500).json({ error: err.message });
        }
        res.json(data);
    });
});


// Delete faculty-subject mapping
app.delete('/deleteFacSubMap/:id', (req, res) => {
    const id = req.params.id;
    const sql = "DELETE FROM fac_sec_map WHERE id = ?";
    
    db.query(sql, [id], (err, data) => {
        if (err) {
            console.error('Error deleting mapping:', err);
            return res.json({ err: err.message });
        }
        res.json({ message: "Mapping deleted successfully" });
    });
});

// Fetch lab faculty-subject mappings
app.get('/getLabFacSubMap', (req, res) => {
    const sql = `
        SELECT 
            flm.id,
            flm.semester_id, 
            flm.section_id, 
            f1.name AS faculty1_name, 
            f2.name AS faculty2_name, 
            s.name AS subject_name 
        FROM faculty_lab_mapping flm
        JOIN faculty f1 ON flm.faculty_id_A = f1.id
        JOIN faculty f2 ON flm.faculty_id_B = f2.id
        JOIN subject s ON flm.subject_id = s.id
    `;

    db.query(sql, (err, data) => {
        if (err) {
            console.error('Error fetching lab mappings:', err);
            return res.status(500).json({ error: err.message });
        }
        res.json(data);
    });
});

// Delete lab faculty-subject mapping
app.delete('/deleteLabFacSubMap/:id', (req, res) => {
    const id = req.params.id;
    const sql = "DELETE FROM faculty_lab_mapping WHERE id = ?";
    
    db.query(sql, [id], (err, data) => {
        if (err) {
            console.error('Error deleting lab mapping:', err);
            return res.json({ err: err.message });
        }
        res.json({ message: "Lab mapping deleted successfully" });
    });
});



app.post("/login", (req, res) => {
    const { username, password, loginType } = req.body;

    console.log("Received login request:", { username, loginType });

    const sql = "SELECT * FROM users WHERE username = ? AND role = ?";
    
    db.query(sql, [username, loginType], (err, data) => {
        if (err) {
            console.error("Database Error:", err);
            return res.status(500).json({ error: "Internal Server Error" });
        }

        if (data.length === 0) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const user = data[0];

        if (password.trim() !== user.password.trim()) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        // Generate JWT Token
        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            SECRET_KEY,
            { expiresIn: "1h" } // Token expires in 1 hour
        );

        console.log("Login successful! Token generated.");

        return res.status(200).json({
            message: "Login successful",
            token,
            user: {
                id: user.id,
                username: user.username,
                role: user.role
            }
        });
    });
});

app.post("/verify-token", (req, res) => {
    const token = req.headers["authorization"]?.split(" ")[1];
  
    if (!token) {
      return res.json({ valid: false });
    }
  
    jwt.verify(token, SECRET_KEY, (err, decoded) => {
      if (err) {
        return res.json({ valid: false });
      }
      res.json({ valid: true, role: decoded.role });
    });
  });


  
  app.get('/generate', (req, res) => {
    getDataAndSchedule();
});


app.listen(3000, () => {
    console.log("Server running on port 3000");
});
