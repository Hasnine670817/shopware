import { Navigate } from 'react-router-dom'
import { useAdminAuth } from '../context/AdminAuthContext'

const ProtectedAdminRoute = ({ children }) => {
  const { isAdminAuthenticated } = useAdminAuth()

  if (!isAdminAuthenticated) {
    return <Navigate to="/" replace />
  }

  return children
}

export default ProtectedAdminRoute
