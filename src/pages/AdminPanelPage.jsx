import { useMemo, useState } from 'react'
import Swal from 'sweetalert2'
import { useNavigate } from 'react-router-dom'
import { useAdminAuth } from '../context/AdminAuthContext'
import { useProducts } from '../context/ProductContext'

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

const AdminPanelPage = () => {
  const navigate = useNavigate()
  const { adminLogout } = useAdminAuth()
  const { products, addProduct, updateProduct, deleteProduct } = useProducts()
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState(emptyForm)

  const stats = useMemo(
    () => ({
      products: products.length,
      categories: new Set(products.map((p) => p.category)).size,
      collections: new Set(products.map((p) => p.collection)).size,
    }),
    [products],
  )

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (editingId) {
      updateProduct(editingId, formData)
      await Swal.fire({
        icon: 'success',
        title: 'Product updated',
        confirmButtonColor: '#323232',
      })
    } else {
      addProduct(formData)
      await Swal.fire({
        icon: 'success',
        title: 'Product added',
        confirmButtonColor: '#323232',
      })
    }

    setEditingId(null)
    setFormData(emptyForm)
  }

  const handleEdit = (product) => {
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
  }

  const handleDelete = async (productId) => {
    const result = await Swal.fire({
      icon: 'warning',
      title: 'Delete product?',
      text: 'This action cannot be undone.',
      showCancelButton: true,
      confirmButtonText: 'Delete',
      confirmButtonColor: '#dc2626',
    })

    if (result.isConfirmed) {
      deleteProduct(productId)
      await Swal.fire({
        icon: 'success',
        title: 'Deleted',
        confirmButtonColor: '#323232',
      })
    }
  }

  const handleAdminLogout = async () => {
    adminLogout()
    await Swal.fire({
      icon: 'success',
      title: 'Logged out',
      confirmButtonColor: '#323232',
    })
    navigate('/')
  }

  return (
    <section className="bg-[#f5f5f5] py-10 md:py-14">
      <div className="container-custom space-y-6">
        <div className="rounded-2xl bg-white p-6 shadow-sm md:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold text-neutral md:text-3xl">Admin Panel</h1>
              <p className="mt-1 text-sm text-neutral/60">Manage products with secure admin access.</p>
            </div>
            <button className="btn btn-outline" onClick={handleAdminLogout}>
              Logout
            </button>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <article className="rounded-xl bg-base-200 p-4">
              <p className="text-xs uppercase text-neutral/50">Total Products</p>
              <p className="mt-1 text-2xl font-semibold text-neutral">{stats.products}</p>
            </article>
            <article className="rounded-xl bg-base-200 p-4">
              <p className="text-xs uppercase text-neutral/50">Categories</p>
              <p className="mt-1 text-2xl font-semibold text-neutral">{stats.categories}</p>
            </article>
            <article className="rounded-xl bg-base-200 p-4">
              <p className="text-xs uppercase text-neutral/50">Collections</p>
              <p className="mt-1 text-2xl font-semibold text-neutral">{stats.collections}</p>
            </article>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[360px_auto]">
          <article className="rounded-2xl bg-white p-6 shadow-sm md:p-8">
            <h2 className="text-base font-semibold text-neutral">
              {editingId ? 'Update Product' : 'Add New Product'}
            </h2>
            <form className="mt-4 space-y-3" onSubmit={handleSubmit}>
              <input name="brand" value={formData.brand} onChange={handleChange} className="input input-bordered w-full" placeholder="Brand" required />
              <input name="title" value={formData.title} onChange={handleChange} className="input input-bordered w-full" placeholder="Title" required />
              <input name="image" value={formData.image} onChange={handleChange} className="input input-bordered w-full" placeholder="Image URL" required />
              <div className="grid grid-cols-2 gap-3">
                <input name="price" type="number" value={formData.price} onChange={handleChange} className="input input-bordered w-full" placeholder="Price" required />
                <input name="compareAtPrice" type="number" value={formData.compareAtPrice} onChange={handleChange} className="input input-bordered w-full" placeholder="Compare At" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input name="category" value={formData.category} onChange={handleChange} className="input input-bordered w-full" placeholder="Category" required />
                <input name="collection" value={formData.collection} onChange={handleChange} className="input input-bordered w-full" placeholder="Collection" required />
              </div>
              <select
                name="badgeType"
                value={formData.badgeType}
                onChange={handleChange}
                className="select select-bordered w-full"
              >
                <option value="">Badge (optional)</option>
                <option value="sale">Sale</option>
                <option value="freeshipping">Free Shipping</option>
                <option value="soldout">Sold Out</option>
                <option value="custom">Custom</option>
              </select>
              <div className="flex gap-2 pt-2">
                <button type="submit" className="btn btn-neutral flex-1">
                  {editingId ? 'Update' : 'Add Product'}
                </button>
                {editingId ? (
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => {
                      setEditingId(null)
                      setFormData(emptyForm)
                    }}
                  >
                    Cancel
                  </button>
                ) : null}
              </div>
            </form>
          </article>

          <article className="rounded-2xl bg-white p-4 shadow-sm md:p-6">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-base font-semibold text-neutral">Products</h2>
              <span className="text-xs text-neutral/60">{products.length} items</span>
            </div>

            <div className="overflow-x-auto">
              <table className="table table-zebra">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Price</th>
                    <th>Category</th>
                    <th>Collection</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <img src={product.image} alt={product.brand} className="h-10 w-8 rounded object-cover" />
                          <div>
                            <p className="text-xs uppercase text-neutral/50">{product.brand}</p>
                            <p className="line-clamp-1 text-sm">{product.title}</p>
                          </div>
                        </div>
                      </td>
                      <td>${Number(product.price).toFixed(2)}</td>
                      <td>{product.category}</td>
                      <td>{product.collection}</td>
                      <td>
                        <div className="flex justify-end gap-2">
                          <button className="btn btn-xs btn-outline" onClick={() => handleEdit(product)}>
                            Edit
                          </button>
                          <button className="btn btn-xs btn-error text-white" onClick={() => handleDelete(product.id)}>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>
        </div>
      </div>
    </section>
  )
}

export default AdminPanelPage
