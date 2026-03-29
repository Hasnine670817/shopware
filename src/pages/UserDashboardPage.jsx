import { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { supabase } from '../lib/supabase'
import { RiArrowRightSLine } from 'react-icons/ri'
import { FaCartArrowDown } from 'react-icons/fa6'
import { FiCamera, FiEdit2, FiUpload, FiX } from 'react-icons/fi'

const formatPrice = (price) => `$${Number(price).toFixed(2)}`
const formatDate = (date) =>
  new Date(date).toLocaleDateString(undefined, {
    month: 'numeric',
    day: 'numeric',
    year: 'numeric',
  })

/* ── Edit Profile Modal ── */
const EditProfileModal = ({ currentUser, updateProfile, onClose }) => {
  const [fullName, setFullName]       = useState(currentUser?.fullName || '')
  const [avatarUrl, setAvatarUrl]     = useState(currentUser?.avatarUrl || '')
  const [selectedFile, setSelectedFile] = useState(null)
  const [filePreview, setFilePreview]   = useState(null)
  const [urlError, setUrlError]         = useState(false)
  const [saving, setSaving]             = useState(false)
  const [uploadProgress, setUploadProgress] = useState('')
  const fileInputRef = useRef(null)

  // Determine what to show in the avatar preview
  const previewSrc = filePreview || (avatarUrl && !urlError ? avatarUrl : null)

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      Swal.fire({ icon: 'error', title: 'Invalid file', text: 'Please select an image file (JPG, PNG, WEBP…)', confirmButtonColor: '#323232' })
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      Swal.fire({ icon: 'error', title: 'File too large', text: 'Maximum allowed size is 5 MB.', confirmButtonColor: '#323232' })
      return
    }
    setSelectedFile(file)
    setAvatarUrl('')   // clear URL field when file is chosen
    setUrlError(false)
    const reader = new FileReader()
    reader.onload = (ev) => setFilePreview(ev.target.result)
    reader.readAsDataURL(file)
  }

  const clearFile = () => {
    setSelectedFile(null)
    setFilePreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const uploadToStorage = async (file) => {
    const ext      = file.name.split('.').pop().toLowerCase()
    const fileName = `${currentUser.id}.${ext}`
    setUploadProgress('Uploading image…')
    const { error } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, { upsert: true, contentType: file.type })
    if (error) throw new Error(error.message)
    const { data } = supabase.storage.from('avatars').getPublicUrl(fileName)
    // Bust cache so updated image shows immediately
    return `${data.publicUrl}?t=${Date.now()}`
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!fullName.trim()) {
      await Swal.fire({ icon: 'warning', title: 'Name is required', confirmButtonColor: '#323232' })
      return
    }
    setSaving(true)
    try {
      let finalAvatarUrl = avatarUrl || currentUser?.avatarUrl || ''
      if (selectedFile) {
        finalAvatarUrl = await uploadToStorage(selectedFile)
      }
      setUploadProgress('Saving profile…')
      const result = await updateProfile({ fullName, avatarUrl: finalAvatarUrl })
      if (!result.ok) {
        await Swal.fire({ icon: 'error', title: 'Update failed', text: result.message, confirmButtonColor: '#323232' })
        return
      }
      await Swal.fire({ icon: 'success', title: 'Profile updated!', timer: 1200, showConfirmButton: false })
      onClose()
    } catch (err) {
      console.error(err)
      await Swal.fire({ icon: 'error', title: 'Upload failed', text: err.message || 'Please try again.', confirmButtonColor: '#323232' })
    } finally {
      setSaving(false)
      setUploadProgress('')
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#eceff3] px-6 py-4">
          <h3 className="text-base font-semibold text-[#1b2940]">Edit Profile</h3>
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-lg text-[#9ca3af] transition hover:bg-[#f3f4f6] hover:text-[#374151]">
            <FiX />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-5 overflow-y-auto p-6" style={{ maxHeight: 'calc(100vh - 120px)' }}>

          {/* Avatar + upload area */}
          <div className="flex flex-col items-center gap-3">
            {/* Clickable avatar */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="group relative h-24 w-24 overflow-hidden rounded-full border-2 border-dashed border-[#d1d5db] bg-[#f3f4f6] transition hover:border-[#1b2940]"
              title="Click to upload photo"
            >
              {previewSrc ? (
                <img src={previewSrc} alt="Preview" className="h-full w-full object-cover"
                  onError={() => { setUrlError(true) }} />
              ) : (
                <span className="grid h-full w-full place-items-center text-3xl font-semibold text-[#1b2940]">
                  {(fullName || currentUser?.fullName || 'U').slice(0, 1)}
                </span>
              )}
              {/* Hover overlay */}
              <span className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/40 opacity-0 transition group-hover:opacity-100">
                <FiCamera className="text-xl text-white" />
                <span className="text-[10px] font-semibold text-white">Change</span>
              </span>
            </button>

            {/* Selected file badge */}
            {selectedFile && (
              <div className="flex items-center gap-2 rounded-full border border-[#e5e7eb] bg-[#f9fafb] px-3 py-1 text-xs text-[#374151]">
                <FiUpload className="text-[#f08a2f]" />
                <span className="max-w-[160px] truncate">{selectedFile.name}</span>
                <button type="button" onClick={clearFile} className="text-[#9ca3af] hover:text-red-500">
                  <FiX className="text-xs" />
                </button>
              </div>
            )}

            <p className="text-center text-xs text-[#8d97a7]">
              Click avatar to upload from device · or paste a URL below
            </p>
          </div>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />

          {/* Full Name */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#374151]">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full rounded-lg border border-[#d1d5db] px-3.5 py-2.5 text-sm text-[#1b2940] outline-none transition placeholder:text-[#9ca3af] focus:border-[#1b2940] focus:ring-2 focus:ring-[#1b2940]/10"
              placeholder="Your full name"
              required
            />
          </div>

          {/* Avatar URL (alternative) */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#374151]">
              Or paste image URL
            </label>
            <input
              type="url"
              value={avatarUrl}
              onChange={(e) => { setAvatarUrl(e.target.value); setUrlError(false); clearFile() }}
              className="w-full rounded-lg border border-[#d1d5db] px-3.5 py-2.5 text-sm text-[#1b2940] outline-none transition placeholder:text-[#9ca3af] focus:border-[#1b2940] focus:ring-2 focus:ring-[#1b2940]/10"
              placeholder="https://example.com/photo.jpg"
              disabled={Boolean(selectedFile)}
            />
            {avatarUrl && !urlError && !selectedFile && (
              <p className="mt-1 text-[11px] text-emerald-600">✓ URL looks valid</p>
            )}
            {avatarUrl && urlError && (
              <p className="mt-1 text-[11px] text-red-500">✗ Could not load this image URL</p>
            )}
          </div>

          {/* Email readonly */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#374151]">Email</label>
            <input
              type="email"
              value={currentUser?.email || ''}
              readOnly
              className="w-full rounded-lg border border-[#e5e7eb] bg-[#f9fafb] px-3.5 py-2.5 text-sm text-[#9ca3af] outline-none cursor-not-allowed"
            />
            <p className="mt-1 text-[11px] text-[#9ca3af]">Email cannot be changed</p>
          </div>

          {/* Progress text */}
          {uploadProgress && (
            <p className="flex items-center gap-2 text-sm text-[#6b7280]">
              <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#f08a2f] border-t-transparent" />
              {uploadProgress}
            </p>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-[#e5e7eb] py-2.5 text-sm font-semibold text-[#6b7280] transition hover:bg-[#f9fafb]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-lg bg-[#1b2940] py-2.5 text-sm font-semibold text-white transition hover:bg-[#243b5b] disabled:opacity-60"
            >
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ── Main Dashboard Page ── */
const UserDashboardPage = () => {
  const navigate = useNavigate()
  const { currentUser, isAuthenticated, logout, updateProfile } = useAuth()
  const { orderHistory } = useCart()
  const recentOrders = orderHistory.slice(0, 5)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  const handleLogout = async () => {
    const result = await Swal.fire({
      icon: 'question',
      title: 'Logout now?',
      text: 'You will be returned to the home page.',
      showCancelButton: true,
      confirmButtonText: 'Logout',
      confirmButtonColor: '#323232',
      cancelButtonText: 'Cancel',
    })

    if (result.isConfirmed) {
      await logout()
      await Swal.fire({ icon: 'success', title: 'Logged out', timer: 1200, showConfirmButton: false })
      navigate('/')
    }
  }

  if (!isAuthenticated) {
    return (
      <section className="bg-[#f5f5f5] py-12 md:py-16">
        <div className="container-custom">
          <div className="mx-auto max-w-xl rounded-2xl bg-white p-8 text-center shadow-sm">
            <h1 className="text-2xl font-semibold text-neutral">Login Required</h1>
            <p className="mt-2 text-sm text-neutral/60">
              Please login first to view your dashboard and order history.
            </p>
            <Link to="/login" className="btn btn-neutral mt-5">
              Go to Login
            </Link>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="bg-[#f1f1f1] py-8 md:py-12">
      <div className="container-custom">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-3xl font-semibold leading-tight text-[#1b2940]">
              Hi, {currentUser?.fullName}!
            </h1>
            <p className="mt-1 text-sm text-[#243b5b]">Welcome back to your dashboard.</p>
          </div>
          <button
            className="btn btn-sm rounded border border-[#c7ccd3] bg-white px-5 text-[#1b2940] hover:bg-[#f7f8fa]"
            onClick={handleLogout}
          >
            Log out
          </button>
        </div>

        <div className="grid gap-5 lg:grid-cols-[auto_320px]">
          {/* Recent Orders */}
          <article className="overflow-hidden rounded-xl border border-[#d9dde3] bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-[#e3e6eb] px-4 py-4 md:px-6">
              <h2 className="text-xl font-semibold text-[#1b2940]">Recent Orders</h2>
              <Link to="/dashboard/orders" className="text-sm font-semibold text-[#1363df] hover:underline">
                View all
              </Link>
            </div>

            {recentOrders.length === 0 ? (
              <div className="p-6 text-center h-full flex flex-col items-center justify-center">
                <FaCartArrowDown className="text-4xl text-[#5f6f85] mb-2 mx-auto" />
                <p className="text-sm text-[#5f6f85] text-center">No orders yet.</p>
                <Link to="/shop" className="mt-3 inline-block text-sm font-medium text-[#1363df] hover:underline">
                  Start shopping
                </Link>
              </div>
            ) : (
              <div>
                {recentOrders.map((order) => (
                  <Link
                    key={order.orderId}
                    to={`/dashboard/orders/${order.orderId}`}
                    className="flex items-start justify-between gap-4 border-b border-[#eceff3] px-4 pe-9 py-5 transition hover:bg-[#f9fafc] md:px-6 md:pe-10 relative"
                  >
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 opacity-50 text-xl">
                      <RiArrowRightSLine />
                    </span>
                    <div className="min-w-0">
                      <p className="text-base font-semibold text-[#1b2940]">Order {order.orderId.replace('ORD-', '#')}</p>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <p className="text-xs text-[#6e7f95]">{formatDate(order.createdAt)},</p>
                        <p className="line-clamp-1 text-xs text-[#1f3351]">
                          {order.items.map((item) => `${item.quantity}x ${item.brand}`).join(', ')}
                        </p>
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-base font-semibold text-[#1b2940]">{formatPrice(order.total)}</p>
                      <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.06em] text-[#0d9f42]">
                        {order.status || 'pending'}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </article>

          {/* Profile card */}
          <div className="space-y-4">
            <article className="rounded-xl border border-[#d9dde3] bg-white p-4 shadow-sm">
              <div className="flex items-center gap-3 border-b border-[#eceff3] pb-4">
                <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full border border-[#d9dde3] bg-[#d9dde3]">
                  {currentUser?.avatarUrl ? (
                    <img src={currentUser.avatarUrl} alt={currentUser.fullName} className="h-full w-full object-cover" />
                  ) : (
                    <span className="grid h-full w-full place-items-center text-sm font-semibold text-[#1b2940]">
                      {(currentUser?.fullName || 'U').slice(0, 1)}
                    </span>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-base font-semibold text-[#1b2940]">{currentUser?.fullName}</p>
                  <p className="truncate text-xs text-[#5f6f85]">{currentUser?.email}</p>
                </div>
              </div>
              <div className="pt-4">
                <h3 className="text-base font-semibold text-[#1b2940]">Account Details</h3>
                <p className="mt-2 text-[11px] uppercase tracking-[0.08em] text-[#7d8da1]">Account status</p>
                <p className="text-sm font-semibold text-[#08a642]">Active</p>
                <div className="mt-4 space-y-2">
                  <button
                    onClick={() => setIsEditModalOpen(true)}
                    className="flex items-center gap-1.5 text-sm font-semibold text-[#1363df] hover:underline"
                  >
                    <FiEdit2 className="text-xs" />
                    Edit profile
                  </button>
                  {/* <button className="block text-sm font-semibold text-[#1363df] hover:underline">My Wishlist</button> */}
                </div>
              </div>
            </article>

            <article className="rounded-xl bg-[#30343a] p-5 text-white shadow-sm">
              <h3 className="text-xl font-semibold">Need help?</h3>
              <p className="mt-2 text-sm text-white/80">
                Our support team is available 24/7 to assist you with your orders.
              </p>
              <Link to="/contact" className="btn mt-4 w-full border-0 bg-white text-[#1f2937] hover:bg-white/90">
                Contact Support
              </Link>
            </article>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <EditProfileModal
          currentUser={currentUser}
          updateProfile={updateProfile}
          onClose={() => setIsEditModalOpen(false)}
        />
      )}
    </section>
  )
}

export default UserDashboardPage
