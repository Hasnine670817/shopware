import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'
import { useAuth } from '../context/AuthContext'

const SignupPage = () => {
  const navigate = useNavigate()
  const { signup } = useAuth()
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
  })

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const result = await signup(formData)

    if (!result.ok) {
      await Swal.fire({
        icon: 'error',
        title: 'Signup failed',
        text: result.message,
        confirmButtonColor: '#323232',
      })
      return
    }

    await Swal.fire({
      icon: 'success',
      title: 'Signup successful!',
      text: `Welcome ${result.user.fullName}! Your account is now active.`,
      confirmButtonColor: '#323232',
    })
    navigate('/dashboard')
  }

  return (
    <section className="bg-[#f5f5f5] py-12 md:py-16">
      <div className="container-custom">
        <div className="mx-auto w-full max-w-md rounded-2xl bg-white p-6 shadow-sm md:p-8">
          <h1 className="text-2xl font-semibold text-neutral">Create Account</h1>
          <p className="mt-2 text-sm text-neutral/60">Join Shopware and start shopping premium collections.</p>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="mb-2 block text-sm font-medium text-neutral/80">Full Name</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className="input input-bordered w-full px-4 border border-[#CBCBCB]"
                placeholder="Your name"
                required
              />
            </div>
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
                placeholder="Create a password"
                minLength={6}
                required
              />
            </div>
            <button type="submit" className="btn btn-neutral w-full bg-[#323232] text-white shadow-none font-semibold hover:bg-[#323232]/90 transition-all duration-300">
              Sign Up
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-neutral/70">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-neutral underline underline-offset-2">
              Login
            </Link>
          </p>
        </div>
      </div>
    </section>
  )
}

export default SignupPage
