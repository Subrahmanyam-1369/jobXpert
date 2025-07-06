import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './index.css'
import Login from './pages/Login'
import Signup from './pages/Signup'
import JobsPage from './pages/JobsPage'
import Dashboard from './pages/Dashboard'
import ProtectedRoute from './ProtectedRoute'

function App() {
  return (
    <Router>
      <Routes>
        <Route path='/login' element={<Login />} />
        <Route path='/signup' element={<Signup />} />
        <Route path='/' element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path='/jobs' element={<ProtectedRoute><JobsPage /></ProtectedRoute>} />
      </Routes>
    </Router>
  )
}

export default App
