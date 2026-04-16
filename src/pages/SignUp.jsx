
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../layouts/AuthLayout';
import Input from '../components/Input';
import Button from '../components/Button';
import { User, Mail, Lock, Key } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import api from '../services/api';

const SignUp = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ username: '', email: '', password: '', otp: '' });
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [step, setStep] = useState(1);

    const handleSendOtp = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        try {
            await api.post('/auth/send-otp', { email: formData.email });
            setStep(2);
            setMessage('OTP sent to your email! (Check spam if not found)');
        } catch (err) {
            setError(err.response?.data?.msg || 'Failed to send OTP');
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const res = await api.post('/auth/register', formData);
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            // User requested to go back to login page after signup
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.msg || 'Registration failed');
        }
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            const res = await api.post('/auth/google', { token: credentialResponse.credential });
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            navigate('/dashboard');
        } catch (err) {
            setError('Google Sign up failed');
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
                {message && <div style={{ color: 'green', marginBottom: '1rem', textAlign: 'center' }}>{message}</div>}
                <form className="auth-form" onSubmit={step === 1 ? handleSendOtp : handleRegister}>
                    {step === 1 ? (
                        <>
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
                        SEND OTP
                    </Button>
                    </>
                    ) : (
                    <>
                        <Input
                            type="text"
                            placeholder="Enter 6-digit OTP..."
                            icon={Key}
                            value={formData.otp}
                            onChange={(e) => setFormData({ ...formData, otp: e.target.value })}
                        />
                        <Button type="submit" variant="primary" style={{ marginTop: '1rem' }}>
                            VERIFY & REGISTER
                        </Button>
                        <Button type="button" variant="secondary" style={{ marginTop: '0.5rem', background: 'transparent', color: 'var(--color-primary)', border: '1px solid var(--color-primary)' }} onClick={() => setStep(1)}>
                            Back to Details
                        </Button>
                    </>
                    )}

                    <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center' }}>
                        <GoogleLogin
                            onSuccess={handleGoogleSuccess}
                            onError={() => setError('Google Sign Up Failed')}
                            text="signup_with"
                        />
                    </div>

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
