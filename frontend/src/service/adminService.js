import axios from "axios";

const API = import.meta.env.VITE_BACKEND_ABSOLUTE_PATH;

// Lấy danh sách tất cả khách hàng
export async function getCustomers(params) {
    const response = await axios.get(`${API}/api/admin/customers`, {
        params,
        withCredentials: true,
    });
    return response.data;
}

export async function recoverCustomer(customerId) {
    const response = await axios.put(`${API}/api/admin/customers/restore/${customerId}`, null, {
        withCredentials: true,
    });
    return response.data;
}

export async function deleteCustomer(customerId) {
    const response = await axios.delete(`${API}/api/admin/customers/${customerId}`, {
        withCredentials: true,
    });
    return response.data;
}

export async function getStaffs(params) {
    const response = await axios.get(`${API}/api/admin/staffs`, {
        params,
        withCredentials: true,
    });
    return response.data;
}

export async function addStaff({ fullName, email, password, phoneNumber, hiredDate }) {
    const response = await axios.post(`${API}/api/admin/staffs`, {
        fullName,
        email,
        password,
        phoneNumber,
        hiredDate
    }, {
        withCredentials: true,
    });
    return response.data;
}

export async function recoverStaff(staffId) {
    const response = await axios.put(`${API}/api/admin/staffs/restore/${staffId}`, null, {
        withCredentials: true,
    });
    return response.data;
}

export async function deleteStaff(staffId) {
    const response = await axios.delete(`${API}/api/admin/staffs/${staffId}`, {
        withCredentials: true,
    });
    return response.data;
}

// Lấy danh sách tất cả khuyến mãi
export async function getPromotions() {
    const response = await axios.get(`/api/promotions`);
    return response.data;
}

// Lấy danh sách tất cả dịch vụ
export async function getServices() {
    const response = await axios.get(`/api/services`);
    return response.data;
}

// Thêm khuyến mãi mới
export async function createPromotion(payload) {
    const response = await axios.post(`/api/promotions`, payload);
    return response.data;
}

// Cập nhật khuyến mãi
export async function updatePromotion(id, payload) {
    const response = await axios.put(`/api/promotions/${id}`, payload);
    return response.data;
}

// Xóa khuyến mãi
export async function deletePromotion(id) {
    const response = await axios.delete(`/api/promotions/${id}`);
    return response.data;
}