import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import { Toaster } from "react-hot-toast";

// Auth + Common Pages
import SignIn from "./components/auth/SigninPage.jsx";
import SignUpForm from "./components/auth/SignUp.jsx";
import Home from "./components/HomePage.jsx";

// Executive Pages
// import ExecutiveLayout from "./components/Executive/";
import Schedule from "./components/Executive/Schedule.jsx";
import Meetings from "./components/Executive/Meetings.jsx";
import Engagements from "./components/Executive/Engagements.jsx";
import Reports from "./components/Executive/Reports.jsx";

// Secretary Pages
import SecretaryLayout from "./components/Secretary/SecretaryLayout.jsx";
import SecretaryDashboard from "./components/Secretary/SecretaryDashboard.jsx";
import ScheduleMeeting from "./components/Secretary/ScheduleMeeting.jsx";
import RearrangeAppointments from "./components/Secretary/RearrangeAppointments.jsx";
import SecretaryReports from "./components/Secretary/Reports.jsx";
import Notifications from "./components/Secretary/Notifications.jsx";

// User Pages
import UsersList from "./components/Profile/User.jsx";
import MainComponent from "./components/Dashbord/DashBoard.jsx";

import "./App.css";
import Dashboard from "./components/Executive/Dashboard.jsx";
import ExecutiveLayout from "./components/Executive/Layout.jsx";

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Toaster position="top-right" />
        <Routes>
          {/* 🔐 Public / Auth Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUpForm />} />

          {/* 👤 User Routes */}
          <Route path="/user" element={<UsersList />} />
          <Route path="/userList" element={<MainComponent />} />

          {/* 🧑 Executive Routes (nested under layout) */}
          <Route path="/executive" element={<ExecutiveLayout />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="schedule" element={<Schedule />} />
            <Route path="meetings" element={<Meetings />} />
            <Route path="engagements" element={<Engagements />} />
            <Route path="reports" element={<Reports />} />
          </Route>

          {/* 🧭 Secretary Routes (nested under layout) */}
          <Route path="/secretary" element={<SecretaryLayout />}>
            <Route path="dashboard" element={<SecretaryDashboard />} />
            <Route path="schedule-meeting" element={<ScheduleMeeting />} />
            <Route path="rearrange" element={<RearrangeAppointments />} />
            <Route path="reports" element={<SecretaryReports />} />
            <Route path="notifications" element={<Notifications />} />
          </Route>
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
