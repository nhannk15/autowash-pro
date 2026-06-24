import axios from "axios";

// We can now extract API URL from the .env file.
const API = import.meta.env.VITE_BACKEND_ABSOLUTE_PATH;

export async function getMe() {
    const response = await axios.get(`${API}/api/users/me`, {
        // Gửi một yêu cầu GET đến endpoint /api/users/me của backend.
        // thiếu await: Dòng code const response = axios.get(...) sẽ thực thi ngay lập tức, nhưng nó không đợi server phản hồi. Thay vào đó, biến response sẽ ngay lập tức được gán bằng một đối tượng Promise (pending)
        // =>  Khi bạn truy cập response.data, bạn đang truy cập thuộc tính .data của một đối tượng Promise, cái mà chắc chắn là undefined. Do đó, ứng dụng sẽ văng lỗi (thường là TypeError: Cannot read properties of undefined (reading 'data')).
        withCredentials: true,
        // ra lệnh cho axios yêu cầu trình duyệt phải đính kèm các cookie (chứa JWT) vào header Cookie của request.
        // Kết quả: Backend nhận được request, kiểm tra cookie, đọc JWT từ đó và xác thực người dùng.
    });
    return response.data;
}

export async function signupApi(email, password, confirmPassword, fullName, dob, phone) {
    const response = await axios.post(
        `${API}/auth/register`,
        {
            email,
            password,
            confirmPassword,
            fullName,
            dateOfBirth: dob,
            phoneNumber: phone,
        },
        { withCredentials: true }
    );
    return response.data;
}

export async function loginEmail(email, password) {
    await axios.post(
        `${API}/auth/login`,
        { email, password },
        { withCredentials: true }
    );
}

export function loginGoogle() {
    window.location.href = `${API}/oauth2/authorization/google`;
}

export async function logout() {
    await axios.post(`${API}/auth/logout`, null, {
        withCredentials: true,
    });
}

export async function forgotPasswordApi(email) {
    const response = await axios.post(
        `${API}/auth/forgot-password`,
        { email },
        { withCredentials: true }
    );
    return response.data;
}

export async function verifyOtpApi(email, otp) {
    const response = await axios.post(
        `${API}/auth/verify-otp`,
        { email, otp },
        { withCredentials: true }
    );
    return response.data;
}

export async function resetPasswordApi(email, otp, newPassword, confirmPassword) {
    const response = await axios.post(
        `${API}/auth/reset-password`,
        { email, otp, newPassword, confirmPassword },
        { withCredentials: true }
    );
    return response.data;
}