/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const ProductContext = createContext(null)
const PRODUCTS_STORAGE_KEY = 'shopware_products'

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true)
        const response = await fetch('/products.json')
        if (!response.ok) {
          throw new Error('Failed to fetch product data.')
        }
        const data = await response.json()
        const storedProducts = localStorage.getItem(PRODUCTS_STORAGE_KEY)
        if (storedProducts) {
          setProducts(JSON.parse(storedProducts))
        } else {
          setProducts(data)
          localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(data))
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong while loading products.')
      } finally {
        setLoading(false)
      }
    }

    loadProducts()
  }, [])

  const collections = useMemo(
    () => ['All', ...new Set(products.map((product) => product.collection))],
    [products],
  )

  const addProduct = (productData) => {
    const newProduct = {
      id: Date.now(),
      brand: productData.brand?.trim() || 'NEW BRAND',
      title: productData.title?.trim() || 'Sample Product',
      price: Number(productData.price) || 0,
      compareAtPrice: productData.compareAtPrice ? Number(productData.compareAtPrice) : null,
      image: productData.image?.trim() || '',
      badgeType: productData.badgeType || null,
      category: productData.category?.trim() || 'General',
      collection: productData.collection?.trim() || 'General',
    }

    setProducts((prev) => {
      const updated = [...prev, newProduct]
      localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(updated))
      return updated
    })
  }

  const updateProduct = (id, updatedData) => {
    setProducts((prev) => {
      const updated = prev.map((item) =>
        item.id === id
          ? {
              ...item,
              ...updatedData,
              price: Number(updatedData.price ?? item.price),
              compareAtPrice: updatedData.compareAtPrice
                ? Number(updatedData.compareAtPrice)
                : null,
            }
          : item,
      )
      localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(updated))
      return updated
    })
  }

  const deleteProduct = (id) => {
    setProducts((prev) => {
      const updated = prev.filter((item) => item.id !== id)
      localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(updated))
      return updated
    })
  }

  const value = {
    products,
    collections,
    loading,
    error,
    addProduct,
    updateProduct,
    deleteProduct,
  }

  return <ProductContext.Provider value={value}>{children}</ProductContext.Provider>
}

export const useProducts = () => {
  const context = useContext(ProductContext)
  if (!context) {
    throw new Error('useProducts must be used within a ProductProvider.')
  }
  return context
}
