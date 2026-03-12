const baseurl = "http://localhost:8000";

export const geminiChat = async (message: string) => {
    const response = await fetch(`${baseurl}/ai/ai-chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
        credentials: 'include',
    });
    console.log("response", response);
    return await response.json();
};
