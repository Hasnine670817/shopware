import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Swal from 'sweetalert2'
import { useAdminAuth } from '../context/AdminAuthContext'

const AdminLoginPage = () => {
  const navigate = useNavigate()
  const { adminLogin, adminCredentialsHint } = useAdminAuth()
  const [formData, setFormData] = useState({ email: '', password: '' })

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const result = adminLogin(formData)

    if (!result.ok) {
      await Swal.fire({
        icon: 'error',
        title: 'Admin login failed',
        text: result.message,
        confirmButtonColor: '#323232',
      })
      return
    }

    await Swal.fire({
      icon: 'success',
      title: 'Welcome Admin',
      confirmButtonColor: '#323232',
    })
    navigate('/admin')
  }

  return (
    <section className="bg-[#f5f5f5] py-12 md:py-16">
      <div className="container-custom">
        <div className="mx-auto w-full max-w-md rounded-2xl bg-white p-6 shadow-sm md:p-8">
          <h1 className="text-2xl font-semibold text-neutral">Admin Login</h1>
          <p className="mt-2 text-sm text-neutral/60">
            Secure access to product management dashboard.
          </p>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="mb-2 block text-sm font-medium text-neutral/80">Admin Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="input input-bordered w-full border border-[#CBCBCB] px-4"
                placeholder="admin@shopware.com"
                required
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-neutral/80">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="input input-bordered w-full border border-[#CBCBCB] px-4"
                placeholder="Enter admin password"
                required
              />
            </div>
            <button
              type="submit"
              className="btn btn-neutral w-full bg-[#323232] text-white font-semibold shadow-none transition-all duration-300 hover:bg-[#323232]/90"
            >
              Login to Admin
            </button>
          </form>

          <p className="mt-4 text-xs text-neutral/50">
            Demo credentials: {adminCredentialsHint.email} / {adminCredentialsHint.password}
          </p>
          <Link to="/" className="mt-3 inline-block text-sm font-medium text-[#1363df] hover:underline">
            Back to Home
          </Link>
        </div>
      </div>
    </section>
  )
}

export default AdminLoginPage
