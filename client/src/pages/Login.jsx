import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Activity, Mail, ArrowRight, Lock } from 'lucide-react';

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

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
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-wrapper">
            <div className="auth-card">
                <div className="text-center mb-6">
                    <div className="flex-center mb-4">
                        <div className="brand-icon" style={{ width: '48px', height: '48px', margin: '0 auto' }}>
                            <Activity size={24} />
                        </div>
                    </div>
                    <h2 className="card-title" style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Welcome Back</h2>
                    <p style={{ color: 'var(--text-muted)' }}>Access your medical dashboard</p>
                </div>

                {error && (
                    <div className="alert alert-error text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Email Address</label>
                        <div className="input-with-icon" style={{ position: 'relative' }}>
                            <input
                                className="form-input"
                                type="email"
                                placeholder="Enter your email"
                                required
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                style={{ paddingLeft: '2.5rem' }}
                            />
                            <Mail size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
                        </div>
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <label className="form-label" style={{ marginBottom: 0 }}>Password</label>
                            <Link to="/forgot-password" style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: '500' }}>Forgot Password?</Link>
                        </div>
                        <div className="input-with-icon" style={{ position: 'relative' }}>
                            <input
                                className="form-input"
                                type="password"
                                placeholder="Enter your password"
                                required
                                value={formData.password}
                                onChange={e => setFormData({ ...formData, password: e.target.value })}
                                style={{ paddingLeft: '2.5rem' }}
                            />
                            <Lock size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary btn-full"
                        style={{ marginTop: '0.5rem', padding: '0.875rem' }}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Signing In...' : <><span style={{ marginRight: '0.5rem' }}>Sign In</span> <ArrowRight size={18} /></>}
                    </button>
                </form>

                <p className="text-center mt-4" style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    New here? <Link to="/register" style={{ fontWeight: '600' }}>Create an account</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
