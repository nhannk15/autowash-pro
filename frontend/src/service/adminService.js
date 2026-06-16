import axios from "axios";

// Lấy danh sách tất cả khuyến mãi
export async function getPromotions() {
    const response = await axios.get(`/api/promotions`);
    return response.data;
}

// Thêm khuyến mãi mới
export async function createPromotion(payload) {
    const response = await axios.post(`/api/promotions`, payload, {
        withCredentials: true
    });
    return response.data;
}

// Cập nhật khuyến mãi
export async function updatePromotion(id, payload) {
    const response = await axios.put(`/api/promotions/${id}`, payload, {
        withCredentials: true
    });
    return response.data;
}

// Xóa khuyến mãi
export async function deletePromotion(id) {
    const response = await axios.delete(`/api/promotions/${id}`, {
        withCredentials: true
    });
    return response.data;
}
