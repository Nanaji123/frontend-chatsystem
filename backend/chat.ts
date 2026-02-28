const baseurl = process.env.NEXT_PUBLIC_BASE_URL;

export const searchUsers = async (search: string, page = 1, limit = 20) => {
    const response = await fetch(`${baseurl}/api/v1/chat/list-users?search=${search}&page=${page}&limit=${limit}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
    });
    return await response.json();
};

export const getChats = async () => {
    const response = await fetch(`${baseurl}/api/v1/chat/get-chats`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
    });
    return await response.json();
};

export const createChat = async (userId: string) => {
    const response = await fetch(`${baseurl}/api/v1/chat/create-chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
        credentials: 'include',
    });
    return await response.json();
};

export const updateChat = async (chatId: string, chatName: string) => {
    const response = await fetch(`${baseurl}/api/v1/chat/update-chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatId, chatName }),
        credentials: 'include',
    });
    return await response.json();
};

export const deleteChat = async (chatId: string) => {
    const response = await fetch(`${baseurl}/api/v1/chat/delete-chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatId }),
        credentials: 'include',
    });
    return await response.json();
};

export const getMessages = async (chatId: string, page = 1, limit = 30) => {
    const response = await fetch(`${baseurl}/api/v1/chat/messages/${chatId}?page=${page}&limit=${limit}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
    });
    return await response.json();
};
