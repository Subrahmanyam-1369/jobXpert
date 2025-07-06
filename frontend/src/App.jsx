import { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { motion } from 'framer-motion'
import './index.css'
import Login from './pages/Login'
import Signup from './pages/Signup'
import ProtectedRoute from './ProtectedRoute'

const Home = () => {
  const [ok, setOk] = useState(null)
  useEffect(() => {
    fetch('/health').then(r => setOk(r.ok)).catch(() => setOk(false))
  }, [])
  return (
    <div className='flex items-center justify-center min-h-screen bg-gray-900'>
      <motion.div
        className={`rounded-full w-16 h-16 ${ok === null ? 'bg-gray-700' : ok ? 'bg-green-500' : 'bg-red-500'}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      />
    </div>
  )
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path='/login' element={<Login />} />
        <Route path='/signup' element={<Signup />} />
        <Route path='/' element={<ProtectedRoute><Home /></ProtectedRoute>} />
      </Routes>
    </Router>
  )
}

export default App

