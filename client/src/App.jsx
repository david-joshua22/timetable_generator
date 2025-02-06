import Header from "./pages/Header";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Faculty from "./pages/Faculty";
import Home from "./pages/Home";
import AFaculty from "./pages/AFaculty";
import FacultySubject from "./pages/FacultySubject";
import SubjectTable from "./pages/SubjectTable";
import Subjects from "./pages/Subjects";
import Login from "./pages/Login"; 
import About from "./pages/About";
import Footer from "./pages/Footer";
import UpdateFaculty from "./pages/UpdateFaculty";
import UpdateSubject from "./pages/UpdateSubject";
import AdminLogin from "./pages/AdminLogin";
import ProtectedRoute from "./context/ProtectedRoute";

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
        <Route path="/display"Login element={
            <ProtectedRoute roles = {['admin']}>
              <AdminLogin />
          </ProtectedRoute>
          } ></Route>
        <Route path="/sfmap" element={<FacultySubject />} />
        <Route path="/subjects" element={<SubjectTable />} />
        <Route path="/addSubjects" element={<Subjects />} />
        <Route path="/faculty"Login element={
            <ProtectedRoute roles = {['student']}>
              <Faculty />
          </ProtectedRoute>
          } ></Route>
        <Route path="/addFaculty" element={<AFaculty />} />
        <Route path="/updateFaculty/:id" element={<UpdateFaculty />} />
        <Route path="/updateSubject/:id" element={<UpdateSubject />} />
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