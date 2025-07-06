import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import './index.css'

function App() {
  const [ok, setOk] = useState(null)
  useEffect(() => {
    fetch('/health').then(r => setOk(r.ok)).catch(() => setOk(false))
  }, [])
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <motion.div
        className={`rounded-full w-16 h-16 ${ok === null ? 'bg-gray-700' : ok ? 'bg-green-500' : 'bg-red-500'}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      />
    </div>
  )
}

export default App
