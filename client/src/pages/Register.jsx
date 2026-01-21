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
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
            <div style={{ background: '#1e293b', padding: '40px', borderRadius: '16px', width: '400px', border: '1px solid #334155' }}>
                <h2 style={{ textAlign: 'center', color: '#38bdf8', marginTop: 0 }}>Create Account</h2>
                {error && <div style={{ background: '#ef444420', color: '#ef4444', padding: '10px', borderRadius: '6px', marginBottom: '20px', fontSize: '0.9rem', textAlign: 'center' }}>{error}</div>}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <input
                        type="text"
                        placeholder="Full Name"
                        required
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        style={{ padding: '12px', borderRadius: '8px', border: '1px solid #475569', background: '#0f172a', color: 'white' }}
                    />
                    <input
                        type="email"
                        placeholder="Email"
                        required
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                        style={{ padding: '12px', borderRadius: '8px', border: '1px solid #475569', background: '#0f172a', color: 'white' }}
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        required
                        value={formData.password}
                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                        style={{ padding: '12px', borderRadius: '8px', border: '1px solid #475569', background: '#0f172a', color: 'white' }}
                    />
                    <select
                        value={formData.role}
                        onChange={e => setFormData({ ...formData, role: e.target.value })}
                        style={{ padding: '12px', borderRadius: '8px', border: '1px solid #475569', background: '#0f172a', color: 'white' }}
                    >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                    </select>

                    <button type="submit" style={{ padding: '12px', borderRadius: '8px', border: 'none', background: '#4f46e5', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>
                        Sign Up
                    </button>
                </form>
                <p style={{ textAlign: 'center', color: '#94a3b8', marginTop: '20px', fontSize: '0.9rem' }}>
                    Already have an account? <Link to="/login" style={{ color: '#38bdf8' }}>Login</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
