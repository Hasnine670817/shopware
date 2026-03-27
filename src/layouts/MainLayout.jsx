import { Outlet } from 'react-router-dom'
import Footer from '../components/Footer'
import Navbar from '../components/Navbar'

const MainLayout = () => {
  return (
    <div data-theme="premiumlight" className="bg-base-100 text-neutral">
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

export default MainLayout
