import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Layout/Header/Navbar.jsx'
import Footer from './components/Layout/Footer/Footer.jsx'
import Home from './pages/HomePage/Home.jsx'
import DichVu from './pages/DichVuPage/DichVu.jsx'
import Blog from './pages/BlogPage/Blog.jsx'
import BlogDetail from './pages/BlogPage/BlogDetail.jsx'
import BlogDetail2 from './pages/BlogPage/BlogDetail2.jsx'
import BlogDetail3 from './pages/BlogPage/BlogDetail3.jsx'
import BlogDetail4 from './pages/BlogPage/BlogDetail4.jsx'
import BlogDetail5 from './pages/BlogPage/BlogDetail5.jsx'
import LoginPage from './pages/LoginPage/LoginPage.jsx'

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
      <Route path="/blog" element={
        <MainLayout><Blog /></MainLayout>
      } />
      <Route path="/blog/huong-dan-tay-o-kinh-o-to" element={
        <MainLayout><BlogDetail /></MainLayout>
      } />
      <Route path="/blog/bang-gia-ve-sinh-noi-that-o-to-tai-nha" element={
        <MainLayout><BlogDetail2 /></MainLayout>
      } />
      <Route path="/blog/cach-cham-soc-ngoai-that-o-to-tai-nha" element={
        <MainLayout><BlogDetail3 /></MainLayout>
      } />
      <Route path="/blog/tieu-chi-danh-gia-trung-tam-rua-xe-o-to" element={
        <MainLayout><BlogDetail4 /></MainLayout>
      } />
      <Route path="/blog/cach-cham-soc-noi-that-o-to-tai-nha" element={
        <MainLayout><BlogDetail5 /></MainLayout>
      } />
      <Route path="/dang-nhap" element={
        <>
        <LoginPage />
        <Footer />
        </>
      } />
      {/* Trang Login: không có Navbar/Footer */}

    </Routes>
  )
}

export default App
