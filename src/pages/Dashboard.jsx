import React, { useState, useEffect } from 'react';
import { Crown, Search, Lock, Sparkles } from 'lucide-react';
import DashboardLayout from '../layouts/DashboardLayout';
import TaskInput from '../components/TaskInput';
import TaskList from '../components/TaskList';
import PremiumGate from '../components/PremiumGate';
import api from '../services/api';

const FREE_TASK_LIMIT = 10;

const Dashboard = () => {
    const [tasks, setTasks] = useState([]);
    const [filter, setFilter] = useState('all');
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [limitReached, setLimitReached] = useState(false);

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
        setLimitReached(false);
        try {
            const res = await api.post('/tasks', newTaskData);
            setTasks([res.data, ...tasks]);
        } catch (err) {
            if (err.response?.data?.limitReached) {
                setLimitReached(true);
            } else {
                console.error("Error adding task:", err);
            }
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
            // Re-check limit after deletion
            if (limitReached) setLimitReached(false);
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
                if (window.Razorpay) return resolve(true); // already loaded
                const script = document.createElement('script');
                script.src = 'https://checkout.razorpay.com/v1/checkout.js';
                script.onload = () => resolve(true);
                script.onerror = () => resolve(false);
                document.body.appendChild(script);
            });
        };

        const loaded = await loadRazorpayScript();
        if (!loaded) {
            alert('Razorpay SDK failed to load. Are you online?');
            return;
        }

        try {
            // Step 1: Create order on backend
            const orderRes = await api.post('/payment/create-order');
            const { order_id, amount, currency, key } = orderRes.data;

            // Step 2: Open Razorpay checkout with the real order_id
            const options = {
                key,
                amount,
                currency,
                order_id,
                name: "Todo App Premium",
                description: "Upgrade to Premium — Unlimited tasks & Search",
                handler: async function (response) {
                    try {
                        // Step 3: Verify payment on backend
                        const verifyRes = await api.post('/payment/verify', {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                        });

                        // Step 4: Update user state instantly — no refresh needed
                        setUser(verifyRes.data.user);
                        setLimitReached(false);
                    } catch (err) {
                        console.error("Verification failed:", err);
                        alert("Payment done but verification failed. Please contact support.");
                    }
                },
                prefill: {
                    name: user?.username || '',
                    email: user?.email || '',
                },
                theme: { color: "#7C3AED" },
                modal: { ondismiss: () => { } }
            };

            const paymentObject = new window.Razorpay(options);
            paymentObject.open();
        } catch (error) {
            const msg = error.response?.data?.msg || error.message || 'Could not initiate payment. Please try later.';
            console.error("Payment error:", error);
            alert(`Payment error: ${msg}`);
        }
    };

    const getFilteredTasks = () => {
        let filtered = tasks;

        if (filter === 'completed') {
            filtered = tasks.filter(t => t.completed);
        } else {
            filtered = filtered.filter(t => !t.completed);
            if (filter === 'today') {
                filtered = filtered.filter(t =>
                    t.dueDate?.toLowerCase().includes('today') ||
                    new Date(t.dueDate).toDateString() === new Date().toDateString()
                );
            } else if (filter === 'high') {
                filtered = filtered.filter(t => t.priority === 'high');
            }
        }

        // Apply keyword search (premium feature — applied client-side)
        if (searchQuery.trim() && user?.isPremium) {
            filtered = filtered.filter(t =>
                t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                t.description?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        return filtered;
    };

    const activeFreeCount = tasks.filter(t => !t.completed && t.deletedAt === undefined).length;

    return (
        <DashboardLayout user={user}>
            <header className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div className="header-content">
                    <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        My Tasks
                        {user?.isPremium && (
                            <span style={{
                                display: 'inline-flex', alignItems: 'center', gap: '4px',
                                background: 'linear-gradient(135deg, #7C3AED, #C084FC)',
                                color: '#fff', fontSize: '0.65rem', fontWeight: '700',
                                padding: '3px 10px', borderRadius: '20px', letterSpacing: '0.08em',
                                textTransform: 'uppercase', boxShadow: '0 2px 8px rgba(124,58,237,0.4)',
                                verticalAlign: 'middle'
                            }}>
                                <Crown size={11} /> Premium
                            </span>
                        )}
                    </h1>
                    <p>Stay organized and calm.</p>
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    {!user?.isPremium && (
                        <button
                            id="go-premium-btn"
                            onClick={handleGoPremium}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '0.5rem',
                                background: 'linear-gradient(135deg, #7C3AED, #C084FC)',
                                color: '#fff', border: 'none', padding: '0.6rem 1.1rem',
                                borderRadius: '8px', cursor: 'pointer', fontWeight: '700',
                                fontSize: '0.9rem', boxShadow: '0 2px 12px rgba(124,58,237,0.4)',
                                transition: 'transform 0.15s, box-shadow 0.15s'
                            }}
                            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 18px rgba(124,58,237,0.55)'; }}
                            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(124,58,237,0.4)'; }}
                        >
                            <Crown size={16} /> Go Premium
                        </button>
                    )}
                    <div className="header-image" style={{ margin: 0 }}>
                        <img src="https://media.tenor.com/sqxKQ3lUS_wAAAAM/spongebob-spongebob-squarepants.gif" alt="Relaxing lo-fi vibes" style={{ height: '60px', width: 'auto', borderRadius: '8px' }} />
                    </div>
                </div>
            </header>

            {/* Task limit warning banner for free users */}
            {!user?.isPremium && (
                <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    background: 'rgba(124,58,237,0.07)', border: '1px solid rgba(124,58,237,0.2)',
                    borderRadius: '8px', padding: '0.5rem 1rem', marginBottom: '0.75rem',
                    fontSize: '0.8rem', color: 'var(--color-text-muted)'
                }}>
                    <span>
                        <strong style={{ color: limitReached ? '#d9534f' : 'inherit' }}>
                            {limitReached ? '⚠️ Task limit reached!' : `${tasks.filter(t => !t.deletedAt).length} / ${FREE_TASK_LIMIT} free tasks used`}
                        </strong>
                        {limitReached && ' — Upgrade to add unlimited tasks.'}
                    </span>
                    {limitReached && (
                        <button
                            onClick={handleGoPremium}
                            style={{
                                background: 'linear-gradient(135deg, #7C3AED, #C084FC)',
                                color: '#fff', border: 'none', padding: '4px 12px',
                                borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '0.8rem'
                            }}
                        >
                            <Sparkles size={12} style={{ marginRight: 4 }} />Upgrade
                        </button>
                    )}
                </div>
            )}

            <TaskInput onAdd={handleAddTask} />

            {/* Search bar — premium feature */}
            <div style={{ marginBottom: '1rem' }}>
                {user?.isPremium ? (
                    <div style={{ position: 'relative' }}>
                        <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                        <input
                            id="premium-search"
                            type="text"
                            placeholder="Search tasks..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{
                                width: '100%', padding: '0.5rem 0.75rem 0.5rem 2rem',
                                borderRadius: '8px', border: '1px solid var(--color-border)',
                                background: 'var(--color-surface)', color: 'var(--color-text)',
                                fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box'
                            }}
                        />
                    </div>
                ) : (
                    <PremiumGate label="Search Tasks" onUpgrade={handleGoPremium} />
                )}
            </div>

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
