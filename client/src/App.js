import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
import MyTimePickerComponent from "./components/Clock.jsx";
import ProtectedRoute from "./ProtectedRoute.jsx";
function App() {
    return (_jsx(ThemeProvider, { children: _jsxs(Router, { children: [_jsx(Toaster, { position: "top-right" }), _jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(Home, {}) }), _jsx(Route, { path: "/signin", element: _jsx(SignIn, {}) }), _jsx(Route, { path: "/signup", element: _jsx(SignUpForm, {}) }), _jsx(Route, { path: "/clock", element: _jsx(MyTimePickerComponent, {}) }), _jsx(Route, { path: "/user", element: _jsx(UsersList, {}) }), _jsx(Route, { path: "/userList", element: _jsx(MainComponent, {}) }), _jsx(Route, { element: _jsx(ProtectedRoute, { requiredRole: "executive" }), children: _jsxs(Route, { path: "/executive", element: _jsx(ExecutiveLayout, {}), children: [_jsx(Route, { index: true, element: _jsx(Dashboard, {}) }), _jsx(Route, { path: "dashboard", element: _jsx(Dashboard, {}) }), _jsx(Route, { path: "schedule", element: _jsx(Schedule, {}) }), _jsx(Route, { path: "meetings", element: _jsx(Meetings, {}) }), _jsx(Route, { path: "engagements", element: _jsx(Engagements, {}) }), _jsx(Route, { path: "reports", element: _jsx(Reports, {}) })] }) }), _jsx(Route, { element: _jsx(ProtectedRoute, { requiredRole: "secretary" }), children: _jsxs(Route, { path: "/secretary", element: _jsx(SecretaryLayout, {}), children: [_jsx(Route, { index: true, element: _jsx(SecretaryDashboard, {}) }), _jsx(Route, { path: "dashboard", element: _jsx(SecretaryDashboard, {}) }), _jsx(Route, { path: "schedule-meeting", element: _jsx(ScheduleMeeting, {}) }), _jsx(Route, { path: "rearrange", element: _jsx(RearrangeAppointments, {}) }), _jsx(Route, { path: "reports", element: _jsx(SecretaryReports, {}) }), _jsx(Route, { path: "notifications", element: _jsx(Notifications, {}) })] }) })] })] }) }));
}
export default App;
