import Header from "./pages/Header";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Faculty from "./pages/Faculty";
import Home from "./pages/Home";
import AFaculty from "./pages/AFaculty";
import FacultySubject from "./pages/FacultySubject";
import SubjectTable from "./pages/SubjectTable";
import Subjects from "./pages/Subjects";
import AddElective from "./pages/AddElective";
import Login from "./pages/Login"; 
import About from "./pages/About";
import Footer from "./pages/Footer";
import UpdateSubject from "./pages/UpdateSubject";
import AdminLogin from "./pages/AdminLogin";
import StudentLogin from "./pages/StudentLogin";
import FacultyDashboard from "./pages/FacultyDashboard"
import ProtectedRoute from "./context/ProtectedRoute";
import Display from "./pages/Display";
import ViewMappings from "./pages/ViewMappings";

import '../node_modules/bootstrap/dist/css/bootstrap.min.css';

function App() {
  return (
    <BrowserRouter>
      <Header />
      <MainContent />
    </BrowserRouter>
  );
}

function MainContent() {
  const location = useLocation(); 

  return (
    <div className="rbody">
      <Routes>
        <Route path="/" element={<Home />} /> 
        <Route path="/Login"Login element={<Login />} />
        <Route path="/admin"Login element={
            <ProtectedRoute roles = {['admin']}>
              <AdminLogin />
          </ProtectedRoute>
          } ></Route>
          <Route path="/updateSubject/:id"Login element={
            <ProtectedRoute roles = {['admin']}>
              <UpdateSubject />
          </ProtectedRoute>
          } ></Route>
          <Route path="/sfmap"Login element={
            <ProtectedRoute roles = {['admin']}>
              <FacultySubject />
          </ProtectedRoute>
          } ></Route>
          <Route path="/viewMapping"Login element={
            <ProtectedRoute roles = {['admin']}>
              <ViewMappings/>
          </ProtectedRoute>
          } ></Route>
          <Route path="/subjects"Login element={
            <ProtectedRoute roles = {['admin']}>
              <SubjectTable />
          </ProtectedRoute>
          } ></Route>
          <Route path="/addFaculty"Login element={
            <ProtectedRoute roles = {['admin']}>
              <AFaculty />
          </ProtectedRoute>
          } ></Route>
          <Route path="/addSubjects"Login element={
            <ProtectedRoute roles = {['admin']}>
              <Subjects />
          </ProtectedRoute>
          } ></Route>
          <Route path="/addElective"Login element={
            <ProtectedRoute roles = {['admin']}>
              <AddElective />
          </ProtectedRoute>
          } ></Route>
        <Route path="/faculty"Login element={
            <ProtectedRoute roles = {['admin']}>
              <Faculty />
          </ProtectedRoute>} ></Route>
          <Route path="/display"Login element={
            <ProtectedRoute roles = {['admin']}>
              <Display />
          </ProtectedRoute>} ></Route>
          <Route path="/student"Login element={
            <ProtectedRoute roles = {['admin','student']}>
              <StudentLogin/>
          </ProtectedRoute>} ></Route>
          <Route path="/displayFaculty"Login element={
            <ProtectedRoute roles = {['admin','faculty']}>
              <FacultyDashboard/>
          </ProtectedRoute>} ></Route>
      </Routes>

      {location.pathname === "/" && (
        <>
          <About />
          <Footer />
        </>
      )}
    </div>
  );
}

export default App;