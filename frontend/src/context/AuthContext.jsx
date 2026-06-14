import { createContext, useContext, useEffect, useState } from "react";
import { getMe, loginEmail, logout as logoutApi, signupApi } from "../service/authService";

const AuthContext = createContext(null);
// tạo ra một đối tượng Context – đóng vai trò như một "kênh truyền tin" giữa các component mà không cần phải truyền props qua từng tầng (Prop Drilling).
// null-chốt an toàn: Giả sử bạn vô tình quên bọc một component nào đó bằng <AuthProvider>, thì khi component đó gọi useAuth(), nó sẽ nhận được giá trị null (thay vì lỗi hoặc một object rỗng không mong muốn).
export function AuthProvider({ children }) {
    // ({ children }): Đây là kỹ thuật Object Destructuring để lấy trực tiếp thuộc tính children từ props.
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getMe()
            .then((data) => setUser(data))
            .catch(() => setUser(null))
            .finally(() => setLoading(false));
    }, []);

    async function login(email, password) {
        await loginEmail(email, password);
        const data = await getMe();
        setUser(data);
        return data;
    }

    async function signup(email, password, confirmPassword, fullName, dob, phone) {
        await signupApi(email, password, confirmPassword, fullName, dob, phone);
    }

    async function logout() {
        await logoutApi();
        setUser(null);
    }

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, signup }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);