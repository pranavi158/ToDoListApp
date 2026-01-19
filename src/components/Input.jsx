import React from 'react';
import './Input.css';

const Input = ({ type = "text", placeholder, label, icon: Icon, value, onChange, ...props }) => {
    return (
        <div className="input-group">
            {label && <label className="input-label">{label}</label>}
            <div className="input-wrapper">
                <input
                    type={type}
                    className="custom-input"
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    {...props}
                />
                {Icon && <Icon className="input-icon" size={18} />}
            </div>
        </div>
    );
};

export default Input;
