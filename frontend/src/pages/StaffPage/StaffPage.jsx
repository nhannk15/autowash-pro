import Sidebar from "../../components/Layout/Sidebar/Sidebar";
import { Outlet } from "react-router-dom";

export default function StaffPage() {
    return (
        <Sidebar>
            <Outlet />
        </Sidebar>
    )
}