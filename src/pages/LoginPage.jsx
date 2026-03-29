import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'
import { useAuth } from '../context/AuthContext'
import { useAdminAuth } from '../context/AdminAuthContext'

const LoginPage = () => {
  const navigate = useNavigate()
  const { login } = useAuth()
  const { adminLogin } = useAdminAuth()
  const [formData, setFormData] = useState({ email: '', password: '' })

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    // Try admin login first (checks role = 'admin' in Supabase)
    const adminResult = await adminLogin(formData)

    if (adminResult.ok) {
      await Swal.fire({
        icon: 'success',
        title: 'Welcome Admin!',
        text: 'Redirecting to Admin Panel...',
        confirmButtonColor: '#323232',
      })
      navigate('/admin')
      return
    }

    // Try regular user login
    const result = await login(formData)

    if (!result.ok) {
      await Swal.fire({
        icon: 'error',
        title: 'Login failed',
        text: result.message,
        confirmButtonColor: '#323232',
      })
      return
    }

    await Swal.fire({
      icon: 'success',
      title: 'Login successful!',
      text: `Welcome back, ${result.user.fullName}!`,
      confirmButtonColor: '#323232',
    })

    navigate('/')
  }

  return (
    <section className="bg-[#f5f5f5] py-12 md:py-16">
      <div className="container-custom">
        <div className="mx-auto w-full max-w-md rounded-2xl bg-white p-6 shadow-sm md:p-8">
          <h1 className="text-2xl font-semibold text-neutral">Login</h1>
          <p className="mt-2 text-sm text-neutral/60">Welcome back! Please sign in to your account.</p>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="mb-2 block text-sm font-medium text-neutral/80">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="input input-bordered w-full px-4 border border-[#CBCBCB]"
                placeholder="you@example.com"
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
                className="input input-bordered w-full px-4 border border-[#CBCBCB]"
                placeholder="••••••••"
                required
              />
            </div>
            <button
              type="submit"
              className="btn btn-neutral w-full bg-[#323232] text-white shadow-none font-semibold hover:bg-[#323232]/90 transition-all duration-300"
            >
              Sign In
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-neutral/70">
            Don&apos;t have an account?{' '}
            <Link to="/signup" className="font-medium text-neutral underline underline-offset-2">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </section>
  )
}

export default LoginPage
