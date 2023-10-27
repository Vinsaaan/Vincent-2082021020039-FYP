import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "./components/global.css";
import HomePage from "./pages/HomePage/HomePage";
import StudentOverview from "../src/pages/Overview/StudentOverview";
import LecturerOverview from "../src/pages/Overview/LecturerOverview";
import CompanyOverview from "../src/pages/Overview/CompanyOverview";
import Login from "./pages/Login/Login";
import SignUp from "./pages/SignUp/SignUp";
import ResetPassword from "./pages/ResetPassword/ResetPassword";

import LecturerDashboard from "./pages/Lecturer/LecturerDashboard/LecturerDashboard";
import LecturerViewStudent from "./pages/Lecturer/LecturerViewStudent/LecturerViewStudent";
import LecturerAccount from "./pages/Lecturer/LecturerAccount/LecturerAccount";
import LecturerManageQuiz from "./pages/Lecturer/LecturerManageQuiz/LecturerManageQuiz";
import LecturerCreateQuiz from "./pages/Lecturer/LecturerManageQuiz/SubPages/CreateQuiz";
import LecturerEditQuiz from "./pages/Lecturer/LecturerManageQuiz/SubPages/EditQuiz";
import LecturerViewScore from "./pages/Lecturer/LecturerManageQuiz/SubPages/ViewScore";
import LecturerViewAnswer from "./pages/Lecturer/LecturerManageQuiz/SubPages/ViewAnswer/ViewAnswer";

import StudentDashboard from "./pages/Student/StudentDashboard/StudentDashboard";
import StudentAccount from "./pages/Student/StudentAccount/StudentAccount";
import StudentQuizRoom from "./pages/Student/StudentQuizRoom/StudentQuizRoom";
import StudentViewResult from "./pages/Student/StudentViewResult/StudentViewResult";
import StudentApplyJob from "./pages/Student/StudentViewJob/StudentApplyJob/StudentApplyJob";
import StudentJobStatus from "./pages/Student/StudentViewJob/StudentJobStatus/StudentJobStatus";
import StudentApplyForm from "./pages/Student/StudentViewJob/StudentApplyJob/StudentApplyForm/StudentApplyForm";

import CompanyDashboard from "./pages/Company/CompanyDashboard/CompanyDashboard";
import CompanyManageJob from "./pages/Company/CompanyManageJob/CompanyManageJob";
import CompanyViewStudent from "./pages/Company/CompanyViewStudent/CompanyViewStudent";
import CompanyAccount from "./pages/Company/CompanyAccount/CompanyAccount";
import CompanyCreateJob from "./pages/Company/CompanyManageJob/SubPages/CreateJob";
import CompanyEditJob from "./pages/Company/CompanyManageJob/SubPages/EditJob";
import CompanyViewJob from "./pages/Company/CompanyManageJob/SubPages/ViewJob";
import ApplicantDetail from "./pages/Company/CompanyManageJob/SubPages/ApplicantDetail";

function App() {
  return (
    <Router>
      <Routes>
        {/*Index*/}
        <Route path="/" element={<HomePage />} />
        <Route path="/student-overview" element={<StudentOverview />} />
        <Route path="/lecturer-overview" element={<LecturerOverview />} />
        <Route path="/company-overview" element={<CompanyOverview />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/forgot-password" element={<ResetPassword />} />

        {/*Lecturer*/}
        <Route path="/lecturer-dashboard" element={<LecturerDashboard />} />
        <Route path="/view-student" element={<LecturerViewStudent />} />
        <Route path="/lecturer-account" element={<LecturerAccount />} />
        <Route path="/manage-quiz" element={<LecturerManageQuiz />} />
        <Route path="/create-quiz" element={<LecturerCreateQuiz />} />
        <Route path="edit-quiz/:quizId" element={<LecturerEditQuiz />} />
        <Route path="/view-answer" element={<LecturerViewScore />} />
        <Route path="/view-score/:quizId" element={<LecturerViewScore />} />
        <Route
          path="/view-answer/:quizId/:studentId"
          element={<LecturerViewAnswer />}
        />

        {/*Student*/}
        <Route path="/student-dashboard" element={<StudentDashboard />} />
        <Route path="/student-account" element={<StudentAccount />} />
        <Route path="/quiz-room/:quizCode" element={<StudentQuizRoom />} />
        <Route path="/view-result" element={<StudentViewResult />} />
        <Route path="/apply-job" element={<StudentApplyJob />} />
        <Route path="/application-status" element={<StudentJobStatus />} />
        <Route path="/apply-form/:jobId" element={<StudentApplyForm />} />

        {/*Company*/}
        <Route path="/company-dashboard" element={<CompanyDashboard />} />
        <Route path="/manage-job" element={<CompanyManageJob />} />
        <Route path="/view-pending" element={<CompanyViewStudent />} />
        <Route path="/company-account" element={<CompanyAccount />} />
        <Route path="/create-job" element={<CompanyCreateJob />} />
        <Route path="edit-job/:jobId" element={<CompanyEditJob />} />
        <Route path="/view-job/:jobId" element={<CompanyViewJob />} />
        <Route
          path="/applicant-detail/:applicationId"
          element={<ApplicantDetail />}
        />
      </Routes>
    </Router>
  );
}

export default App;
