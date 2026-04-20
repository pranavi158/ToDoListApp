import React from 'react';
import { Lock, Crown } from 'lucide-react';

/**
 * PremiumGate — shows a locked hint for premium-only features.
 * Clicking "Upgrade" triggers the payment flow.
 */
const PremiumGate = ({ label = 'This Feature', onUpgrade }) => {
    return (
        <div
            id="premium-gate"
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                border: '1px dashed rgba(124, 58, 237, 0.35)',
                background: 'rgba(124, 58, 237, 0.04)',
                cursor: 'default',
                userSelect: 'none',
            }}
        >
            <Lock size={14} color="#7C3AED" />
            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', flex: 1 }}>
                <strong style={{ color: '#7C3AED' }}>{label}</strong> is a Premium feature
            </span>
            <button
                onClick={onUpgrade}
                style={{
                    display: 'inline-flex', alignItems: 'center', gap: '4px',
                    background: 'linear-gradient(135deg, #7C3AED, #C084FC)',
                    color: '#fff', border: 'none',
                    padding: '4px 12px', borderRadius: '6px',
                    cursor: 'pointer', fontWeight: '600', fontSize: '0.78rem',
                    whiteSpace: 'nowrap'
                }}
            >
                <Crown size={12} /> Unlock
            </button>
        </div>
    );
};

export default PremiumGate;
