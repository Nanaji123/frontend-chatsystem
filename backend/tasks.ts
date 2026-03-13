const baseurl = "http://localhost:8000";

export const addTask = async (taskData: {
    title: string,
    description: string,
    due_date: string,
    priority: string,
    category: string
}) => {
    const response = await fetch(`${baseurl}/task/add-task`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData),
        credentials: 'include',
    });
    return await response.json();
};

export const getAllTasks = async () => {
    const response = await fetch(`${baseurl}/task/get-tasks`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
    });
    return await response.json();
};

export const updateTask = async (taskData: {
    id: string,
    title?: string,
    description?: string,
    due_date?: string,
    priority?: string,
    category?: string,
    status?: string
}) => {
    const response = await fetch(`${baseurl}/task/update-task`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData),
        credentials: 'include',
    });
    console.log(response);
    return await response.json();
};

export const deleteTask = async (id: string) => {
    const response = await fetch(`${baseurl}/task/delete-task`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
        credentials: 'include',
    });
    console.log(response);
    return await response.json();
};

export const markAsCompleted = async (id: string) => {
    const response = await fetch(`${baseurl}/task/mark-as-completed`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
        credentials: 'include',
    });
    return await response.json();
};
