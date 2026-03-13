const baseurl = process.env.NEXT_PUBLIC_BASE_URL;

export const loginUser = async (formData: any) => {
    const response = await fetch(`${baseurl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
        credentials: 'include',
    });

    const data = await response.json();
    return data;
};

export const logoutUser = async () => {
    const response = await fetch(`${baseurl}/auth/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
    });
    const data = await response.json();
    return data;
};

export const getMe = async (token?: string) => {
    const headers: any = {
        'Content-Type': 'application/json',
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${baseurl}/auth/me`, {
        method: 'GET',
        headers,
        credentials: 'include',
    });
    const data = await response.json();
    return data;
};

export const changePassword = async (currentPassword: string, newPassword: string, token?: string) => {
    const headers: any = {
        'Content-Type': 'application/json',
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${baseurl}/auth/change-password`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ currentPassword, newPassword }),
        credentials: 'include',
    });
    const data = await response.json();
    return data;
};

export const changeUsername = async (new_username: string, token?: string) => {
    const headers: any = {
        'Content-Type': 'application/json',
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${baseurl}/auth/change-username`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ new_username }),
        credentials: 'include',
    });
    const data = await response.json();
    return data;
};

export const updateProfilePicture = async (imageFile: File, token?: string) => {
    const formData = new FormData();
    formData.append('image', imageFile);

    const headers: any = {};
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${baseurl}/auth/update-profile-picture`, {
        method: 'POST',
        headers,
        body: formData,
        credentials: 'include',
    });
    const data = await response.json();
    return data;
};

export const forgetPassword = async (email: string) => {
    const response = await fetch(`${baseurl}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
        credentials: 'include',
    });
    const data = await response.json();
    return data;
};

export const resetPassword = async (userId: string, token: string, newPassword: string) => {
    const response = await fetch(`${baseurl}/auth/reset-password/${userId}/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ new_password: newPassword }),
        credentials: 'include',
    });
    const data = await response.json();
    return data;
};

export const registerUser = async (formData: any) => {
    const response = await fetch(`${baseurl}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
        credentials: 'include',
    });

    const data = await response.json();
    return data;
};

export const verifyEmail = async (userId: string, token: string) => {
    const response = await fetch(`${baseurl}/auth/verify/${userId}/${token}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
    });
    const data = await response.json();
    return data;
};

export const deleteUser = async () => {
    const response = await fetch(`${baseurl}/auth/delete-user`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
    });
    const data = await response.json();
    return data;
};