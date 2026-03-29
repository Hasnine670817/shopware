import { useEffect, useMemo, useState } from 'react'
import { FiArrowUpRight, FiChevronDown, FiClock, FiShoppingCart, FiUsers } from 'react-icons/fi'
import { useAuth } from '../../context/AuthContext'
import { useProducts } from '../../context/ProductContext'
import { supabase } from '../../lib/supabase'

const AdminLoader = () => (
  <div className="flex h-[60vh] flex-col items-center justify-center gap-3">
    <span className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-[#f08a2f] border-t-transparent" />
    <p className="text-sm text-[#8d97a7]">Loading data...</p>
  </div>
)

const metricCardDefs = [
  { key: 'revenue', title: 'Total Revenue', icon: FiArrowUpRight, accent: 'text-[#5b8def]', format: (v) => `$${v.toFixed(2)}` },
  { key: 'orders', title: 'Total Orders', icon: FiShoppingCart, accent: 'text-[#f08a2f]', format: (v) => v },
  { key: 'users', title: 'Total Users', icon: FiUsers, accent: 'text-[#22a35a]', format: (v) => v },
  { key: 'pendingOrders', title: 'Pending Orders', icon: FiClock, accent: 'text-[#ef5a5a]', format: (v) => v },
]

const AdminDashboardTab = () => {
  const { users } = useAuth()
  const { products } = useProducts()
  const [allOrders, setAllOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [chartPeriod, setChartPeriod] = useState('7')
  const [hoveredPoint, setHoveredPoint] = useState(null)

  useEffect(() => {
    let cancelled = false
    const fetchOrders = async () => {
      setLoading(true)
      try {
        const { data } = await supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false })
        if (!cancelled && data) {
          setAllOrders(data.map((row) => ({
            orderId: row.order_id,
            createdAt: row.created_at,
            status: row.status,
            items: row.items,
            subtotal: Number(row.subtotal),
            total: Number(row.total),
            userEmail: row.user_email,
            customerInfo: row.customer_info,
          })))
        }
      } catch (err) {
        console.error('Dashboard fetch error:', err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchOrders()
    return () => { cancelled = true }
  }, [])

  const stats = useMemo(() => ({
    revenue: allOrders.reduce((s, o) => s + Number(o.total || 0), 0),
    orders: allOrders.length,
    users: users.length,
    pendingOrders: allOrders.filter((o) => o.status === 'pending').length,
    categories: new Set(products.map((p) => p.category)).size,
    collections: new Set(products.map((p) => p.collection)).size,
  }), [allOrders, products, users])

  const chartData = useMemo(() => {
    const now = new Date()
    if (chartPeriod === '6m') {
      const buckets = Array.from({ length: 6 }, (_, i) => {
        const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
        return { label: d.toLocaleString('default', { month: 'short' }), revenue: 0, year: d.getFullYear(), month: d.getMonth() }
      })
      allOrders.forEach((o) => {
        const d = new Date(o.createdAt)
        const b = buckets.find((bk) => bk.year === d.getFullYear() && bk.month === d.getMonth())
        if (b) b.revenue += Number(o.total || 0)
      })
      return buckets.map(({ label, revenue }) => ({ label, revenue }))
    }
    const days = chartPeriod === '30' ? 30 : 7
    const buckets = Array.from({ length: days }, (_, i) => {
      const d = new Date(now)
      d.setDate(d.getDate() - (days - 1 - i))
      d.setHours(0, 0, 0, 0)
      const label = days <= 7 ? d.toLocaleString('default', { weekday: 'short' }) : `${d.getMonth() + 1}/${d.getDate()}`
      return { label, revenue: 0, dateStr: d.toDateString() }
    })
    allOrders.forEach((o) => {
      const d = new Date(o.createdAt)
      d.setHours(0, 0, 0, 0)
      const b = buckets.find((bk) => bk.dateStr === d.toDateString())
      if (b) b.revenue += Number(o.total || 0)
    })
    return buckets.map(({ label, revenue }) => ({ label, revenue }))
  }, [allOrders, chartPeriod])

  const dynamicMetrics = useMemo(() => {
    const now = new Date()
    const ms7 = 7 * 24 * 60 * 60 * 1000
    const t7 = new Date(now.getTime() - ms7)
    const t14 = new Date(now.getTime() - 2 * ms7)
    const curr = allOrders.filter((o) => new Date(o.createdAt) >= t7)
    const prev = allOrders.filter((o) => { const d = new Date(o.createdAt); return d >= t14 && d < t7 })
    const sumRev = (arr) => arr.reduce((s, o) => s + Number(o.total || 0), 0)
    const cntPend = (arr) => arr.filter((o) => o.status === 'pending').length
    const delta = (a, b) => (b === 0 ? (a > 0 ? 100 : 0) : ((a - b) / b) * 100)
    const fmt = (v) => `${v >= 0 ? '+' : ''}${v.toFixed(1)}%`
    const rd = delta(sumRev(curr), sumRev(prev))
    const od = delta(curr.length, prev.length)
    const pd = delta(cntPend(curr), cntPend(prev))
    return {
      revenue: { delta: fmt(rd), positive: rd >= 0 },
      orders: { delta: fmt(od), positive: od >= 0 },
      users: { delta: `+${users.length}`, positive: true },
      pendingOrders: { delta: fmt(pd), positive: pd <= 0 },
    }
  }, [allOrders, users.length])

  // SVG chart geometry
  const VW = 820, VH = 240
  const PL = 58, PR = 16, PT = 16, PB = 36
  const CW = VW - PL - PR
  const CH = VH - PT - PB
  const maxRev = Math.max(...chartData.map((d) => d.revenue), 1)
  const n = chartData.length

  const svgPts = chartData.map((d, i) => ({
    x: PL + (n > 1 ? (CW / (n - 1)) * i : CW / 2),
    y: PT + CH - (d.revenue / maxRev) * CH,
    label: d.label,
    revenue: d.revenue,
  }))

  const linePath = svgPts.reduce((acc, pt, i) => {
    if (i === 0) return `M ${pt.x},${pt.y}`
    const prev = svgPts[i - 1]
    const cpx = (prev.x + pt.x) / 2
    return `${acc} C ${cpx},${prev.y} ${cpx},${pt.y} ${pt.x},${pt.y}`
  }, '')

  const areaPath = svgPts.length > 0
    ? `${linePath} L ${svgPts[n - 1].x},${PT + CH} L ${svgPts[0].x},${PT + CH} Z`
    : ''

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((pct) => {
    const val = maxRev * pct
    return { y: PT + CH - pct * CH, label: val === 0 ? '$0' : val >= 1000 ? `$${(val / 1000).toFixed(1)}k` : `$${val.toFixed(0)}` }
  })

  const xLabelStep = n > 14 ? Math.ceil(n / 8) : 1

  if (loading) return <AdminLoader />

  return (
    <div className="space-y-5">
      <h2 className="text-2xl font-semibold text-[#202734]">Dashboard Overview</h2>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metricCardDefs.map((card) => {
          const Icon = card.icon
          const m = dynamicMetrics[card.key]
          return (
            <article key={card.key} className="rounded-xl border border-[#e7e9ef] bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className={`grid h-10 w-10 place-items-center rounded-lg bg-[#f8fafc] ${card.accent}`}>
                  <Icon className="text-lg" />
                </span>
                <span className={`text-xs font-semibold ${m.positive ? 'text-emerald-500' : 'text-red-400'}`}>
                  {m.delta}
                </span>
              </div>
              <p className="mt-4 text-xs text-[#8d97a7]">{card.title}</p>
              <p className="mt-1 text-2xl font-semibold leading-none text-[#202734]">
                {card.format(stats[card.key])}
              </p>
            </article>
          )
        })}
      </div>

      <article className="rounded-xl border border-[#e7e9ef] bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-[#202734]">Revenue Analytics</h3>
            <p className="mt-0.5 text-[10px] text-[#8d97a7]">
              Total: <span className="font-semibold text-[#202734]">${chartData.reduce((s, d) => s + d.revenue, 0).toFixed(2)}</span> in selected period
            </p>
          </div>
          <div className="relative">
            <select
              value={chartPeriod}
              onChange={(e) => setChartPeriod(e.target.value)}
              className="h-[38px] w-[150px] appearance-none rounded-lg border border-[#e5e7eb] bg-white pl-3 pr-8 text-sm text-[#374151] outline-none focus:border-[#f08a2f] focus:ring-2 focus:ring-[#f08a2f]/15"
            >
              <option value="7">Last 7 Days</option>
              <option value="30">Last 30 Days</option>
              <option value="6m">Last 6 Months</option>
            </select>
            <FiChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[#9ca3af]" />
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl bg-[#fbfbfc]">
          <svg viewBox={`0 0 ${VW} ${VH}`} className="h-[280px] w-full min-w-[320px]" preserveAspectRatio="xMidYMid meet">
            <defs>
              <linearGradient id="chart-area-grad" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#f08a2f" stopOpacity="0.22" />
                <stop offset="100%" stopColor="#f08a2f" stopOpacity="0.01" />
              </linearGradient>
            </defs>

            {yTicks.map((tick) => (
              <g key={tick.y}>
                <line x1={PL} y1={tick.y} x2={VW - PR} y2={tick.y} stroke="#eef1f4" strokeWidth="1" />
                <text x={PL - 6} y={tick.y + 4} fontSize="9" fill="#b0bac7" textAnchor="end">{tick.label}</text>
              </g>
            ))}

            {areaPath && <path d={areaPath} fill="url(#chart-area-grad)" />}
            {linePath && <path d={linePath} fill="none" stroke="#f08a2f" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />}

            {svgPts.map((pt, i) => (
              <g key={i}>
                {i % xLabelStep === 0 && (
                  <text x={pt.x} y={VH - 4} fontSize="9" fill="#97a2b3" textAnchor="middle">{pt.label}</text>
                )}
                <circle cx={pt.x} cy={pt.y} r="14" fill="transparent" style={{ cursor: 'pointer' }}
                  onMouseEnter={() => setHoveredPoint(pt)} onMouseLeave={() => setHoveredPoint(null)} />
                <circle cx={pt.x} cy={pt.y}
                  r={hoveredPoint?.label === pt.label && hoveredPoint?.x === pt.x ? 6 : 4}
                  fill="white" stroke={pt.revenue > 0 ? '#f08a2f' : '#d1d5db'} strokeWidth="2"
                  style={{ transition: 'r 0.15s', pointerEvents: 'none' }} />
              </g>
            ))}

            {(() => {
              if (!hoveredPoint) return null
              const TW = 120, TH = 44
              const tx = Math.min(Math.max(hoveredPoint.x - TW / 2, PL), VW - PR - TW)
              const showBelow = hoveredPoint.y - TH - 10 < PT + 2
              const ty = showBelow ? hoveredPoint.y + 10 : hoveredPoint.y - TH - 10
              return (
                <g style={{ pointerEvents: 'none' }}>
                  <rect x={tx} y={ty} width={TW} height={TH} rx="6" ry="6" fill="white" stroke="#e5e7eb" strokeWidth="1"
                    filter="drop-shadow(0 2px 6px rgba(0,0,0,0.10))" />
                  <text x={tx + TW / 2} y={ty + 15} fontSize="9" fill="#8d97a7" textAnchor="middle">{hoveredPoint.label}</text>
                  <text x={tx + TW / 2} y={ty + 31} fontSize="12" fontWeight="600" fill="#202734" textAnchor="middle">
                    ${hoveredPoint.revenue.toFixed(2)}
                  </text>
                </g>
              )
            })()}

            {svgPts.length === 0 && (
              <text x={VW / 2} y={VH / 2} fontSize="12" fill="#c5cdd8" textAnchor="middle">No revenue data for this period</text>
            )}
          </svg>
        </div>
      </article>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <article className="rounded-xl border border-[#e7e9ef] bg-white p-5 shadow-sm">
          <p className="text-xs text-[#8d97a7]">Total Products</p>
          <p className="mt-1 text-2xl font-semibold text-[#202734]">{products.length}</p>
          <p className="mt-1 text-[10px] text-[#aab0ba]">{stats.categories} categories · {stats.collections} collections</p>
        </article>
        <article className="rounded-xl border border-[#e7e9ef] bg-white p-5 shadow-sm">
          <p className="text-xs text-[#8d97a7]">Avg. Order Value</p>
          <p className="mt-1 text-2xl font-semibold text-[#202734]">
            {stats.orders > 0 ? `$${(stats.revenue / stats.orders).toFixed(2)}` : '$0.00'}
          </p>
          <p className="mt-1 text-[10px] text-[#aab0ba]">Across {stats.orders} orders</p>
        </article>
        <article className="rounded-xl border border-[#e7e9ef] bg-white p-5 shadow-sm sm:col-span-2 lg:col-span-1">
          <p className="text-xs text-[#8d97a7]">Order Completion Rate</p>
          <p className="mt-1 text-2xl font-semibold text-[#202734]">
            {stats.orders > 0 ? `${(((stats.orders - stats.pendingOrders) / stats.orders) * 100).toFixed(1)}%` : '—'}
          </p>
          <p className="mt-1 text-[10px] text-[#aab0ba]">{stats.pendingOrders} orders pending</p>
        </article>
      </div>

      {allOrders.length > 0 && (
        <article className="rounded-xl border border-[#e7e9ef] bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-base font-semibold text-[#202734]">Recent Orders</h3>
          <div className="overflow-x-auto">
            <table className="table text-sm">
              <thead>
                <tr className="border-b border-[#f0f2f5] text-[#8d97a7]">
                  <th>Order ID</th><th>Customer</th><th>Amount</th><th>Status</th><th>Date</th>
                </tr>
              </thead>
              <tbody>
                {[...allOrders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5).map((order) => (
                  <tr key={order.orderId} className="border-b border-[#f0f2f5]">
                    <td className="font-mono text-xs text-[#202734]">#{order.orderId}</td>
                    <td className="text-xs text-[#8b95a4]">{order.userEmail || 'guest'}</td>
                    <td className="font-semibold text-[#202734]">${Number(order.total).toFixed(2)}</td>
                    <td>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${order.status === 'pending' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>
                        {order.status || 'pending'}
                      </span>
                    </td>
                    <td className="text-xs text-[#9ca3af]">{new Date(order.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      )}
    </div>
  )
}

export default AdminDashboardTab
