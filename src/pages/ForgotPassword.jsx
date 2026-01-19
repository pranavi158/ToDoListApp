import React from 'react';
import { Link } from 'react-router-dom';
import AuthLayout from '../layouts/AuthLayout';
import Input from '../components/Input';
import Button from '../components/Button';
import { Mail, Lock } from 'lucide-react';

const ForgotPassword = () => {
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [confirmPassword, setConfirmPassword] = React.useState('');
    const [message, setMessage] = React.useState('');
    const [success, setSuccess] = React.useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        if (password !== confirmPassword) {
            setMessage("Passwords don't match");
            return;
        }
        try {
            await import('../services/api').then(module => module.default.post('/auth/reset-password', { email, newPassword: password }));
            setSuccess(true);
            setMessage('Password updated! Redirecting to login...');
            setTimeout(() => {
                window.location.href = '/login';
            }, 2000);
        } catch (err) {
            setMessage(err.response?.data?.msg || 'Error updating password');
        }
    };

    return (
        <AuthLayout quote="No worries! We'll help you get back on track.">
            <div className="auth-card">
                <Link to="/login" style={{ marginBottom: '1rem', display: 'block', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                    ← Back to Login Page...
                </Link>
                <h2 className="auth-title">Forgot Password?</h2>
                {message && <div style={{ color: success ? 'green' : 'red', textAlign: 'center', marginBottom: '1rem' }}>{message}</div>}
                <form className="auth-form" onSubmit={handleSubmit}>
                    <Input
                        type="email"
                        placeholder="Enter your Email..."
                        icon={Mail}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <Input
                        type="password"
                        placeholder="Enter New Password..."
                        icon={Lock}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <Input
                        type="password"
                        placeholder="Confirm New Password..."
                        icon={Lock}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />

                    <Button type="submit" variant="primary" style={{ marginTop: '1rem' }}>
                        RESET PASSWORD
                    </Button>
                </form>
            </div>
        </AuthLayout>
    );
};

export default ForgotPassword;
