/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'

const ProductContext = createContext(null)

// Map Supabase row (snake_case) → app object (camelCase)
const mapProduct = (row) => ({
  id: row.id,
  brand: row.brand,
  title: row.title,
  price: Number(row.price),
  compareAtPrice: row.compare_at_price ? Number(row.compare_at_price) : null,
  image: row.image,
  badgeType: row.badge_type || null,
  category: row.category,
  collection: row.collection,
})

// Map app object (camelCase) → Supabase row (snake_case)
const toDbProduct = (p) => ({
  id: p.id,
  brand: p.brand || '',
  title: p.title || '',
  price: Number(p.price) || 0,
  compare_at_price: p.compareAtPrice ? Number(p.compareAtPrice) : null,
  image: p.image || '',
  badge_type: p.badgeType || null,
  category: p.category || '',
  collection: p.collection || '',
})

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true)

        // Fetch from Supabase
        const { data, error: dbError } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: true })

        if (dbError) throw new Error(dbError.message)

        // If Supabase has products, use them
        if (data && data.length > 0) {
          setProducts(data.map(mapProduct))
          return
        }

        // Otherwise seed from products.json (first run)
        const response = await fetch('/products.json')
        if (!response.ok) throw new Error('Failed to fetch product data.')
        const jsonProducts = await response.json()

        const rows = jsonProducts.map((p) => toDbProduct({
          id: String(p.id),
          brand: p.brand,
          title: p.title,
          price: p.price,
          compareAtPrice: p.compareAtPrice,
          image: p.image,
          badgeType: p.badgeType,
          category: p.category,
          collection: p.collection,
        }))

        const { error: insertError } = await supabase.from('products').insert(rows)
        if (insertError) throw new Error(insertError.message)

        setProducts(jsonProducts.map((p) => mapProduct({
          id: String(p.id),
          brand: p.brand,
          title: p.title,
          price: p.price,
          compare_at_price: p.compareAtPrice,
          image: p.image,
          badge_type: p.badgeType,
          category: p.category,
          collection: p.collection,
        })))
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong while loading products.')
      } finally {
        setLoading(false)
      }
    }

    loadProducts()
  }, [])

  const collections = useMemo(
    () => ['All', ...new Set(products.map((p) => p.collection))],
    [products],
  )

  const addProduct = async (productData) => {
    const newProduct = toDbProduct({
      id: crypto.randomUUID(),
      brand: productData.brand?.trim() || 'NEW BRAND',
      title: productData.title?.trim() || 'Sample Product',
      price: Number(productData.price) || 0,
      compareAtPrice: productData.compareAtPrice ? Number(productData.compareAtPrice) : null,
      image: productData.image?.trim() || '',
      badgeType: productData.badgeType || null,
      category: productData.category?.trim() || 'General',
      collection: productData.collection?.trim() || 'General',
    })

    const { error } = await supabase.from('products').insert(newProduct)
    if (error) throw new Error(error.message)
    setProducts((prev) => [...prev, mapProduct(newProduct)])
  }

  const updateProduct = async (id, updatedData) => {
    const existing = products.find((p) => p.id === id)
    if (!existing) return

    const updated = toDbProduct({
      id,
      brand: updatedData.brand ?? existing.brand,
      title: updatedData.title ?? existing.title,
      price: Number(updatedData.price ?? existing.price),
      compareAtPrice: updatedData.compareAtPrice
        ? Number(updatedData.compareAtPrice)
        : null,
      image: updatedData.image ?? existing.image,
      badgeType: updatedData.badgeType ?? existing.badgeType,
      category: updatedData.category ?? existing.category,
      collection: updatedData.collection ?? existing.collection,
    })

    const { error } = await supabase.from('products').update(updated).eq('id', id)
    if (error) throw new Error(error.message)
    setProducts((prev) => prev.map((p) => (p.id === id ? mapProduct(updated) : p)))
  }

  const deleteProduct = async (id) => {
    const { error } = await supabase.from('products').delete().eq('id', id)
    if (error) throw new Error(error.message)
    setProducts((prev) => prev.filter((p) => p.id !== id))
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
  if (!context) throw new Error('useProducts must be used within a ProductProvider.')
  return context
}
