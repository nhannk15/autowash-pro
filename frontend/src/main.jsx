import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  // gọi thẻ div có id là root ở file index.html. Trong thẻ div đó sẽ render ra nội dung của component App
  <StrictMode>
    {/* khiến các component chạy 2 lần để phát hiện lỗi */}
    <BrowserRouter>
      {/* được import từ thư viện react-router-dom. nó đóng vai trò kiểm soát sư thay đổi trên thanh URL. nếu thanh URL thay đổi thì BrowserRouter sẽ được gọi đến. */}
      <AuthProvider>
        {/*  Việc đặt nó bao quanh App đảm bảo rằng mọi component con bên trong (dù ở cấp độ sâu thế nào) đều có thể truy cập được các giá trị user, loading, login,... thông qua hook (useAuth).  */}
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
