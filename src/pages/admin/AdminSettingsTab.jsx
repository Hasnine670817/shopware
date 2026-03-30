import { useRef, useState } from 'react'
import { FiCamera, FiCheck, FiEye, FiEyeOff, FiLock, FiMail, FiUpload, FiUser, FiX } from 'react-icons/fi'
import Swal from 'sweetalert2'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'

// ── helpers ────────────────────────────────────────────────────────────────────
const inputCls =
  'w-full rounded-xl border border-[#e2e6ed] bg-[#f8fafc] px-4 py-2.5 text-sm text-[#202734] outline-none transition placeholder:text-[#b0b8c5] focus:border-[#f08a2f] focus:bg-white focus:ring-2 focus:ring-[#f08a2f]/15 disabled:cursor-not-allowed disabled:opacity-55'

const passwordStrength = (pw) => {
  if (!pw) return { score: 0, label: '', color: '' }
  let score = 0
  if (pw.length >= 8)            score++
  if (/[A-Z]/.test(pw))          score++
  if (/[0-9]/.test(pw))          score++
  if (/[^A-Za-z0-9]/.test(pw))  score++
  const map = [
    { label: '',          color: '' },
    { label: 'Weak',      color: 'bg-red-500' },
    { label: 'Fair',      color: 'bg-amber-400' },
    { label: 'Good',      color: 'bg-blue-500' },
    { label: 'Strong',    color: 'bg-emerald-500' },
  ]
  return { score, ...map[score] }
}

// ── sub-components ─────────────────────────────────────────────────────────────
const PasswordInput = ({ label, value, onChange, placeholder }) => {
  const [show, setShow] = useState(false)
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-[#6b7280]">{label}</label>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`${inputCls} pr-11`}
        />
        <button
          type="button"
          onClick={() => setShow((p) => !p)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9ca3af] transition hover:text-[#6b7280]"
          tabIndex={-1}
        >
          {show ? <FiEyeOff className="text-base" /> : <FiEye className="text-base" />}
        </button>
      </div>
    </div>
  )
}

// ── Admin Profile Tab ──────────────────────────────────────────────────────────
const ProfileTab = () => {
  const { currentUser, updateProfile } = useAuth()

  const [fullName, setFullName]       = useState(currentUser?.fullName || '')
  const [avatarUrl, setAvatarUrl]     = useState(currentUser?.avatarUrl || '')
  const [selectedFile, setSelectedFile] = useState(null)
  const [filePreview, setFilePreview]   = useState(null)
  const [urlError, setUrlError]         = useState(false)
  const [saving, setSaving]             = useState(false)
  const [progress, setProgress]         = useState('')
  const fileRef = useRef(null)

  const previewSrc = filePreview || (avatarUrl && !urlError ? avatarUrl : null)
  const displayInitial = (fullName || currentUser?.fullName || 'A').slice(0, 1).toUpperCase()

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      Swal.fire({ icon: 'error', title: 'Invalid file', text: 'Please select an image.', confirmButtonColor: '#f08a2f' })
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      Swal.fire({ icon: 'error', title: 'Too large', text: 'Max 5 MB allowed.', confirmButtonColor: '#f08a2f' })
      return
    }
    setSelectedFile(file)
    const reader = new FileReader()
    reader.onload = (ev) => setFilePreview(ev.target.result)
    reader.readAsDataURL(file)
    setAvatarUrl('')
  }

  const uploadToStorage = async (file) => {
    const ext  = file.name.split('.').pop()
    const path = `avatars/${currentUser.id}-${Date.now()}.${ext}`
    setProgress('Uploading image…')
    const { error } = await supabase.storage.from('avatars').upload(path, file, { upsert: true })
    if (error) throw new Error(error.message)
    const { data } = supabase.storage.from('avatars').getPublicUrl(path)
    return `${data.publicUrl}?t=${Date.now()}`
  }

  const clearImage = () => {
    setSelectedFile(null)
    setFilePreview(null)
    setAvatarUrl('')
    setUrlError(false)
    if (fileRef.current) fileRef.current.value = ''
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!fullName.trim()) {
      Swal.fire({ icon: 'warning', title: 'Name required', confirmButtonColor: '#f08a2f' })
      return
    }
    setSaving(true)
    try {
      let finalUrl = avatarUrl || currentUser?.avatarUrl || ''
      if (selectedFile) finalUrl = await uploadToStorage(selectedFile)
      setProgress('Saving…')
      const result = await updateProfile({ fullName, avatarUrl: finalUrl })
      if (!result.ok) throw new Error(result.message)
      await Swal.fire({ icon: 'success', title: 'Profile updated!', timer: 1400, showConfirmButton: false })
      setSelectedFile(null)
      setFilePreview(null)
      if (fileRef.current) fileRef.current.value = ''
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Failed', text: err.message, confirmButtonColor: '#f08a2f' })
    } finally {
      setSaving(false)
      setProgress('')
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">

      {/* Avatar block */}
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-[#e7e9ef] bg-[#f9fafb] p-6 sm:flex-row sm:gap-6">
        {/* Avatar preview */}
        <div className="relative shrink-0">
          <div className="h-24 w-24 overflow-hidden rounded-2xl border-2 border-white shadow-md">
            {previewSrc ? (
              <img
                src={previewSrc}
                alt="avatar"
                className="h-full w-full object-cover"
                onError={() => { setUrlError(true); setFilePreview(null) }}
                onLoad={() => setUrlError(false)}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-[#1f2937] text-3xl font-bold text-white">
                {displayInitial}
              </div>
            )}
          </div>
          {/* camera badge */}
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-[#f08a2f] text-white shadow-md transition hover:bg-[#e07820]"
            title="Upload from device"
          >
            <FiCamera className="text-sm" />
          </button>
        </div>

        {/* Upload controls */}
        <div className="w-full min-w-0 space-y-2.5">
          <div>
            <p className="text-sm font-semibold text-[#202734]">{currentUser?.fullName || 'Admin'}</p>
            <p className="text-xs text-[#8b95a4]">{currentUser?.email}</p>
          </div>

          {/* File chosen badge */}
          {selectedFile && (
            <div className="flex items-center gap-2 rounded-lg border border-[#e5e7eb] bg-white px-3 py-1.5 text-xs">
              <FiCheck className="shrink-0 text-emerald-500" />
              <span className="truncate font-medium text-[#202734]">{selectedFile.name}</span>
              <button type="button" onClick={clearImage} className="ml-auto shrink-0 text-[#9ca3af] hover:text-red-500">
                <FiX />
              </button>
            </div>
          )}

          {/* Upload button */}
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex items-center gap-2 rounded-xl border border-dashed border-[#d1d5db] bg-white px-4 py-2 text-xs font-medium text-[#6b7280] transition hover:border-[#f08a2f] hover:text-[#f08a2f]"
          >
            <FiUpload className="text-sm" />
            {selectedFile ? 'Change image' : 'Upload from device'}
          </button>

          {/* URL input */}
          <div className="flex items-center gap-2">
            <span className="shrink-0 text-[11px] text-[#9ca3af]">or URL</span>
            <input
              type="url"
              value={avatarUrl}
              onChange={(e) => { setAvatarUrl(e.target.value); setUrlError(false); setSelectedFile(null); setFilePreview(null) }}
              disabled={!!selectedFile}
              placeholder="https://example.com/photo.jpg"
              className={`${inputCls} flex-1 text-xs`}
            />
          </div>
          {avatarUrl && urlError && (
            <p className="text-[11px] text-red-500">Could not load image from this URL.</p>
          )}
        </div>
      </div>

      {/* Fields */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-[#6b7280]">
            <FiUser className="mr-1 inline" />Full Name
          </label>
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className={inputCls}
            placeholder="Your full name"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-[#6b7280]">
            <FiMail className="mr-1 inline" />Email
          </label>
          <input
            value={currentUser?.email || ''}
            disabled
            className={inputCls}
          />
          <p className="mt-1 text-[11px] text-[#b0b8c5]">Email cannot be changed here.</p>
        </div>
      </div>

      {/* Role badge */}
      <div className="flex items-center gap-3 rounded-xl border border-[#e7e9ef] bg-[#f9fafb] px-4 py-3">
        <span className="rounded-full bg-[#f08a2f]/10 px-3 py-1 text-xs font-semibold text-[#f08a2f]">
          {currentUser?.role?.toUpperCase() || 'ADMIN'}
        </span>
        <p className="text-xs text-[#8b95a4]">Account role — managed by system</p>
      </div>

      {/* Submit */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 rounded-xl bg-[#f08a2f] px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#e07820] disabled:opacity-60"
        >
          {saving ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              {progress || 'Saving…'}
            </>
          ) : (
            <>
              <FiCheck className="text-sm" />
              Save Profile
            </>
          )}
        </button>
      </div>
    </form>
  )
}

// ── Security Tab ───────────────────────────────────────────────────────────────
const SecurityTab = () => {
  const { currentUser } = useAuth()

  const [oldPw, setOldPw]         = useState('')
  const [newPw, setNewPw]         = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [saving, setSaving]       = useState(false)

  const strength = passwordStrength(newPw)
  const match    = newPw && confirmPw && newPw === confirmPw

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!oldPw || !newPw || !confirmPw) {
      Swal.fire({ icon: 'warning', title: 'All fields required', confirmButtonColor: '#f08a2f' })
      return
    }
    if (newPw.length < 8) {
      Swal.fire({ icon: 'warning', title: 'Too short', text: 'New password must be at least 8 characters.', confirmButtonColor: '#f08a2f' })
      return
    }
    if (newPw !== confirmPw) {
      Swal.fire({ icon: 'error', title: 'Passwords do not match', confirmButtonColor: '#f08a2f' })
      return
    }
    if (oldPw === newPw) {
      Swal.fire({ icon: 'info', title: 'Same password', text: 'New password must be different from the old one.', confirmButtonColor: '#f08a2f' })
      return
    }

    setSaving(true)
    try {
      // Step 1: verify old password by re-signing in
      const { error: signInErr } = await supabase.auth.signInWithPassword({
        email: currentUser.email,
        password: oldPw,
      })
      if (signInErr) throw new Error('Current password is incorrect.')

      // Step 2: update to new password
      const { error: updateErr } = await supabase.auth.updateUser({ password: newPw })
      if (updateErr) throw new Error(updateErr.message)

      await Swal.fire({ icon: 'success', title: 'Password updated!', timer: 1400, showConfirmButton: false })
      setOldPw(''); setNewPw(''); setConfirmPw('')
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Failed', text: err.message, confirmButtonColor: '#f08a2f' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* Info card */}
      <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
        <FiLock className="mt-0.5 shrink-0 text-amber-600" />
        <div>
          <p className="text-sm font-semibold text-amber-800">Change your password</p>
          <p className="mt-0.5 text-xs text-amber-700">
            For security, enter your current password before setting a new one. Use at least 8 characters with a mix of letters, numbers, and symbols.
          </p>
        </div>
      </div>

      {/* Fields */}
      <div className="space-y-4 rounded-2xl border border-[#e7e9ef] bg-[#f9fafb] p-5">
        <PasswordInput
          label="Current Password"
          value={oldPw}
          onChange={(e) => setOldPw(e.target.value)}
          placeholder="Enter your current password"
        />

        <div className="h-px bg-[#edf0f4]" />

        <PasswordInput
          label="New Password"
          value={newPw}
          onChange={(e) => setNewPw(e.target.value)}
          placeholder="Min. 8 characters"
        />

        {/* Strength meter */}
        {newPw && (
          <div className="space-y-1.5">
            <div className="flex gap-1">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                    i <= strength.score ? strength.color : 'bg-[#e5e7eb]'
                  }`}
                />
              ))}
            </div>
            {strength.label && (
              <p className={`text-[11px] font-semibold ${
                strength.score === 1 ? 'text-red-500'
                  : strength.score === 2 ? 'text-amber-500'
                  : strength.score === 3 ? 'text-blue-500'
                  : 'text-emerald-600'
              }`}>
                {strength.label}
              </p>
            )}
          </div>
        )}

        <PasswordInput
          label="Confirm New Password"
          value={confirmPw}
          onChange={(e) => setConfirmPw(e.target.value)}
          placeholder="Re-enter new password"
        />

        {/* Match indicator */}
        {confirmPw && (
          <p className={`flex items-center gap-1.5 text-xs font-medium ${match ? 'text-emerald-600' : 'text-red-500'}`}>
            {match
              ? <><FiCheck /> Passwords match</>
              : <><FiX /> Passwords do not match</>
            }
          </p>
        )}
      </div>

      {/* Password rules */}
      <ul className="grid gap-1.5 sm:grid-cols-2">
        {[
          ['At least 8 characters',            newPw.length >= 8],
          ['One uppercase letter (A-Z)',        /[A-Z]/.test(newPw)],
          ['One number (0-9)',                  /[0-9]/.test(newPw)],
          ['One special character (!@#$…)',     /[^A-Za-z0-9]/.test(newPw)],
        ].map(([rule, met]) => (
          <li key={rule} className={`flex items-center gap-2 text-xs transition ${met ? 'text-emerald-600' : 'text-[#9ca3af]'}`}>
            <span className={`grid h-4 w-4 shrink-0 place-items-center rounded-full text-[9px] font-bold transition ${met ? 'bg-emerald-100 text-emerald-600' : 'bg-[#f3f4f6] text-[#9ca3af]'}`}>
              {met ? '✓' : '○'}
            </span>
            {rule}
          </li>
        ))}
      </ul>

      {/* Submit */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 rounded-xl bg-[#1f2937] px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#111827] disabled:opacity-60"
        >
          {saving ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Updating…
            </>
          ) : (
            <>
              <FiLock className="text-sm" />
              Update Password
            </>
          )}
        </button>
      </div>
    </form>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────
const TABS = [
  { id: 'profile',  label: 'Admin Profile', icon: FiUser },
  { id: 'security', label: 'Security',       icon: FiLock },
]

const AdminSettingsTab = () => {
  const [activeTab, setActiveTab] = useState('profile')

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-[#202734]">Settings</h2>
        <p className="mt-0.5 text-xs text-[#8d97a7]">Manage your profile and account security</p>
      </div>

      <div className="rounded-2xl border border-[#e7e9ef] bg-white shadow-sm">
        {/* Horizontal tabs */}
        <div className="flex border-b border-[#e7e9ef]">
          {TABS.map((tab) => {
            const Icon = tab.icon
            const active = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-4 text-sm font-semibold transition border-b-2 -mb-px ${
                  active
                    ? 'border-[#f08a2f] text-[#f08a2f]'
                    : 'border-transparent text-[#6b7280] hover:text-[#202734]'
                }`}
              >
                <Icon className={`text-base ${active ? 'text-[#f08a2f]' : 'text-[#9ca3af]'}`} />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Tab content */}
        <div className="p-5 md:p-7">
          {activeTab === 'profile'  && <ProfileTab />}
          {activeTab === 'security' && <SecurityTab />}
        </div>
      </div>
    </div>
  )
}

export default AdminSettingsTab
