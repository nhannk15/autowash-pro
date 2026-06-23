import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ROLE_HOME = {
    ADMIN: "/admin",
    STAFF: "/staff",
    CUSTOMER: "/ca-nhan",
};

export function ProtectedRoute({ children, allowedRoles, redirectTo = "/login" }) {
    const { user, loading } = useAuth();

    // Đang fetch user (F5, timeout session...) → chờ, không redirect vội
    if (loading) return null; // hoặc <Spinner /> nếu có

    // Chưa đăng nhập → về login
    if (!user) return <Navigate to="/login" replace />;

    const role = user?.role?.toUpperCase();

    // Đã đăng nhập nhưng sai role → redirect về đúng trang của role đó
    if (allowedRoles && !allowedRoles.includes(role)) {
        const correctPath = ROLE_HOME[role] ?? "/";
        return <Navigate to={correctPath} replace />;
    }

    return children;
}