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

// ══════════════════════════════════════════════════════════
// ── Booking.jsx sử dụng ───────────────────────────────────
// ══════════════════════════════════════════════════════════

// api1 - lấy danh sách xe của khách hàng đang đăng nhập
export async function getVehicleByCustomer() {
    const response = await axios.get(`/api/vehicles/user`);
    // Khi dùng đường dẫn tương đối /api/vehicles/user: Trình duyệt coi đây là yêu cầu cùng nguồn (Same-Origin) nên sẽ tự động đính kèm Cookie chứa mã JWT của bạn gửi lên Server.
    return response.data
}

// api2 - lấy chương trình khuyến mãi áp dụng theo thời gian đặt lịch
export async function getApplicablePromotion(bookingDateTime) {
    const response = await axios.post('/api/promotions/applicable-promotions', { bookingDateTime });
    return response.data;
}

// api3 - lấy danh sách dịch vụ (basic / addon / premium)
export async function getService() {
    const response = await axios.get("/api/services");
    return response.data
}

// api4 - lấy danh sách khung giờ còn trống (dịch vụ thường)
export async function getAvailableSlot(selectedDate) {
    const response = await axios.get(`/api/bookings/available-slots?date=${selectedDate}`);
    return response.data
}

// api5 - lấy danh sách khung giờ còn trống (dịch vụ cao cấp / premium)
export async function getPremiumAvailableSlot(selectedDate) {
    const response = await axios.get(`/api/bookings/premium-service/available-slots?date=${selectedDate}`);
    return response.data
}

// api6 - tạo lịch đặt xe (nếu có staffId thì gắn thêm vào query param)
export async function createBooking(payload) {
    const { staffId, ...body } = payload;
    const url = staffId
        ? `/api/v2/bookings?staffId=${staffId}`
        : `/api/v2/bookings`;
    const response = await axios.post(url, body);
    return response.data;
}

// api7 - hủy lịch đặt xe
export async function cancelBooking(payload) {
    const response = await axios.post("/api/cancel-booking", payload);
    return response.data;
}

// api8 - tạo link thanh toán đặt cọc qua VNPay
export async function createVNPayPayment(payload) {
    const response = await axios.post("/api/payment/vnpay/create", payload);
    return response.data;
}

// api9 - lấy thông tin hóa đơn đang chờ đặt cọc (sau khi tạo booking)
export async function getPendingDeposit() {
    const response = await axios.get('/api/bookings/pending-deposit')
    return response.data
}

// api10 - lấy danh sách kỹ thuật viên rảnh theo khung giờ và ngày đã chọn
export async function getAllStaffs(timeSlotId, bookingDate) {
    const response = await axios.get(
        `/api/customer/all-staffs?timeSlotId=${timeSlotId}&bookingDate=${bookingDate}`
    );
    return response.data;
}

// api11 - lấy danh sách voucher của khách hàng
export async function getVoucher() {
    const response = await axios.get('/api/vouchers');
    return response.data;
}

// ══════════════════════════════════════════════════════════
// ── MyCars.jsx sử dụng ───────────────────────────────────
// ══════════════════════════════════════════════════════════

// api12 - lấy danh sách loại xe (SEDAN / SUV)
export async function getVehicleType() {
    const response = await axios.get('/api/vehicle-types');
    return response.data
}

// api13 - thêm xe mới của khách hàng
export async function createVehicle(payload) {
    await axios.post('/api/vehicles', payload)
}

// api14 - cập nhật thông tin xe theo id
export async function updateVehicle(id, payload) {
    await axios.put(`/api/vehicles/${id}`, payload)
}

// api15 - xóa xe theo id
export async function deleteVehicle(id) {
    await axios.delete(`/api/vehicles/${id}`);
}

// ══════════════════════════════════════════════════════════
// ── Overview.jsx sử dụng ─────────────────────────────────
// ══════════════════════════════════════════════════════════

// api16 - lấy hạng thành viên (membership tier) của khách hàng
export async function getMembershipTier() {
    const response = await axios.get('/api/membership-tier')
    return response.data
}

// api17 - lấy danh sách lịch hẹn sắp tới của khách hàng
export async function getUpcomingBooking() {
    const response = await axios.get('/api/customer/upcoming-bookings')
    return response.data
}

// api18 - lấy điểm thưởng (reward points) của khách hàng
export async function getReward() {
    const response = await axios.get('/api/customer/rewards')
    return response.data
}

// api19 - đổi điểm thưởng lấy voucher
export async function exchangeVoucher(payload) {
    const response = await axios.post('/api/voucher/exchange', payload);
    return response.data;
}

// api20 - lấy lịch sử hoạt động gần đây của khách hàng
export async function getRecentActivities() {
    const response = await axios.get('/api/customer/recent-activities')
    return response.data
}

// ══════════════════════════════════════════════════════════
// ── Notification APIs ─────────────────────────────────────
// ══════════════════════════════════════════════════════════

// api21 - lấy toàn bộ thông báo của khách hàng
export async function getAllNotifications() {
    const response = await axios.get('/api/notifications');
    return response.data;
}

// api22 - lấy danh sách thông báo chưa đọc
export async function getUnreadNotifications() {
    const response = await axios.get('/api/notifications/unread');
    return response.data;
}

// api23 - lấy số lượng thông báo chưa đọc
export async function getUnreadCount() {
    const response = await axios.get('/api/notifications/unread-count');
    return response.data; // { unreadsCount: number }
}

// api24 - đánh dấu một thông báo đã đọc theo id
export async function markNotificationRead(notificationId) {
    const response = await axios.put(`/api/notifications/${notificationId}/read`);
    return response.data;
}

// api25 - đánh dấu tất cả thông báo là đã đọc
export async function markAllNotificationsRead() {
    const response = await axios.put('/api/notifications/read-all');
    return response.data;
}

// ══════════════════════════════════════════════════════════
// ── Payment APIs ──────────────────────────────────────────
// ══════════════════════════════════════════════════════════

// api26 - lấy lịch sử thanh toán (billing history) của khách hàng
export async function getCustomerBillingHistory() {
    const response = await axios.get('/api/billings/customer/billing-history');
    return response.data;
}

// api27 - kiểm tra trùng lịch của xe
export async function checkVehicleConflict(timeSlotId, vehicleId, bookingDate) {
    const response = await axios.get('/api/customer/available-slots/check-consecutive-vehicle', {
        params: { timeSlotId, vehicleId, bookingDate }
    });
    return response.data;
}