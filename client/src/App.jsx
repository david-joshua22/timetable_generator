import Header from "./pages/Header";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import AdminDashboard from "./pages/AdminLogin"; // This is actually the Admin Dashboard
import ProtectedRoute from "./context/ProtectedRoute";
import Home from "./pages/Home";
import Login from "./pages/Login";
import About from "./pages/About";
import Footer from "./pages/Footer";
import Faculty from "./pages/Faculty";
import AFaculty from "./pages/AFaculty";
import FacultySubject from "./pages/FacultySubject";
import SubjectTable from "./pages/SubjectTable";
import Subjects from "./pages/Subjects";
import Display from "./pages/Display";
import FacultyDashboard from "./pages/FacultyDashboard";
import StudentLogin from "./pages/StudentLogin";
import AddElective from "./pages/AddElective";
import ViewMappings from "./pages/ViewMappings";
import "../node_modules/bootstrap/dist/css/bootstrap.min.css";

function App() {
  return (
    <BrowserRouter>
      <MainContent />
    </BrowserRouter>
  );
}

function MainContent() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");

  return (
    <div className="rbody">
      {/* Show Header only if NOT on admin pages */}
      {!isAdminRoute && <Header />}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute roles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/sfmap"
          element={
            <ProtectedRoute roles={["admin"]}>
              <FacultySubject />
            </ProtectedRoute>
          }
        />
        <Route
          path="/subjects"
          element={
            <ProtectedRoute roles={["admin"]}>
              <SubjectTable />
            </ProtectedRoute>
          }
        />
        <Route
          path="/addFaculty"
          element={
            <ProtectedRoute roles={["admin"]}>
              <AFaculty />
            </ProtectedRoute>
          }
        />
        <Route
          path="/addSubjects"
          element={
            <ProtectedRoute roles={["admin"]}>
              <Subjects />
            </ProtectedRoute>
          }
        />
        <Route
          path="/faculty"
          element={
            <ProtectedRoute roles={["admin"]}>
              <Faculty />
            </ProtectedRoute>
          }
        />
        <Route
          path="/display"
          element={
            <ProtectedRoute roles={["admin"]}>
              <Display />
            </ProtectedRoute>
          }
        />
        <Route
          path="/addElective"
          element={
            <ProtectedRoute roles={["admin"]}>
                <AddElective/>
            </ProtectedRoute>
          }
        />
        <Route
          path="/viewMapping"
          element={
            <ProtectedRoute roles={["admin"]}>
                <ViewMappings/>
            </ProtectedRoute>
          }
        />
        <Route
          path="/student"
          element={
            <ProtectedRoute roles={["admin", "student"]}>
              <StudentLogin />
            </ProtectedRoute>
          }
        />
        <Route
          path="/displayFaculty"
          element={
            <ProtectedRoute roles={["admin", "faculty"]}>
              <FacultyDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>

      {/* Show Footer only on Home Page */}
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