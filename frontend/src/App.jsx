import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Layout/Header/Navbar.jsx'
import Footer from './components/Layout/Footer/Footer.jsx'
import Home from './pages/HomePage/Home.jsx'
import DichVu from './pages/DichVuPage/DichVu.jsx'
import HeThong from './pages/HeThongPage/HeThong.jsx'
import Blog from './pages/BlogPage/Blog.jsx'


// Layout chung: Navbar + nội dung + Footer
function MainLayout({ children }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </>
  )
}

function App() {
  return (
    <Routes>
      {/* Các trang có Navbar + Footer */}
      <Route path="/" element={
        <MainLayout><Home /></MainLayout>
      } />
      <Route path="/dich-vu" element={
        <MainLayout><DichVu /></MainLayout>
      } />
      <Route path="/he-thong" element={
        <MainLayout><HeThong /></MainLayout>
      } />
      <Route path="/blog" element={
        <MainLayout><Blog /></MainLayout>
      } />

      {/* Trang Login: không có Navbar/Footer */}

    </Routes>
  )
}

export default App
