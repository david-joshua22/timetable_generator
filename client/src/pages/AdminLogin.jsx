import { useContext } from "react";
import { NavLink, Routes, Route, useNavigate } from "react-router-dom";
import { FiLogOut } from "react-icons/fi";
import { FaUserPlus, FaBook, FaMapMarkedAlt, FaClipboard, FaEye, FaCalendarAlt, FaChalkboardTeacher, FaEdit ,FaFlask,FaUserMd, FaUser} from "react-icons/fa";
import "../styles/AdminLogin.css";
import { userContext } from "../context/UserContext";
import Faculty from "./Faculty";
import Subjects from "./Subjects";
import SubjectTable from "./SubjectTable";
import FacultySubject from "./FacultySubject";
import AFaculty from "./AddFaculty";
import AddElective from "./AddElective";
import ViewMappings from "./ViewMappings";
import Display from "./Display";
import EditTimetable from "./EditTimetable";
import FacultyDashboard from "./FacultyDashboard";
import DisplayElectives from "./DisplayElectives";
import AddLab from "./AddLab";
import LabTimetable from "./LabTimetable";

const AdminDashboard = () => {
  const { setAuthenticated, setRole } = useContext(userContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setAuthenticated(false);
    setRole(null);
    navigate("/login");
  };

  return (
    <div className="dashboard-container">
      <div className="sidebar" style={{ width: '300px' }}>
        <h1 className="sidebar-title">Welcome Admin!</h1>

        <nav className="menu">
          <div className="handleOverflow" style={{ width: '100%' }}>
            {/* Add 'end' to prevent highlighting on subroutes */}          
            
            <NavLink to="/admin/faculty" className={({ isActive }) => isActive ? "menu-item active" : "menu-item"}>
              <FaUserPlus className="icon" /> Add Faculty
            </NavLink>

            <NavLink to="/admin/subjects" className={({ isActive }) => isActive ? "menu-item active" : "menu-item"}>
              <FaBook className="icon" /> Add Subjects
            </NavLink>

            <NavLink to="/admin/addLab" className={({ isActive }) => isActive ? "menu-item active" : "menu-item"}>
              <FaFlask className="icon" /> Add Lab
            </NavLink>

            <NavLink to="/admin/displayElective" className={({ isActive }) => isActive ? "menu-item active" : "menu-item"}>
              <FaClipboard className="icon" /> Display Electives
            </NavLink>

            <NavLink to="/admin/sfmap" className={({ isActive }) => isActive ? "menu-item active" : "menu-item"}>
              <FaMapMarkedAlt className="icon" /> Map Faculty-Subject
            </NavLink>

            <NavLink to="/admin/viewMapping" className={({ isActive }) => isActive ? "menu-item active" : "menu-item"}>
              <FaCalendarAlt className="icon" /> Generate Timetable
            </NavLink>

            <NavLink to="/admin/displayFaculty" className={({ isActive }) => isActive ? "menu-item active" : "menu-item"}>
              <FaChalkboardTeacher className="icon" /> Faculty Timetable
            </NavLink>

            <NavLink to="/admin/labTimetable" className={({ isActive }) => isActive ? "menu-item active" : "menu-item"}>
              <FaUserMd className="icon" /> Lab Timetable
            </NavLink>

            <NavLink to="/admin/display" className={({ isActive }) => isActive ? "menu-item active" : "menu-item"}>
              <FaEye className="icon" /> View Timetable
            </NavLink>


            <NavLink to="/admin/editTimetable" className={({ isActive }) => isActive ? "menu-item active" : "menu-item"}>
              <FaEdit className="icon" /> Edit Timetable
            </NavLink>
          </div>

        </nav>

        {/* Logout Button */}
        <button className="logout" onClick={handleLogout}>
          <FiLogOut className="icon" /> Logout
        </button>
      </div>

      {/* Content Area - Shows the selected page dynamically */}
      <div className="content">
        <Routes>
          <Route path="/faculty" element={<Faculty />} />
          <Route path="/subjects" element={<SubjectTable />} />
          <Route path="/addSubjects" element={<Subjects />} />
          <Route path="/addLab" element={<AddLab />} />
          <Route path="/sfmap" element={<FacultySubject />} />
          <Route path="/display" element={<Display />} />
          <Route path="/addFaculty" element={<AFaculty />} />
          <Route path="/addElective" element={<AddElective />} />
          <Route path="/displayElective" element={<DisplayElectives />} />
          <Route path="/viewMapping" element={<ViewMappings />} />
          <Route path="/editTimetable" element={<EditTimetable />} />
          <Route path="/displayFaculty" element={<FacultyDashboard />} />
          <Route path="/labTimetable" element={<LabTimetable />} />
          <Route path="/" element={<div>
            <h1>Welcome to Admin Dashboard</h1>
            <p>Here you can manage faculty, subjects, and electives.</p>
          </div>} />
        </Routes>
      </div>
    </div>
  );
};

export default AdminDashboard;
