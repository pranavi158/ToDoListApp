import React, { useState, useEffect } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import TaskList from '../components/TaskList';
import api from '../services/api';

const Trash = () => {
    const [tasks, setTasks] = useState([]);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Fetch deleted tasks and user
    useEffect(() => {
        const fetchTrash = async () => {
            try {
                setLoading(true);
                const [userRes, tasksRes] = await Promise.all([
                    api.get('/auth'),
                    api.get('/tasks/trash')
                ]);
                setUser(userRes.data);
                setTasks(tasksRes.data);
            } catch (err) {
                console.error("Error fetching trash:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchTrash();
    }, []);

    const handleRestore = async (id) => {
        try {
            await api.put(`/tasks/${id}/restore`);
            setTasks(tasks.filter(t => t._id !== id));
        } catch (err) {
            console.error("Error restoring task:", err);
        }
    };

    return (
        <DashboardLayout user={user}>
            <h2 style={{ marginBottom: '1rem', color: 'var(--color-text-main)' }}>Recently Deleted</h2>
            {loading ? <div>Loading...</div> : <TaskList tasks={tasks} isTrash={true} onRestoreTask={handleRestore} />}
        </DashboardLayout>
    );
};

export default Trash;
