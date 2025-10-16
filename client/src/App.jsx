import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from "./context/ThemeContext.jsx"
import SignIn from "./components/auth/SigninPage.jsx"
import Home from './components/HomePage.jsx'
import './App.css'
import SignUpForm from './components/auth/SignUp.jsx'
import { Toaster } from "react-hot-toast";
import UsersList from './components/Profile/User.jsx'

function App() {



  
  return (
    <ThemeProvider>
      <Router>
              <Toaster position="top-right" />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUpForm />} />
    <Route path="/user" element={<UsersList />} />
        </Routes>
      </Router>
    </ThemeProvider>
  )
}

export default App
