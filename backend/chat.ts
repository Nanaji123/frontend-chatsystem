const baseurl = process.env.NEXT_PUBLIC_BASE_URL;

export const searchUsers = async (search: string, page = 1, limit = 20) => {
    const response = await fetch(`${baseurl}/chat/list-users?search=${search}&page=${page}&limit=${limit}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
    });
    return await response.json();
};

export const getChats = async () => {
    const response = await fetch(`${baseurl}/chat/get-chats`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
    });
    return await response.json();
};

export const createChat = async (user_id: string) => {
    const response = await fetch(`${baseurl}/chat/create-chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id }),
        credentials: 'include',
    });
    console.log("response", response);
    return await response.json();
};

export const updateChat = async (chat_id: string, chatName: string) => {
    const response = await fetch(`${baseurl}/chat/update-chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id, chatName }),
        credentials: 'include',
    });
    console.log("response", response);
    return await response.json();
};

export const deleteChat = async (chat_id: string) => {
    const response = await fetch(`${baseurl}/chat/delete-chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id }),
        credentials: 'include',
    });
    console.log("response", response);
    return await response.json();
};

export const getMessages = async (chat_id: string, page = 1, limit = 30) => {
    const response = await fetch(`${baseurl}/chat/get-messages/${chat_id}?page=${page}&limit=${limit}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
    });
    return await response.json();
};

export const createGroupChat = async (formData: FormData) => {
    console.log(formData);
    const response = await fetch(`${baseurl}/chat/create-group-chat`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
    });
    return await response.json();
};

export const getChatDetails = async (chat_id: string) => {
    const response = await fetch(`${baseurl}/chat/get-chat-details/${chat_id}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
    });
    console.log("response", response);
    return await response.json();
};

export const removeUserFromGroup = async (chat_id: string, user_id: string) => {
    const response = await fetch(`${baseurl}/chat/remove-user-from-group`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id, user_id }),
        credentials: 'include',
    });
    return await response.json();
};

