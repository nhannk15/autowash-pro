import axios from "axios";

// chỉ cần dùng đường dẫn tương đối vì
// Trong file cấu hình 
// vite.config.js
// , bạn đã cấu hình tính năng proxy của Vite:

// server: {
//   port: 3000,
//   proxy: {
//     '/api': 'http://localhost:8080',
//     '/auth': 'http://localhost:8080',
//   }
// }
// Cách thức hoạt động: Khi bạn gọi API với đường dẫn /api/vehicles/user, trình duyệt sẽ gửi request tới Server Frontend (http://localhost:3000/api/vehicles/user).
// Vite phát hiện request bắt đầu bằng /api, nó sẽ tự động đứng ra làm trung gian gửi tiếp (proxy) request này sang server backend thực tế là http://localhost:8080/api/vehicles/user và trả lại kết quả cho frontend.

// BookingList.jsx sử dụng
export async function getVehicleByCustomer() {
    const response = await axios.get(`/api/vehicles/user`);
    // Khi dùng đường dẫn tương đối /api/vehicles/user: Trình duyệt coi đây là yêu cầu cùng nguồn (Same-Origin) nên sẽ tự động đính kèm Cookie chứa mã JWT của bạn gửi lên Server.
    return response.data
}

export async function getPromotion() {
    const response = await axios.get('/api/promotions');
    return response.data
}
export async function getService() {
    const response = await axios.get("/api/services");
    return response.data
}

export async function getAvailableSlot(selectedDate) {
    const response = await axios.get(`/api/bookings/available-slots?date=${selectedDate}`);
    return response.data
}

export async function createBooking(payload) {
    await axios.post("/api/bookings", payload);
}

// MyCar.jsx sử dụng
export async function getVehicleType() {
    const response = await axios.get('/api/vehicle-types');
    return response.data
}

export async function createVehicle(payload) {
    await axios.post('/api/vehicles', payload)
}

export async function updateVehicle(id, payload) {
    await axios.put(`/api/vehicles/${id}`, payload)
}

export async function deleteVehicle(id) {
    await axios.delete(`/api/vehicles/${id}`);
}

export async function getMembershipTier() {
    const response = await axios.get('/api/membership-tier')
    return response.data
}
export async function getUpcomingBooking() {
    const response = await axios.get('/api/customer/upcoming-bookings')
    return response.data
}
export async function getReward() {
    const response = await axios.get('/api/customer/rewards')
    return response.data
}

export async function exchangeVoucher(payload) {
    const response = await axios.post('/api/voucher/exchange', payload);
    return response.data;
}