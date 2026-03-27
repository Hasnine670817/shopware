import {
  FaFacebookF,
  FaInstagram,
  FaPinterestP,
  FaTiktok,
  FaXTwitter,
  FaYoutube,
} from 'react-icons/fa6'
import { useState } from 'react'
import Swal from 'sweetalert2'
import { Link, useNavigate } from 'react-router-dom'
import { useAdminAuth } from '../context/AdminAuthContext'
import paymentLogosImage from '../assets/payment.png'

const servicesLinks = [
  'ThemeWare',
  'ThemeWare Service Portal',
  'ThemeWare Knowledge Base',
  'ThemeWare Manual',
  'Questions And Answers',
  'Bootstrap Examples',
]

const infoLeftLinks = [
  'Data Protection',
  'Contact',
  'Newsletter',
  'Shipping And Payment',
  'Revocation Instructions',
  'Imprint',
  'AGB',
]

const infoRightLinks = [
  'Free Shipping',
  'Shipping Within 24h',
  '30 Days Money Back Guarantee',
  'Purchase Comfortable On Account',
  'Buy Direct From The Manufacturer',
]

const socialIcons = [
  { name: 'Facebook', Icon: FaFacebookF },
  { name: 'Instagram', Icon: FaInstagram },
  { name: 'Pinterest', Icon: FaPinterestP },
  { name: 'YouTube', Icon: FaYoutube },
  { name: 'TikTok', Icon: FaTiktok },
  { name: 'X', Icon: FaXTwitter },
]
const toPath = (prefix, item) => `${prefix}/${item.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`

const Footer = () => {
  const navigate = useNavigate()
  const { adminLogin, adminCredentialsHint } = useAdminAuth()
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false)
  const [adminForm, setAdminForm] = useState({ email: '', password: '' })

  const handleAdminInput = (event) => {
    const { name, value } = event.target
    setAdminForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleAdminSubmit = async (event) => {
    event.preventDefault()
    const result = adminLogin(adminForm)

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
    setIsAdminModalOpen(false)
    setAdminForm({ email: '', password: '' })
    navigate('/admin')
  }

  return (
    <>
    <footer className="mt-0 bg-[#1f1f22] text-white">
      <div className="container-custom py-14 md:py-16">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-[0.08em] text-white">Services</h4>
            <ul className="space-y-2">
              {servicesLinks.map((item) => (
                <li key={item}>
                  <Link to={toPath('/services', item)} className="text-xs text-white/75 underline-offset-2 transition hover:text-white hover:underline md:text-[13px]">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-[0.08em] text-white">Information</h4>
            <ul className="space-y-2">
              {infoLeftLinks.map((item) => (
                <li key={item}>
                  <Link to={toPath('/information', item)} className="text-xs text-white/75 transition hover:text-white md:text-[13px]">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-[0.08em] text-white">Information</h4>
            <ul className="space-y-2">
              {infoRightLinks.map((item) => (
                <li key={item}>
                  <Link to={toPath('/information', item)} className="text-xs text-white/75 transition hover:text-white md:text-[13px]">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-[0.08em] text-white">Newsletter Sign Up</h4>
            <p className="mb-4 max-w-sm text-xs text-white/75 md:text-[13px]">
              Sign up for exclusive updates, new arrivals & insider only discounts
            </p>

            <div className="mb-5 flex flex-wrap w-full max-w-sm gap-2">
              <input
                type="email"
                placeholder="enter your email address"
                className="h-11 flex-1 border border-white/35 bg-transparent px-3 text-xs text-white outline-none placeholder:text-white/45 focus:border-white/60 md:text-[13px]"
              />
              <button className="h-11 min-w-[110px] bg-white px-4 text-xs font-semibold uppercase tracking-[0.08em] text-[#1f1f22] transition hover:bg-white/90 md:text-[13px]">
                Submit
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {socialIcons.map((item) => (
                <button
                  key={item.name}
                  className="grid h-8 w-8 place-items-center rounded-full bg-white text-[14px] text-[#1f1f22] transition hover:scale-105"
                  aria-label={`${item.name} social icon`}
                >
                  <item.Icon />
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-6 md:mt-12">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <p className="text-xs text-white/70 md:text-[15px] leading-[1.5]">
              © 2024, Brinase Theme. All Rights Reserved. Themes By BrainStreamtechnolaps PVT.LTD.
            </p>

            <div className="flex flex-wrap items-center gap-2 md:gap-3">
              <img src={paymentLogosImage} alt="Payment Logos" className="" />
            </div>
          </div>
          <div className="mt-4 border-t border-white/10 pt-4 text-right">
            <button
              className="text-xs text-white/70 underline underline-offset-2 transition hover:text-white"
              onClick={() => setIsAdminModalOpen(true)}
            >
              Admin Access
            </button>
          </div>
        </div>
      </div>
    </footer>
      <div
        className={`fixed inset-0 z-[70] transition ${isAdminModalOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}
        aria-hidden={!isAdminModalOpen}
      >
        <button
          className={`absolute inset-0 bg-black/45 transition-opacity duration-300 ${
            isAdminModalOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={() => setIsAdminModalOpen(false)}
          aria-label="Close admin modal overlay"
        />
        <div className="absolute inset-0 grid place-items-center px-4">
          <article
            className={`w-full max-w-md rounded-2xl bg-white p-6 shadow-premium transition duration-300 md:p-8 ${
              isAdminModalOpen ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
            }`}
          >
            <h3 className="text-xl font-semibold text-neutral">Admin Login</h3>
            <p className="mt-2 text-sm text-neutral/60">
              Restricted area for product management.
            </p>

            <form className="mt-5 space-y-4" onSubmit={handleAdminSubmit}>
              <div>
                <label className="mb-2 block text-sm font-medium text-neutral/80">Admin Email</label>
                <input
                  name="email"
                  type="email"
                  value={adminForm.email}
                  onChange={handleAdminInput}
                  className="input input-bordered w-full border border-[#CBCBCB] px-4"
                  placeholder="admin@shopware.com"
                  required
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-neutral/80">Password</label>
                <input
                  name="password"
                  type="password"
                  value={adminForm.password}
                  onChange={handleAdminInput}
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
            <p className="mt-3 text-xs text-neutral/50">
              Demo credentials: {adminCredentialsHint.email} / {adminCredentialsHint.password}
            </p>
          </article>
        </div>
      </div>
    </>
  )
}

export default Footer
