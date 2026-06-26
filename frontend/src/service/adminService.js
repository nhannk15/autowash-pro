import axios from "axios";

const API = import.meta.env.VITE_BACKEND_ABSOLUTE_PATH;

export async function getDashboardSummary({ startDate, endDate, month, year }) {
    const response = await axios.post(`${API}/api/admin/dashboard/summary`, {
        startDate,
        endDate,
        month,
        year
    }, {
        withCredentials: true,
    });
    return response.data;
}

export async function getServiceDistribution({ startDate, endDate, month, year }) {
    const response = await axios.post(`${API}/api/admin/dashboard/service-distribution`, {
        startDate,
        endDate,
        month,
        year
    }, {
        withCredentials: true,
    });
    return response.data;
}

export async function getRevenueChart({ startDate, endDate, month, year }) {
    const response = await axios.post(`${API}/api/admin/dashboard/revenue-chart`, {
        startDate,
        endDate,
        month,
        year
    }, {
        withCredentials: true,
    });
    return response.data;
}

export async function getPeakHours({ startDate, endDate, month, year }) {
    const response = await axios.post(`${API}/api/admin/dashboard/peak-hours`, {
        startDate,
        endDate,
        month,
        year
    }, {
        withCredentials: true,
    });
    return response.data;
}

export async function getRecentTransactions() {
    const response = await axios.get(`${API}/api/admin/dashboard/recent-transactions`, {
        withCredentials: true,
    });
    return response.data;
}

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

export async function getAllServices() {
    const response = await axios.get(`${API}/api/services`, {
        withCredentials: true,
    });
    return response.data;
}

export async function addService({ serviceName, description, durationMinutes, pointMultiplier, category, steps, highLights, priceForSedan, priceForSuv, image }) {
    const response = await axios.post(`${API}/api/admin/services`, {
        serviceName,
        description,
        durationMinutes,
        pointMultiplier,
        category,
        steps,
        highLights,
        priceForSedan,
        priceForSuv,
        image
    }, {
        withCredentials: true,
    });
    return response.data;
}

export async function recoverService(serviceId) {
    const response = await axios.put(`${API}/api/admin/services/restore/${serviceId}`, null, {
        withCredentials: true,
    });
    return response.data;
}

export async function deleteService(serviceId) {
    const response = await axios.delete(`${API}/api/admin/services/${serviceId}`, {
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

// Lấy danh sách tất cả phần thưởng (Rewards)
export async function getRewards() {
    const response = await axios.get(`${API}/api/admin/rewards`, {
        withCredentials: true,
    });
    return response.data;
}

// Thêm phần thưởng mới
export async function createReward(payload) {
    const response = await axios.post(`${API}/api/admin/rewards`, payload, {
        withCredentials: true,
    });
    return response.data;
}

// Cập nhật phần thưởng
export async function updateReward(id, payload) {
    const response = await axios.put(`${API}/api/admin/rewards/${id}`, payload, {
        withCredentials: true,
    });
    return response.data;
}

// Xóa/Vô hiệu hóa phần thưởng
export async function deleteReward(id) {
    const response = await axios.delete(`${API}/api/admin/rewards/${id}`, {
        withCredentials: true,
    });
    return response.data;
}

// Lấy danh sách bảng giá dịch vụ (Service Prices)
export async function getServicePrices() {
    const response = await axios.get(`${API}/api/service-prices`, {
        withCredentials: true,
    });
    return response.data;
}

// Lấy danh sách tất cả hạng thành viên (Membership Tiers) cho Admin
export async function getAdminMembershipTiers() {
    const response = await axios.get(`${API}/api/admin/membership-tiers`, {
        withCredentials: true,
    });
    return response.data;
}

// Cập nhật thông tin/cấu hình hạng thành viên
export async function updateAdminMembershipTier(id, payload) {
    const response = await axios.put(`${API}/api/admin/membership-tiers/${id}`, payload, {
        withCredentials: true,
    });
    return response.data;
}