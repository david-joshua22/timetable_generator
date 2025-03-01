import { useContext } from "react";
import { NavLink, Routes, Route, useNavigate } from "react-router-dom";
import { FiLogOut } from "react-icons/fi";
import {FaUserPlus,FaBook,FaMapMarkedAlt,FaClipboard,FaEye} from "react-icons/fa";
import "../styles/AdminLogin.css";
import { userContext } from "../context/UserContext";
import Faculty from "./Faculty";
import Subjects from "./Subjects";
import SubjectTable from "./SubjectTable";
import FacultySubject from "./FacultySubject";
import AFaculty from "./AFaculty";
import AddElective from "./AddElective";
import ViewMappings from "./ViewMappings";
import Display from "./Display";

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
      <div className="sidebar">
        <h1 className="sidebar-title">Welcome Admin!</h1>

        <nav className="menu">
          {/* Add 'end' to prevent highlighting on subroutes */}
          
           Main Menu
          

          <NavLink to="/admin/faculty" className={({ isActive }) => isActive ? "menu-item active" : "menu-item"}>
            <FaUserPlus className="icon" /> Add Faculty
          </NavLink>

          <NavLink to="/admin/subjects" className={({ isActive }) => isActive ? "menu-item active" : "menu-item"}>
            <FaBook className="icon" /> Add Subjects
          </NavLink>

          <NavLink to="/admin/addElective" className={({ isActive }) => isActive ? "menu-item active" : "menu-item"}>
            <FaClipboard className="icon" /> Add Electives
          </NavLink>

          <NavLink to="/admin/sfmap" className={({ isActive }) => isActive ? "menu-item active" : "menu-item"}>
            <FaMapMarkedAlt className="icon" /> Map Faculty-Subject
          </NavLink>

          <NavLink to="/admin/viewMapping" className={({ isActive }) => isActive ? "menu-item active" : "menu-item"}>
            <FaEye className="icon" /> Generate Timetable
          </NavLink>

          <NavLink to="/admin/display" className={({ isActive }) => isActive ? "menu-item active" : "menu-item"}>
            <FaEye className="icon" /> View Timetable
          </NavLink>

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
          <Route path="/sfmap" element={<FacultySubject />} />
          <Route path="/display" element={<Display />} />
          <Route path="/addFaculty" element={<AFaculty />} />
          <Route path="/addElective" element={<AddElective />} />
          <Route path="/viewMapping" element={<ViewMappings />} />
          <Route path="/" element={<h3>Welcome to the Admin Dashboard!</h3>} />
        </Routes>
      </div>
    </div>
  );
};

export default AdminDashboard;
