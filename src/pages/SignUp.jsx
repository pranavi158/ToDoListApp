
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../layouts/AuthLayout';
import Input from '../components/Input';
import Button from '../components/Button';
import { User, Mail, Lock, Phone } from 'lucide-react';
import api from '../services/api';

const SignUp = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ username: '', email: '', password: '' });
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/auth/register', formData);
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            // User requested to go back to login page after signup, not dashboard
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.msg || 'Registration failed');
        }
    };

    return (
        <AuthLayout quote="Get Started! Join us today and organize your life efficiently.">
            <div className="auth-card">
                <button style={{ marginBottom: '1rem', background: 'none', border: 'none', color: 'var(--color-text-muted)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={() => navigate('/login')}>
                    Back to Login Page...
                </button>
                <h2 className="auth-title">Sign Up</h2>
                {error && <div style={{ color: 'red', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}
                <form className="auth-form" onSubmit={handleSubmit}>
                    <Input
                        type="text"
                        placeholder="Enter Username..."
                        icon={User}
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    />
                    <Input
                        type="text"
                        placeholder="Enter your Email..."
                        icon={Mail}
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                    <Input
                        type="password"
                        placeholder="Password..."
                        icon={Lock}
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    />

                    <Button type="submit" variant="primary" style={{ marginTop: '1rem' }}>
                        ENTER
                    </Button>

                    <div className="auth-link-text">
                        <span>Already have an account?</span>
                        <Link to="/login" className="auth-link">Login</Link>
                    </div>
                </form>
            </div>
        </AuthLayout>
    );
};

export default SignUp;
