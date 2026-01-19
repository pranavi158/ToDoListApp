import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../layouts/AuthLayout';
import Input from '../components/Input';
import Button from '../components/Button';
import { User, Lock, ArrowRight } from 'lucide-react';
import api from '../services/api';

const Login = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');

    const handleChange = (e) => setFormData({ ...formData, [e.target.type === 'text' || e.target.type === 'email' ? 'email' : 'password']: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/auth/login', formData);
            localStorage.setItem('token', res.data.token);
            // Save user info too if needed, or fetch in dashboard
            localStorage.setItem('user', JSON.stringify(res.data.user));
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.msg || 'Login failed');
        }
    };

    return (
        <AuthLayout>
            <div className="auth-card">
                <h2 className="auth-title">Login</h2>
                {error && <div style={{ color: 'red', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}
                <form className="auth-form" onSubmit={handleSubmit}>
                    <Input
                        type="email"
                        placeholder="Enter Email..."
                        icon={User}
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

                    <div style={{ textAlign: 'right' }}>
                        <Link to="/forgot-password" style={{ fontSize: '0.85rem', color: 'var(--color-primary)', fontWeight: 500 }}>
                            Forgot Password?
                        </Link>
                    </div>

                    <Button type="submit" variant="primary" style={{ marginTop: '0.5rem' }}>
                        ENTER
                    </Button>

                    <div className="auth-link-text">
                        <span>New here?</span>
                        <Link to="/signup" className="auth-link">Sign Up!</Link>
                    </div>
                </form>
            </div>
        </AuthLayout>
    );
};

export default Login;
