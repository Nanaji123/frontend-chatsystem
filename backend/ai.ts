const baseurl = "http://localhost:3001";

export const geminiChat = async (message: string) => {
    const response = await fetch(`${baseurl}/api/v1/ai/ai-chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
        credentials: 'include',
    });
    return await response.json();
};
