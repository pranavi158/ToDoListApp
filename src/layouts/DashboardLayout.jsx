import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Trash2, LogOut } from 'lucide-react';
import avatarImg from '../assets/images/avatar.png'; // Will use the new square one later
import '../styles/dashboard.css';

const DashboardLayout = ({ children, user }) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    return (
        <div className="dashboard-container">
            <aside className="sidebar">
                <div className="sidebar-header">
                    <div className="avatar square">
                        {/* Use image if available, else initials */}
                        <img src={avatarImg} alt="User" />
                    </div>
                    <div className="user-info">
                        <div className="user-name">{user?.username || 'User'}</div>
                        <div className="user-email">{user?.email || 'user@example.com'}</div>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    <NavLink to="/dashboard" end className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                        <LayoutDashboard size={20} />
                        <span>My Tasks</span>
                    </NavLink>
                    <NavLink to="/dashboard/trash" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                        <Trash2 size={20} />
                        <span>Recently Deleted</span>
                    </NavLink>
                </nav>

                <div className="sidebar-footer">
                    <button onClick={handleLogout} className="logout-btn">
                        <LogOut size={20} />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            <main className="main-content">
                {children}
            </main>
        </div>
    );
};

export default DashboardLayout;
