import axios from "axios";

const API = import.meta.env.VITE_BACKEND_ABSOLUTE_PATH;

export async function getAllBays() {
    const response = await axios.get(`${API}/api/bay`, {
        withCredentials: true,
    });
    return response.data;
}

export async function getAllBookings() {
    const response = await axios.get(`${API}/api/booking`, {
        withCredentials: true,
    });
    return response.data;
}

export async function completeSession(sessionId) {
    const response = await axios.patch(`${API}/api/wash-sessions/${sessionId}`,
        null,
        { withCredentials: true }
    );
    return response.data;
}

export async function searchBookingByQR(qrCode) {
    const response = await axios.get(`${API}/api/booking/qr/${qrCode}`, {
        withCredentials: true,
    });
    return response.data;
}

export async function confirmBooking(bookingId, staffId, bayId, staffNote) {
    const response = await axios.patch(`${API}/api/booking/confirm/${bookingId}`, {
        staffId,
        bayId,
        staffNote,
    }, { withCredentials: true });
    return response.data;
}

export async function getBillByBookingId(bookingId) {
    const response = await axios.get(`${API}/api/bill/${bookingId}`, {
        withCredentials: true,
    });
    return response.data;
}

export async function validateVoucher(code, amount) {
    const response = await axios.post(`${API}/api/voucher/validate`,
        { voucherCode: code, amount },
        { withCredentials: true }
    );
    return response.data;
}

export async function getStaffProfile(staffId) {
    const response = await axios.get(`${API}/api/staff/${staffId}`, {
        withCredentials: true,
    });
    return response.data.data;
}

export async function updateStaffProfile(staffId, phoneNumber, avatarUrl) {
    const response = await axios.patch(
        `${API}/api/staff/update/${staffId}`,
        { phoneNumber, avatarUrl },
        { withCredentials: true }
    );
    return response.data;
}