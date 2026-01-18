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
        <div style={{ minHeight: '100vh', background: '#0f172a', color: 'white', display: 'flex', flexDirection: 'column' }}>
            <nav style={{
                background: 'rgba(30, 41, 59, 0.8)',
                backdropFilter: 'blur(10px)',
                borderBottom: '1px solid #334155',
                padding: '16px 24px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                position: 'fixed',
                top: 0,
                width: '100%',
                zIndex: 50,
                boxSizing: 'border-box'
            }}>
                <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: '#38bdf8', fontSize: '1.2rem', fontWeight: 'bold' }}>
                    <Activity size={24} />
                    <span>MedAuth 3D</span>
                </Link>

                <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                    <Link to="/" style={{ color: '#cbd5e1', textDecoration: 'none', fontWeight: 500 }}>
                        Visualizer
                    </Link>

                    {user ? (
                        <>
                            <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#cbd5e1', textDecoration: 'none' }}>
                                <LayoutDashboard size={18} /> User Panel
                            </Link>

                            {user.role === 'admin' && (
                                <Link to="/admin" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#f59e0b', textDecoration: 'none' }}>
                                    <Shield size={18} /> Admin
                                </Link>
                            )}

                            <div style={{ width: '1px', height: '20px', background: '#475569' }}></div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'white' }}>
                                <User size={18} />
                                <span style={{ fontSize: '0.9rem' }}>{user.name}</span>
                            </div>

                            <button
                                onClick={handleLogout}
                                style={{
                                    background: 'transparent',
                                    border: '1px solid #ef4444',
                                    color: '#ef4444',
                                    padding: '6px 12px',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    fontSize: '0.8rem'
                                }}
                            >
                                <LogOut size={14} /> Logout
                            </button>
                        </>
                    ) : (
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <Link to="/login" style={{ color: 'white', textDecoration: 'none', padding: '8px 16px' }}>Login</Link>
                            <Link to="/register" style={{ background: '#4f46e5', color: 'white', textDecoration: 'none', padding: '8px 16px', borderRadius: '6px' }}>Register</Link>
                        </div>
                    )}
                </div>
            </nav>

            <div style={{ flex: 1, marginTop: '70px' }}>
                <Outlet />
            </div>
        </div>
    );
};

export default MainLayout;
