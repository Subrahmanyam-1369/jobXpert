import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import UploadResume from '../components/UploadResume'

const Dashboard = () => {
  const [resumes, setResumes] = useState([])
  const token = localStorage.getItem('jx_token')

  const fetchResumes = async () => {
    const res = await fetch('/resumes', { headers: { Authorization: `Bearer ${token}` } })
    if (res.ok) setResumes(await res.json())
  }

  useEffect(() => { fetchResumes() }, [])

  const addResume = r => setResumes(prev => [r, ...prev])

  return (
    <div className='min-h-screen bg-gray-900 p-8 flex flex-col gap-8'>
      <UploadResume onUploaded={addResume} />
      <div className='grid md:grid-cols-3 gap-4'>
        {resumes.map(r => (
          <motion.div key={r.id} whileHover={{ scale: 1.05 }} className='bg-gray-800 p-4 rounded'>
            <p className='break-all'>{r.path}</p>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export default Dashboard
