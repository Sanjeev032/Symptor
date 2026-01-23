import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const [loginMethod, setLoginMethod] = useState('email'); // 'email' or 'mobile'
    const [formData, setFormData] = useState({ email: '', password: '', mobile: '', otp: '' });
    const [otpSent, setOtpSent] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSendOTP = async () => {
        setIsLoading(true);
        setError('');
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/send-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mobile: formData.mobile })
            });
            const data = await res.json();
            if (res.ok) {
                setOtpSent(true);
                alert('OTP sent to your mobile (Check console for mock)');
            } else {
                setError(data.message || 'Failed to send OTP');
            }
        } catch (err) {
            setError('Network error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        const payload = loginMethod === 'email'
            ? { email: formData.email, password: formData.password }
            : { mobile: formData.mobile, otp: formData.otp };

        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
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
                    <h2 className="card-title" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Welcome Back</h2>
                    <p style={{ color: 'var(--text-muted)' }}>Access your medical dashboard</p>
                </div>

                {error && (
                    <div className="alert alert-error text-center">
                        {error}
                    </div>
                )}

                <div style={{ display: 'flex', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-light)' }}>
                    <button
                        className={`btn btn-ghost ${loginMethod === 'email' ? 'active' : ''}`}
                        onClick={() => setLoginMethod('email')}
                        style={{ flex: 1, borderRadius: 0, borderBottom: loginMethod === 'email' ? '2px solid var(--primary)' : 'none' }}
                    >
                        Email & Password
                    </button>
                    <button
                        className={`btn btn-ghost ${loginMethod === 'mobile' ? 'active' : ''}`}
                        onClick={() => setLoginMethod('mobile')}
                        style={{ flex: 1, borderRadius: 0, borderBottom: loginMethod === 'mobile' ? '2px solid var(--primary)' : 'none' }}
                    >
                        Mobile & OTP
                    </button>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

                    {loginMethod === 'email' ? (
                        <>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">Email</label>
                                <input
                                    className="form-input"
                                    type="email"
                                    placeholder="Enter your email"
                                    required
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>

                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <label className="form-label">Password</label>
                                    <Link to="/forgot-password" style={{ fontSize: '0.8rem', color: 'var(--primary)', textDecoration: 'none' }}>Forgot Password?</Link>
                                </div>
                                <input
                                    className="form-input"
                                    type="password"
                                    placeholder="Enter your password"
                                    required
                                    value={formData.password}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">Mobile Number</label>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <input
                                        className="form-input"
                                        type="tel"
                                        placeholder="Enter mobile number"
                                        required
                                        value={formData.mobile}
                                        onChange={e => setFormData({ ...formData, mobile: e.target.value })}
                                        style={{ flex: 1 }}
                                    />
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={handleSendOTP}
                                        disabled={isLoading || !formData.mobile || otpSent}
                                    >
                                        {otpSent ? 'Sent' : 'Get OTP'}
                                    </button>
                                </div>
                            </div>

                            {otpSent && (
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label className="form-label">Enter OTP</label>
                                    <input
                                        className="form-input"
                                        type="text"
                                        placeholder="6-digit OTP"
                                        required
                                        value={formData.otp}
                                        onChange={e => setFormData({ ...formData, otp: e.target.value })}
                                    />
                                </div>
                            )}
                        </>
                    )}

                    <button
                        type="submit"
                        className="btn btn-primary btn-full"
                        style={{ marginTop: '0.5rem', padding: '1rem' }}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Signing In...' : 'Sign In'}
                    </button>
                </form>

                <p className="text-center mt-4" style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                    New here? <Link to="/register" style={{ fontWeight: '600' }}>Create an account</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
