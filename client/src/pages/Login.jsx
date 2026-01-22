import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json();

            if (res.ok) {
                login(data.token, data.user);
                navigate('/dashboard');
            } else {
                setError(data.message || 'Login failed');
            }
        } catch (err) {
            console.error(err);
            setError('Server error');
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: '20px' }}>
            <div style={{
                background: 'var(--bg-glass-card)',
                backdropFilter: 'var(--backdrop-blur)',
                padding: '48px',
                borderRadius: 'var(--radius-lg)',
                width: '100%',
                maxWidth: '420px',
                border: 'var(--glass-border)',
                boxShadow: 'var(--glass-shadow)'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <h2 style={{ color: 'var(--text-heading)', fontSize: '2rem', fontWeight: '700', marginBottom: '8px' }}>Welcome Back</h2>
                    <p style={{ color: 'var(--text-muted)', margin: 0 }}>Access your medical dashboard</p>
                </div>

                {error && (
                    <div style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        color: '#ef4444',
                        padding: '12px',
                        borderRadius: 'var(--radius-sm)',
                        marginBottom: '24px',
                        fontSize: '0.9rem',
                        textAlign: 'center'
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-main)', marginLeft: '4px' }}>Email</label>
                        <input
                            type="email"
                            placeholder="Enter your email"
                            required
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                            style={{
                                padding: '14px 16px',
                                borderRadius: 'var(--radius-sm)',
                                border: '1px solid var(--border-light)',
                                background: 'rgba(255, 255, 255, 0.5)',
                                color: 'var(--text-heading)',
                                fontSize: '1rem',
                                outline: 'none',
                                transition: 'all 0.2s'
                            }}
                            onFocus={(e) => {
                                e.target.style.borderColor = 'var(--primary)';
                                e.target.style.background = 'white';
                                e.target.style.boxShadow = '0 0 0 3px rgba(5, 150, 105, 0.1)';
                            }}
                            onBlur={(e) => {
                                e.target.style.borderColor = 'var(--border-light)';
                                e.target.style.background = 'rgba(255, 255, 255, 0.5)';
                                e.target.style.boxShadow = 'none';
                            }}
                        />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-main)', marginLeft: '4px' }}>Password</label>
                        <input
                            type="password"
                            placeholder="Enter your password"
                            required
                            value={formData.password}
                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                            style={{
                                padding: '14px 16px',
                                borderRadius: 'var(--radius-sm)',
                                border: '1px solid var(--border-light)',
                                background: 'rgba(255, 255, 255, 0.5)',
                                color: 'var(--text-heading)',
                                fontSize: '1rem',
                                outline: 'none',
                                transition: 'all 0.2s'
                            }}
                            onFocus={(e) => {
                                e.target.style.borderColor = 'var(--primary)';
                                e.target.style.background = 'white';
                                e.target.style.boxShadow = '0 0 0 3px rgba(5, 150, 105, 0.1)';
                            }}
                            onBlur={(e) => {
                                e.target.style.borderColor = 'var(--border-light)';
                                e.target.style.background = 'rgba(255, 255, 255, 0.5)';
                                e.target.style.boxShadow = 'none';
                            }}
                        />
                    </div>

                    <button type="submit" style={{
                        marginTop: '8px',
                        padding: '16px',
                        borderRadius: 'var(--radius-sm)',
                        border: 'none',
                        background: 'var(--primary)',
                        color: 'white',
                        fontWeight: '600',
                        fontSize: '1rem',
                        cursor: 'pointer',
                        transition: 'background 0.2s',
                        boxShadow: '0 4px 6px -1px rgba(5, 150, 105, 0.2)'
                    }}
                        onMouseOver={(e) => e.currentTarget.style.background = 'var(--primary-hover)'}
                        onMouseOut={(e) => e.currentTarget.style.background = 'var(--primary)'}
                    >
                        Sign In
                    </button>
                </form>

                <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '32px', fontSize: '0.95rem' }}>
                    New here? <Link to="/register" style={{ color: 'var(--primary)', fontWeight: '600', textDecoration: 'none' }}>Create an account</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
