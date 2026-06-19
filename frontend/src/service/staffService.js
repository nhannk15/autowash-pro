import axios from "axios";

const API = import.meta.env.VITE_BACKEND_ABSOLUTE_PATH;

export async function getAllBays() {
    const response = await axios.get(`${API}/api/staff/wash-bays`, {
        withCredentials: true,
    });
    return response.data;
}

export async function getUpcomingBookings() {
    const response = await axios.get(`${API}/api/staff/upcoming-bookings`, {
        withCredentials: true,
    });
    return response.data;
}

export async function getTodayBookings() {
    const response = await axios.get(`${API}/api/staff/today-bookings`, {
        withCredentials: true,
    });
    return response.data;
}

export async function completeSession(bookingId) {
    const response = await axios.post(`${API}/api/staff/wash-sessions/complete`,
        { bookingId },
        { withCredentials: true }
    );
    return response.data;
}

export async function searchBookingByQR(bookingCode) {
    const response = await axios.get(`${API}/api/bookings/booking-code`, {
        params: { bookingCode },
        withCredentials: true,
    });
    return response.data;
}

export async function confirmBooking(bookingId) {
    const response = await axios.post(`${API}/api/staff/wash-sessions/start`, {
        bookingId,
    }, { withCredentials: true });
    return response.data;
}

export async function getBillByBookingId(bookingId) {
    const response = await axios.post(`${API}/api/billings`,
        [bookingId], {
        withCredentials: true,
    });
    return response.data;
}

export async function confirmPaymentByCash(billingId) {
    const response = await axios.post(`${API}/api/billings/complete/cash`, billingId, {
        withCredentials: true,
        headers: { 'Content-Type': 'application/json' }
    });
    return response.data;
}

export async function confirmPaymentByBank(billingId) {
    const response = await axios.post(`${API}/api/billings/complete/bank`, billingId, {
        withCredentials: true,
        headers: { 'Content-Type': 'application/json' }
    });
    return response.data;
}

export async function validateVoucher(customerId, billingId, voucherCode) {
    const response = await axios.post(`${API}/api/billings/apply-voucher`,
        {
            "customerId": customerId,
            "billingId": billingId,
            "voucherCode": voucherCode
        },
        { withCredentials: true }
    );
    return response.data;
}

export async function getStaffProfile(id) {
    const response = await axios.get(`${API}/api/users/${id}`, {
        withCredentials: true,
    });
    return response.data.data;
}

export async function updateStaffProfile(id, phoneNumber, avatarUrl) {
    const response = await axios.patch(
        `${API}/api/users/${id}`,
        { phoneNumber, avatarUrl },
        { withCredentials: true }
    );
    return response.data;
}