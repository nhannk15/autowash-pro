import axios from "axios";

const API = "http://3.36.70.151";
// const API = "http://localhost:8080";

export async function getMe() {
    const response = await axios.get(`${API}/api/users/me`, {
        withCredentials: true,
    });
    return response.data;
}

export async function signupApi(email, password, confirmPassword, fullName, dob, phone) {
    const response = await axios.post(
        `${API}/auth/register`,
        {
            email,
            password,
            confirmPassword,
            fullName,
            dateOfBirth: dob,
            phoneNumber: phone,
        },
        { withCredentials: true }
    );
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