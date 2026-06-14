import { Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Layout/Header/Navbar.jsx'
import Footer from './components/Layout/Footer/Footer.jsx'
import Home from './pages/HomePage/Home.jsx'
import Service from './pages/ServicePage/Service.jsx'
import Blog from './pages/BlogPage/Blog.jsx'
import BlogDetail from './pages/BlogPage/BlogDetail.jsx'
import BlogDetail2 from './pages/BlogPage/BlogDetail2.jsx'
import BlogDetail3 from './pages/BlogPage/BlogDetail3.jsx'
import BlogDetail4 from './pages/BlogPage/BlogDetail4.jsx'
import BlogDetail5 from './pages/BlogPage/BlogDetail5.jsx'
import LoginPage from './pages/LoginPage/LoginPage.jsx'
import CustomerPage from './pages/CustomerPage/CustomerPage.jsx'
import Overview from './pages/CustomerPage/components/Overview.jsx'
import MyCars from './pages/CustomerPage/components/MyCars.jsx'
import BookingList from './pages/CustomerPage/components/BookingList.jsx'
import Payment from './pages/CustomerPage/components/Payment.jsx'
import PersonalProfile from './pages/CustomerPage/components/PersonalProfile.jsx'
import RegisterPage from './pages/RegisterPage/RegisterPage.jsx'
import ForgotPassPage from './pages/ForgotPassPage/ForgotPassPage.jsx'
import StaffPage from './pages/StaffPage/StaffPage.jsx'
import StaffDashboard from './pages/StaffPage/components/StaffDashboard.jsx'
import Queue from './pages/StaffPage/components/Queue.jsx'
import Checkin from './pages/StaffPage/components/Checkin.jsx'
import StaffPayment from './pages/StaffPage/components/Payment.jsx'
import History from './pages/StaffPage/components/History.jsx'
import Profile from './pages/StaffPage/components/Profile.jsx'

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
        <MainLayout><Service /></MainLayout>
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
      <Route path="/login" element={
        <>
          <LoginPage />
          <Footer />
        </>
      } />
      <Route path="/signup" element={
        <>
          <RegisterPage />
          <Footer />
        </>
      } />
      <Route path="/forgotpass" element={
        <>
          <ForgotPassPage />
          <Footer />
        </>
      } />
      {/* Trang Cá nhân (Customer Dashboard) */}
      <Route path="/ca-nhan" element={
        <MainLayout><CustomerPage /></MainLayout>
      }>
        <Route index element={<Navigate to="ho-so" replace />} />
        <Route path="tong-quan" element={<Overview />} />
        <Route path="xe-cua-toi" element={<MyCars />} />
        <Route path="dat-lich" element={<BookingList />} />
        <Route path="thanh-toan" element={<Payment />} />
        <Route path="ho-so" element={<PersonalProfile />} />
      </Route>
      <Route path="/staff" element={
        <>
          <Navbar />
          <StaffPage />
        </>
      }>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<StaffDashboard />} />
        <Route path="queue" element={<Queue />} />
        <Route path="checkin" element={<Checkin />} />
        <Route path="payment" element={<StaffPayment />} />
        <Route path="history" element={<History />} />
        <Route path="profile" element={<Profile />} />
      </Route>

    </Routes>
  )
}

export default App
