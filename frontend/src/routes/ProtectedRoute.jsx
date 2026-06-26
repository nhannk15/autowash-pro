import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ROLE_HOME = {
    ADMIN: "/admin",
    STAFF: "/staff",
    CUSTOMER: "/",
};

export function ProtectedRoute({ children, allowedRoles, requireAuth = true, redirectTo = "/login" }) {
    const { user, loading } = useAuth();

    // Đang fetch user (F5, timeout session...) → chờ, không redirect vội
    if (loading) return null; // hoặc <Spinner /> nếu có

    // Nếu yêu cầu đăng nhập mà chưa có user → về login
    if (requireAuth && !user) return <Navigate to={redirectTo} replace />;

    // Nếu đã có user (bất kể requireAuth là true hay false), kiểm tra role
    if (user) {
        const role = user?.role?.toUpperCase();

        // Đã đăng nhập nhưng sai role → redirect về đúng trang của role đó
        if (allowedRoles && !allowedRoles.includes(role)) {
            const correctPath = ROLE_HOME[role] ?? "/";
            return <Navigate to={correctPath} replace />;
        }
    }

    return children ? children : <Outlet />;
}