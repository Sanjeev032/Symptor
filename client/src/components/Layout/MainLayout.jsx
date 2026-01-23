import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Activity, LayoutDashboard, User, LogOut, Shield } from 'lucide-react';

const MainLayout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="page-wrapper">
            <nav className="navbar">
                <div className="navbar-container">
                    <Link to="/" className="navbar-brand">
                        <div className="brand-icon">
                            <Activity size={22} color="var(--primary)" />
                        </div>
                        <div className="brand-text">
                            <span className="brand-title">Symptor.AI</span>
                            <span className="brand-subtitle">Medical Assistant</span>
                        </div>
                    </Link>

                    <div className="navbar-actions">
                        {user ? (
                            <>
                                <Link to="/dashboard" className="nav-link">
                                    <LayoutDashboard size={18} /> Dashboard
                                </Link>

                                {user.role === 'admin' && (
                                    <Link to="/admin" className="nav-link">
                                        <Shield size={18} color="#f59e0b" /> Admin
                                    </Link>
                                )}

                                <div className="nav-divider"></div>

                                <div className="user-profile">
                                    <div className="user-avatar">
                                        {user.name.charAt(0)}
                                    </div>
                                    <span className="user-name">{user.name}</span>
                                </div>

                                <button onClick={handleLogout} className="btn-logout">
                                    <LogOut size={16} /> Sign Out
                                </button>
                            </>
                        ) : (
                            <div className="auth-buttons">
                                <Link to="/login" className="btn btn-ghost">Log In</Link>
                                <Link to="/register" className="btn btn-primary">Get Started</Link>
                            </div>
                        )}
                    </div>
                </div>
            </nav>

            <main className="main-content">
                <Outlet />
            </main>

            <footer className="footer">
                <div className="footer-content">
                    <p className="medical-disclaimer">
                        <strong>Medical Disclaimer:</strong> Symptor.AI provides wellness guidance and informational analysis only.
                        It is not a substitute for professional medical advice, diagnosis, or treatment.
                        Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.
                    </p>
                    <p className="copyright">© 2024 Symptor.AI. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );

};

export default MainLayout;
