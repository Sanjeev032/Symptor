import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';

const VerifyEmail = () => {
    const { token } = useParams();
    const [status, setStatus] = useState('verifying'); // verifying, success, error
    const [message, setMessage] = useState('');

    useEffect(() => {
        const verifyAccount = async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/verify-email/${token}`);
                const data = await res.json();

                if (res.ok) {
                    setStatus('success');
                    setMessage(data.message);
                } else {
                    setStatus('error');
                    setMessage(data.message || 'Verification failed');
                }
            } catch (err) {
                setStatus('error');
                setMessage('Network error occurred');
            }
        };

        if (token) {
            verifyAccount();
        }
    }, [token]);

    return (
        <div className="auth-wrapper">
            <div className="auth-card text-center">
                <h2 className="card-title mb-4">Email Verification</h2>

                {status === 'verifying' && (
                    <div>
                        <div className="loader" style={{ margin: '0 auto 1rem' }}></div>
                        <p>Verifying your email...</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="alert alert-success">
                        <p>{message}</p>
                        <Link to="/login" className="btn btn-primary mt-4" style={{ display: 'inline-block' }}>Login Now</Link>
                    </div>
                )}

                {status === 'error' && (
                    <div className="alert alert-error">
                        <p>{message}</p>
                        <Link to="/login" className="btn btn-ghost mt-4">Back to Login</Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VerifyEmail;
