import React, { useState, useEffect } from 'react';
import { Crown } from 'lucide-react';
import DashboardLayout from '../layouts/DashboardLayout';
import TaskInput from '../components/TaskInput';
import TaskList from '../components/TaskList';
import api from '../services/api';

const Dashboard = () => {
    const [tasks, setTasks] = useState([]);
    const [filter, setFilter] = useState('all');
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [userRes, tasksRes] = await Promise.all([
                api.get('/auth'),
                api.get('/tasks')
            ]);
            setUser(userRes.data);
            setTasks(tasksRes.data);
        } catch (err) {
            console.error("Error fetching data:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleAddTask = async (newTaskData) => {
        try {
            const res = await api.post('/tasks', newTaskData);
            setTasks([res.data, ...tasks]);
        } catch (err) {
            console.error("Error adding task:", err);
        }
    };

    const handleToggleTask = async (id) => {
        try {
            const taskToToggle = tasks.find(t => t._id === id);
            const res = await api.put(`/tasks/${id}`, { completed: !taskToToggle.completed });
            setTasks(tasks.map(t => t._id === id ? res.data : t));
        } catch (err) {
            console.error("Error toggling task:", err);
        }
    };

    const handleDeleteTask = async (id) => {
        try {
            await api.put(`/tasks/${id}/delete`);
            setTasks(tasks.filter(t => t._id !== id));
        } catch (err) {
            console.error("Error deleting task:", err);
        }
    };

    const handleEditTask = async (id, updatedTaskData) => {
        try {
            const res = await api.put(`/tasks/${id}`, updatedTaskData);
            setTasks(tasks.map(t => t._id === id ? res.data : t));
        } catch (err) {
            console.error("Error updating task:", err);
        }
    };

    const handleGoPremium = async () => {
        const loadRazorpayScript = () => {
            return new Promise((resolve) => {
                const script = document.createElement('script');
                script.src = 'https://checkout.razorpay.com/v1/checkout.js';
                script.onload = () => resolve(true);
                script.onerror = () => resolve(false);
                document.body.appendChild(script);
            });
        };

        const res = await loadRazorpayScript();
        if (!res) {
            alert('Razorpay SDK failed to load. Are you online?');
            return;
        }

        try {
            const keyRes = await api.get('/auth/razorpay-key');
            
            const options = {
                key: keyRes.data.key,
                amount: "50000",
                currency: "INR",
                name: "Todo App Premium",
                description: "Upgrade to Premium subscription",
                handler: function (response) {
                    alert(`Payment successful! Welcome to Premium.\nPayment ID: ${response.razorpay_payment_id}`);
                },
                prefill: {
                    name: user?.username || '',
                    email: user?.email || '',
                },
                theme: {
                    color: "#4B44BD"
                }
            };
            const paymentObject = new window.Razorpay(options);
            paymentObject.open();
        } catch (error) {
            console.error("Payment error:", error);
            alert("Could not initiate payment. Please try later.");
        }
    };

    // Note: We need a soft delete function in TaskList card, currently TaskList just has toggle.
    // We'll update TaskList to support delete action.

    const getFilteredTasks = () => {
        let filtered = tasks;

        // "Completed" filter mode: specific view for done tasks.
        if (filter === 'completed') {
            return tasks.filter(t => t.completed);
        }

        // Default: Hide completed tasks for all other views
        filtered = filtered.filter(t => !t.completed);

        if (filter === 'today') {
            filtered = filtered.filter(t => t.dueDate?.toLowerCase().includes('today') || new Date(t.dueDate).toDateString() === new Date().toDateString());
        } else if (filter === 'high') { // 'Urgent' maps to 'high'
            filtered = filtered.filter(t => t.priority === 'high');
        }

        return filtered;
    };

    return (
        <DashboardLayout user={user}>
            <header className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div className="header-content">
                    <h1>My Tasks</h1>
                    <p>Stay organized and calm.</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <button 
                        onClick={handleGoPremium}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'linear-gradient(45deg, #FFD700, #FFA500)', color: '#000', border: 'none', padding: '0.6rem 1rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.95rem' }}>
                        <Crown size={18} />
                        Go Premium
                    </button>
                    <div className="header-image" style={{ margin: 0 }}>
                        <img src="https://media.tenor.com/sqxKQ3lUS_wAAAAM/spongebob-spongebob-squarepants.gif" alt="Relaxing lo-fi vibes" style={{ height: '60px', width: 'auto', borderRadius: '8px' }} />
                    </div>
                </div>
            </header>

            <TaskInput onAdd={handleAddTask} />

            <div className="filters-bar" style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                <button className={`filter-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>All Tasks</button>
                <button className={`filter-btn ${filter === 'today' ? 'active' : ''}`} onClick={() => setFilter('today')}>Today</button>
                <button className={`filter-btn ${filter === 'high' ? 'active' : ''}`} onClick={() => setFilter('high')}>Urgent</button>
                <button className={`filter-btn ${filter === 'completed' ? 'active' : ''}`} onClick={() => setFilter('completed')}>Completed</button>
            </div>

            {loading ? (
                <div>Loading...</div>
            ) : (
                <TaskList
                    tasks={getFilteredTasks()}
                    onToggleTask={handleToggleTask}
                    onDeleteTask={handleDeleteTask}
                    onEditTask={handleEditTask}
                />
            )}
        </DashboardLayout>
    );
};

export default Dashboard;
