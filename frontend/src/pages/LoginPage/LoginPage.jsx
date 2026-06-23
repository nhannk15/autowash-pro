import { LoginForm } from "../../components/LoginForm/LoginForm.jsx";
import "./LoginPage.css";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

export default function LoginPage() {
    const { user, loading } = useAuth();

    if (loading) return null;

    if (user) {
        const role = user?.role?.toUpperCase();
        if (role === "STAFF") return <Navigate to="/staff" replace />;
        if (role === "ADMIN") return <Navigate to="/admin" replace />;
        if (role === "CUSTOMER") return <Navigate to="/ca-nhan" replace />;
    }
    return (
        <div className="login-page">
            <LoginForm />
        </div>
    );
}
