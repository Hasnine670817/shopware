/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthContext'

const CartContext = createContext(null)

const mapOrder = (row) => ({
  orderId: row.order_id,
  createdAt: row.created_at,
  status: row.status,
  items: row.items,
  subtotal: Number(row.subtotal),
  total: Number(row.total),
  userEmail: row.user_email,
  customerInfo: row.customer_info,
  paymentInfo: row.payment_info,
})

export const CartProvider = ({ children }) => {
  const { currentUser } = useAuth()
  const [cartItems, setCartItems] = useState([])
  const [lastOrder, setLastOrder] = useState(null)
  const [orderHistory, setOrderHistory] = useState([])

  // Fetch orders + subscribe to real-time updates
  useEffect(() => {
    if (!currentUser?.email) {
      setOrderHistory([])
      return
    }

    const userEmail = currentUser.email.toLowerCase()

    const fetchOrders = async () => {
      const { data } = await supabase
        .from('orders')
        .select('*')
        .eq('user_email', userEmail)
        .order('created_at', { ascending: false })
      if (data) setOrderHistory(data.map(mapOrder))
    }
    fetchOrders()

    // Real-time: auto-update when admin changes order status
    const channel = supabase
      .channel(`user-orders-${userEmail}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'orders' },
        (payload) => {
          if (payload.new?.user_email?.toLowerCase() === userEmail) {
            setOrderHistory((prev) =>
              prev.map((order) =>
                order.orderId === payload.new.order_id ? mapOrder(payload.new) : order,
              ),
            )
          }
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [currentUser?.email])

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

  const removeFromCart = (id) => setCartItems((prev) => prev.filter((item) => item.id !== id))

  const increaseQuantity = (id) =>
    setCartItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity: item.quantity + 1 } : item)),
    )

  const decreaseQuantity = (id) =>
    setCartItems((prev) =>
      prev
        .map((item) =>
          item.id === id ? { ...item, quantity: Math.max(1, item.quantity - 1) } : item,
        )
        .filter((item) => item.quantity > 0),
    )

  const clearCart = () => setCartItems([])

  const placeOrder = async ({ customerInfo, paymentInfo }) => {
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

    const { error } = await supabase.from('orders').insert({
      order_id:      newOrder.orderId,
      created_at:    newOrder.createdAt,
      status:        newOrder.status,
      items:         newOrder.items,
      subtotal:      newOrder.subtotal,
      total:         newOrder.total,
      user_email:    newOrder.userEmail,
      customer_info: newOrder.customerInfo,
      payment_info:  newOrder.paymentInfo,
    })

    if (error) {
      console.error('Failed to save order:', error)
      return null
    }

    setLastOrder(newOrder)
    setOrderHistory((prev) => [newOrder, ...prev])
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
  if (!context) throw new Error('useCart must be used inside CartProvider.')
  return context
}
