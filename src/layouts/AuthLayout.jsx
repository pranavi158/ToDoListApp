import React from 'react';
import '../styles/auth.css';
import illustration from '../assets/images/auth-illustration.png';

const AuthLayout = ({ children, quote = "Tired of juggling between tasks... we got you covered! Your tasks organized and all in one place!" }) => {
    return (
        <div className="auth-container">
            <div className="auth-left">
                {children}
            </div>
            <div className="auth-right">
                <div className="auth-illustration-container">
                    <img src={illustration} alt="Illustration" className="auth-illustration" />
                </div>
                <p className="auth-quote">{quote}</p>
            </div>
        </div>
    );
};

export default AuthLayout;
