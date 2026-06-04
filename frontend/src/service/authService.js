import axios from "axios";

const API = "";

export async function getMe() {
    const response = await axios.get(`${API}/api/users/me`, {
        withCredentials: true,
    });
    return response.data;
}

export async function loginEmail(email, password) {
    await axios.post(
        `${API}/auth/login`,
        { email, password },
        { withCredentials: true }
    );
}

export function loginGoogle() {
    window.location.href = `${API}/oauth2/authorization/google`;
}

export async function logout() {
    await axios.post(`${API}/auth/logout`, null, {
        withCredentials: true,
    });
}