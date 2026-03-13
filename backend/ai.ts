const baseurl = "http://localhost:8000";

export const geminiChat = async (message: string, chatId: string, persona?: string) => {
    const response = await fetch(`${baseurl}/ai/ai-chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, chatId, persona }),
        credentials: 'include',
    });
    return await response.json();
};

export const createAIChat = async () => {
    const response = await fetch(`${baseurl}/ai/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
    });
    return await response.json();
};

export const getAIChats = async () => {
    const response = await fetch(`${baseurl}/ai/chats`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
    });
    return await response.json();
};

export const getAIChatDetails = async (chatId: string) => {
    const response = await fetch(`${baseurl}/ai/chat/${chatId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
    });
    return await response.json();
};

export const uploadPDF = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${baseurl}/file/upload`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
    });
    return await response.json();
};

export const deleteAIChat = async (chatId: string) => {
    const response = await fetch(`${baseurl}/ai/delete/${chatId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
    });
    return await response.json();
};
