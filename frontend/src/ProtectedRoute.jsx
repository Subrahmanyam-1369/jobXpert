import { Navigate } from 'react-router-dom'
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('jx_token')
  if (!token) return <Navigate to='/login' replace />
  return children
}
export default ProtectedRoute
