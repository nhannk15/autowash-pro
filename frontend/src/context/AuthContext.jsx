import { createContext, useContext, useEffect, useState } from "react";
import { getMe, loginEmail, logout as logoutApi, signupApi } from "../service/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
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