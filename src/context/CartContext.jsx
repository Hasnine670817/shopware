/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useMemo, useState } from 'react'
import { useAuth } from './AuthContext'

const CartContext = createContext(null)
const ORDERS_STORAGE_KEY = 'shopware_orders'

const getStoredOrders = () => {
  try {
    return JSON.parse(localStorage.getItem(ORDERS_STORAGE_KEY) || '{}')
  } catch {
    return {}
  }
}

export const CartProvider = ({ children }) => {
  const { currentUser } = useAuth()
  const [cartItems, setCartItems] = useState([])
  const [lastOrder, setLastOrder] = useState(null)
  const [ordersByUser, setOrdersByUser] = useState(getStoredOrders)

  const addToCart = (product) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === product.id)
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item,
        )
      }

      return [
        ...prev,
        {
          id: product.id,
          brand: product.brand,
          title: product.title,
          image: product.image,
          price: product.price,
          quantity: 1,
        },
      ]
    })
  }

  const removeFromCart = (id) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id))
  }

  const increaseQuantity = (id) => {
    setCartItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity: item.quantity + 1 } : item)),
    )
  }

  const decreaseQuantity = (id) => {
    setCartItems((prev) =>
      prev
        .map((item) =>
          item.id === id ? { ...item, quantity: Math.max(1, item.quantity - 1) } : item,
        )
        .filter((item) => item.quantity > 0),
    )
  }

  const clearCart = () => setCartItems([])

  const placeOrder = ({ customerInfo, paymentInfo }) => {
    if (cartItems.length === 0) return null

    const subtotalValue = cartItems.reduce((total, item) => total + item.price * item.quantity, 0)
    const userKey = (currentUser?.email || customerInfo?.email || '').trim().toLowerCase()
    const newOrder = {
      orderId: `ORD-${Date.now().toString().slice(-8)}`,
      createdAt: new Date().toISOString(),
      status: 'pending',
      items: cartItems,
      subtotal: subtotalValue,
      total: subtotalValue,
      userEmail: userKey,
      customerInfo,
      paymentInfo: {
        method: paymentInfo.method,
        cardEnding: paymentInfo.cardNumber?.slice(-4) || '',
      },
    }

    setLastOrder(newOrder)
    if (userKey) {
      setOrdersByUser((prev) => {
        const next = {
          ...prev,
          [userKey]: [newOrder, ...(prev[userKey] || [])],
        }
        localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(next))
        return next
      })
    }
    clearCart()
    return newOrder
  }

  const cartCount = useMemo(
    () => cartItems.reduce((total, item) => total + item.quantity, 0),
    [cartItems],
  )

  const subtotal = useMemo(
    () => cartItems.reduce((total, item) => total + item.price * item.quantity, 0),
    [cartItems],
  )

  const orderHistory = useMemo(() => {
    const userKey = currentUser?.email?.toLowerCase()
    if (!userKey) return []
    return ordersByUser[userKey] || []
  }, [currentUser, ordersByUser])

  const value = {
    cartItems,
    cartCount,
    subtotal,
    orderHistory,
    addToCart,
    removeFromCart,
    increaseQuantity,
    decreaseQuantity,
    clearCart,
    placeOrder,
    lastOrder,
    setLastOrder,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used inside CartProvider.')
  }
  return context
}
