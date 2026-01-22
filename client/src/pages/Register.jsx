import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'user' });
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json();

            if (res.ok) {
                login(data.token, data.user);
                navigate('/dashboard');
            } else {
                setError(data.message || 'Registration failed');
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
                maxWidth: '480px',
                border: 'var(--glass-border)',
                boxShadow: 'var(--glass-shadow)'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <h2 style={{ color: 'var(--text-heading)', fontSize: '2rem', fontWeight: '700', marginBottom: '8px' }}>Create Account</h2>
                    <p style={{ color: 'var(--text-muted)', margin: 0 }}>Join Symptor.AI today</p>
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
                        <label style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-main)', marginLeft: '4px' }}>Full Name</label>
                        <input
                            type="text"
                            placeholder="Dr. John Doe"
                            required
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
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
                        <label style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-main)', marginLeft: '4px' }}>Email</label>
                        <input
                            type="email"
                            placeholder="name@example.com"
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
                            placeholder="Create a strong password"
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

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-main)', marginLeft: '4px' }}>Role</label>
                        <div style={{ position: 'relative' }}>
                            <select
                                value={formData.role}
                                onChange={e => setFormData({ ...formData, role: e.target.value })}
                                style={{
                                    width: '100%',
                                    padding: '14px 16px',
                                    borderRadius: 'var(--radius-sm)',
                                    border: '1px solid var(--border-light)',
                                    background: 'rgba(255, 255, 255, 0.5)',
                                    color: 'var(--text-heading)',
                                    fontSize: '1rem',
                                    outline: 'none',
                                    transition: 'all 0.2s',
                                    appearance: 'none',
                                    cursor: 'pointer'
                                }}
                                onFocus={(e) => {
                                    e.target.style.borderColor = 'var(--primary)';
                                    e.target.style.background = 'white';
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = 'var(--border-light)';
                                    e.target.style.background = 'rgba(255, 255, 255, 0.5)';
                                }}
                            >
                                <option value="user">Patient / User</option>
                                <option value="admin">Medical Admin</option>
                            </select>
                            <div style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-muted)' }}>▼</div>
                        </div>
                    </div>

                    <button type="submit" style={{
                        marginTop: '12px',
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
                        Sign Up
                    </button>
                </form>

                <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '32px', fontSize: '0.95rem' }}>
                    Already have an account? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: '600', textDecoration: 'none' }}>Log in</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
