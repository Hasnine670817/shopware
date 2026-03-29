import { useMemo, useRef, useState } from 'react'
import Swal from 'sweetalert2'
import { FiChevronDown, FiEdit2, FiGrid, FiList, FiPlus, FiSearch, FiTrash2, FiUpload, FiX } from 'react-icons/fi'
import { MdCheckCircle } from 'react-icons/md'
import { useProducts } from '../../context/ProductContext'
import { supabase } from '../../lib/supabase'

const AdminLoader = ({ text = 'Loading...' }) => (
  <div className="flex h-[60vh] flex-col items-center justify-center gap-3">
    <span className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-[#f08a2f] border-t-transparent" />
    <p className="text-sm text-[#8d97a7]">{text}</p>
  </div>
)

const emptyForm = {
  brand: '',
  title: '',
  price: '',
  compareAtPrice: '',
  image: '',
  badgeType: '',
  category: '',
  collection: '',
}

const inputCls =
  'w-full rounded-lg border border-[#d7dce3] bg-white px-3.5 py-2.5 text-sm text-[#202734] outline-none transition placeholder:text-[#b0b8c5] focus:border-[#f08a2f] focus:ring-2 focus:ring-[#f08a2f]/15 h-[42px]'

const AdminProductsTab = () => {
  const { products, addProduct, updateProduct, deleteProduct, loading } = useProducts()
  const [viewMode, setViewMode] = useState('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState(emptyForm)

  // Image upload states
  const [selectedFile, setSelectedFile] = useState(null)
  const [filePreview, setFilePreview] = useState(null)
  const [urlError, setUrlError] = useState(false)
  const [uploadProgress, setUploadProgress] = useState('')
  const imgFileRef = useRef(null)

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return products
    return products.filter(
      (p) =>
        p.title?.toLowerCase().includes(q) ||
        p.brand?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q),
    )
  }, [products, searchQuery])

  const resetImageStates = () => {
    setSelectedFile(null)
    setFilePreview(null)
    setUrlError(false)
    setUploadProgress('')
  }

  const openAdd = () => {
    setEditingId(null)
    setFormData(emptyForm)
    resetImageStates()
    setIsModalOpen(true)
  }

  const openEdit = (product) => {
    setEditingId(product.id)
    setFormData({
      brand: product.brand || '',
      title: product.title || '',
      price: product.price ?? '',
      compareAtPrice: product.compareAtPrice ?? '',
      image: product.image || '',
      badgeType: product.badgeType || '',
      category: product.category || '',
      collection: product.collection || '',
    })
    resetImageStates()
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingId(null)
    setFormData(emptyForm)
    resetImageStates()
  }

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      Swal.fire({ icon: 'error', title: 'Invalid file', text: 'Please select an image file.', confirmButtonColor: '#f08a2f' })
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      Swal.fire({ icon: 'error', title: 'File too large', text: 'Max file size is 5MB.', confirmButtonColor: '#f08a2f' })
      return
    }
    setSelectedFile(file)
    const reader = new FileReader()
    reader.onload = (ev) => setFilePreview(ev.target.result)
    reader.readAsDataURL(file)
    // Clear URL input when file is chosen
    setFormData((prev) => ({ ...prev, image: '' }))
  }

  const uploadProductImage = async (file) => {
    const ext = file.name.split('.').pop()
    const path = `products/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    setUploadProgress('Uploading image…')
    const { error } = await supabase.storage.from('products').upload(path, file, { upsert: true })
    if (error) throw new Error(error.message)
    const { data } = supabase.storage.from('products').getPublicUrl(path)
    return `${data.publicUrl}?t=${Date.now()}`
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      let finalData = { ...formData }

      if (selectedFile) {
        finalData.image = await uploadProductImage(selectedFile)
      }

      if (!finalData.image?.trim()) {
        await Swal.fire({ icon: 'warning', title: 'Image required', text: 'Please provide an image URL or upload a file.', confirmButtonColor: '#f08a2f' })
        setUploadProgress('')
        return
      }

      setUploadProgress('Saving product…')
      if (editingId) {
        await updateProduct(editingId, finalData)
        await Swal.fire({ icon: 'success', title: 'Product updated', confirmButtonColor: '#f08a2f' })
      } else {
        await addProduct(finalData)
        await Swal.fire({ icon: 'success', title: 'Product added', confirmButtonColor: '#f08a2f' })
      }
      closeModal()
    } catch (err) {
      setUploadProgress('')
      await Swal.fire({ icon: 'error', title: 'Failed', text: err.message || 'Could not save product.', confirmButtonColor: '#323232' })
    }
  }

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      icon: 'warning',
      title: 'Delete product?',
      text: 'This action cannot be undone.',
      showCancelButton: true,
      confirmButtonText: 'Delete',
      confirmButtonColor: '#dc2626',
    })
    if (result.isConfirmed) {
      await deleteProduct(id)
      await Swal.fire({ icon: 'success', title: 'Deleted', confirmButtonColor: '#323232' })
    }
  }

  if (loading) return <AdminLoader text="Loading products..." />

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-[#202734]">Products Management</h2>
          <p className="mt-0.5 text-xs text-[#8d97a7]">Manage your catalog and pricing</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 rounded-lg bg-[#f08a2f] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#e07820]"
        >
          <FiPlus className="text-base" />
          Add New Product
        </button>
      </div>

      {/* Search + View Toggle */}
      <div className="flex items-center gap-3">
        <label className="flex flex-1 items-center gap-2 rounded-lg border border-[#e5e7eb] bg-white px-3.5 py-2.5 text-sm text-[#6b7280]">
          <FiSearch className="shrink-0 text-[#9ca3af]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products by name or description..."
            className="w-full bg-transparent outline-none placeholder:text-[#b0b8c5]"
          />
        </label>
        <div className="flex overflow-hidden rounded-lg border border-[#e5e7eb]">
          <button
            onClick={() => setViewMode('grid')}
            className={`grid h-10 w-10 place-items-center transition ${viewMode === 'grid' ? 'bg-[#f08a2f] text-white' : 'bg-white text-[#9ca3af] hover:bg-[#f9fafb]'}`}
            title="Grid view"
          >
            <FiGrid className="text-base" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`grid h-10 w-10 place-items-center border-l border-[#e5e7eb] transition ${viewMode === 'list' ? 'bg-[#f08a2f] text-white' : 'bg-white text-[#9ca3af] hover:bg-[#f9fafb]'}`}
            title="List view"
          >
            <FiList className="text-base" />
          </button>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
          {filtered.map((product) => (
            <div key={product.id} className="group overflow-hidden rounded-xl border border-[#ebebeb] bg-white shadow-sm transition hover:shadow-md">
              <div className="relative aspect-square bg-[#f3f4f6]">
                <img
                  src={product.image}
                  alt={product.title}
                  className="h-full w-full object-cover"
                  onError={(e) => { e.target.src = 'https://placehold.co/300x300?text=No+Image' }}
                />
                <MdCheckCircle className="absolute right-2 top-2 text-xl text-emerald-500 drop-shadow" />
              </div>
              <div className="p-3">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[#aab0ba]">{product.brand}</p>
                <p className="mt-0.5 line-clamp-1 text-sm font-semibold text-[#202734]">{product.title}</p>
                <p className="mt-0.5 text-sm font-bold text-[#f08a2f]">${Number(product.price).toFixed(2)}</p>
                <p className="mt-0.5 line-clamp-1 text-[11px] text-[#9ca3af]">{product.category}</p>
                <div className="mt-3 flex items-center gap-3 border-t border-[#f0f2f5] pt-2.5">
                  <button
                    onClick={() => openEdit(product)}
                    className="text-[#9ca3af] transition hover:text-[#f08a2f]"
                    title="Edit"
                  >
                    <FiEdit2 className="text-base" />
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="text-[#9ca3af] transition hover:text-red-500"
                    title="Delete"
                  >
                    <FiTrash2 className="text-base" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <p className="col-span-full py-10 text-center text-sm text-[#8893a3]">No products found.</p>
          )}
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="overflow-hidden rounded-xl border border-[#e7e9ef] bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#f0f2f5] text-left text-xs font-semibold uppercase tracking-wide text-[#8d97a7]">
                  <th className="px-4 py-3.5 sm:px-5">Product</th>
                  <th className="hidden px-4 py-3.5 md:table-cell">Category</th>
                  <th className="px-4 py-3.5">Price</th>
                  <th className="hidden px-4 py-3.5 sm:table-cell">Status</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((product) => (
                  <tr key={product.id} className="border-b border-[#f7f8fa] transition hover:bg-[#fafbfc]">
                    <td className="px-3 py-3 sm:px-4 sm:py-3.5">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={product.image}
                          alt={product.title}
                          className="h-9 w-9 shrink-0 rounded-lg object-cover sm:h-10 sm:w-10"
                          onError={(e) => { e.target.src = 'https://placehold.co/80x80?text=?' }}
                        />
                        <div className="min-w-0 sm:min-w-[200px]">
                          <p title={product.title} className="truncate w-[100px] sm:w-[150px] md:w-[190px] xl:w-[200px] 2xl:w-full font-semibold text-[#202734]">{product.title}</p>
                          <p title={product.brand} className="truncate text-xs text-[#9ca3af]">{product.brand}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="rounded border border-[#e5e7eb] px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-[#6b7280]">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-[#202734]">
                      ${Number(product.price).toFixed(2)}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="flex w-fit items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-600">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        Active
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-end gap-3">
                        <button onClick={() => openEdit(product)} className="text-[#9ca3af] transition hover:text-[#f08a2f]" title="Edit">
                          <FiEdit2 className="text-base" />
                        </button>
                        <button onClick={() => handleDelete(product.id)} className="text-[#9ca3af] transition hover:text-red-500" title="Delete">
                          <FiTrash2 className="text-base" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-sm text-[#8893a3]">No products found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={closeModal} />
          <div className="relative z-10 w-full max-w-lg rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#f0f2f5] px-6 py-4">
              <h3 className="text-base font-semibold text-[#202734]">
                {editingId ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button onClick={closeModal} className="grid h-8 w-8 place-items-center rounded-lg text-[#9ca3af] transition hover:bg-[#f3f4f6] hover:text-[#202734]">
                <FiX />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3.5 overflow-y-auto p-6" style={{ maxHeight: 'calc(100vh - 160px)' }}>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-[#6b7280]">Brand</label>
                  <input name="brand" value={formData.brand} onChange={handleChange} className={inputCls} placeholder="Brand name" required />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-[#6b7280]">Category</label>
                  <input name="category" value={formData.category} onChange={handleChange} className={inputCls} placeholder="Category" required />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-[#6b7280]">Product Title</label>
                <input name="title" value={formData.title} onChange={handleChange} className={inputCls} placeholder="Product title" required />
              </div>
              {/* Image — URL or device upload */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[#6b7280]">Product Image</label>

                {/* Preview */}
                {(filePreview || (formData.image && !urlError)) && (
                  <div className="mb-2.5 flex items-center gap-3 rounded-lg border border-[#e5e7eb] bg-[#f9fafb] p-2.5">
                    <img
                      src={filePreview || formData.image}
                      alt="preview"
                      className="h-14 w-14 shrink-0 rounded-md object-cover border border-[#e5e7eb]"
                      onError={() => setUrlError(true)}
                      onLoad={() => setUrlError(false)}
                    />
                    <div className="min-w-0">
                      {selectedFile ? (
                        <p className="truncate text-xs font-medium text-[#202734]">{selectedFile.name}</p>
                      ) : (
                        <p className="truncate text-[11px] text-[#6b7280]">URL preview</p>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          resetImageStates()
                          setFormData((prev) => ({ ...prev, image: '' }))
                          if (imgFileRef.current) imgFileRef.current.value = ''
                        }}
                        className="mt-0.5 text-[11px] text-red-400 hover:text-red-600"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                )}

                {/* URL input */}
                <div className="flex flex-col items-center gap-2">
                  <input
                    name="image"
                    value={formData.image}
                    onChange={(e) => { handleChange(e); setUrlError(false); setSelectedFile(null); setFilePreview(null) }}
                    disabled={!!selectedFile}
                    className={`${inputCls} flex-1 disabled:cursor-not-allowed disabled:bg-[#f3f4f6] disabled:text-[#b0b8c5]`}
                    placeholder="https://example.com/image.jpg"
                  />
                  <span className="shrink-0 text-[11px] text-[#9ca3af]">OR</span>
                </div>
                {formData.image && urlError && (
                  <p className="mt-1 text-[11px] text-red-500">Could not load image from this URL.</p>
                )}

                <div className='mt-2'>
                  {/* Upload button */}
                  <input ref={imgFileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                  <button
                    type="button"
                    onClick={() => imgFileRef.current?.click()}
                    className="mb-2 flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-[#d1d5db] bg-[#f9fafb] py-2.5 text-sm text-[#6b7280] transition hover:border-[#f08a2f] hover:bg-[#fff8f2] hover:text-[#f08a2f]"
                  >
                    <FiUpload className="text-base" />
                    {selectedFile ? 'Change image' : 'Upload from device'}
                  </button>
                </div>

                
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-[#6b7280]">Price ($)</label>
                  <input name="price" type="number" min="0" step="0.01" value={formData.price} onChange={handleChange} className={inputCls} placeholder="0.00" required />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-[#6b7280]">Compare At ($)</label>
                  <input name="compareAtPrice" type="number" min="0" step="0.01" value={formData.compareAtPrice} onChange={handleChange} className={inputCls} placeholder="0.00" />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-[#6b7280]">Collection</label>
                <input name="collection" value={formData.collection} onChange={handleChange} className={inputCls} placeholder="Collection name" required />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-[#6b7280]">Badge</label>
                <div className="relative">
                  <select name="badgeType" value={formData.badgeType} onChange={handleChange} className={`${inputCls} appearance-none pr-8`}>
                    <option value="">No badge</option>
                    <option value="sale">Sale</option>
                    <option value="freeshipping">Free Shipping</option>
                    <option value="soldout">Sold Out</option>
                    <option value="custom">Custom</option>
                  </select>
                  <FiChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#9ca3af]" />
                </div>
              </div>
              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={!!uploadProgress}
                  className="flex-1 rounded-lg border border-[#e5e7eb] py-2.5 text-sm font-semibold text-[#6b7280] transition hover:bg-[#f9fafb] disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!!uploadProgress}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#f08a2f] py-2.5 text-sm font-semibold text-white transition hover:bg-[#e07820] disabled:opacity-60"
                >
                  {uploadProgress ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      {uploadProgress}
                    </>
                  ) : (
                    editingId ? 'Update Product' : 'Add Product'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminProductsTab
