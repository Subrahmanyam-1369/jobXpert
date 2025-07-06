import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()

  const submit = async e => {
    e.preventDefault()
    const res = await fetch('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
    if (res.ok) {
      const data = await res.json()
      localStorage.setItem('jx_token', data.access_token)
      navigate('/')
    }
  }

  return (
    <div className='flex items-center justify-center min-h-screen bg-gray-900'>
      <motion.form
        onSubmit={submit}
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className='bg-gray-800 p-8 rounded w-full max-w-md flex flex-col gap-4'
      >
        <div className='flex flex-col md:flex-row gap-4'>
          <input
            className='p-2 rounded bg-gray-700 text-white flex-1'
            placeholder='Email'
            type='email'
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
          <input
            className='p-2 rounded bg-gray-700 text-white flex-1'
            placeholder='Password'
            type='password'
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
        </div>
        <button className='bg-blue-600 py-2 rounded'>Login</button>
        <Link to='/signup' className='text-sm text-center text-blue-400'>Sign up</Link>
      </motion.form>
    </div>
  )
}

export default Login

