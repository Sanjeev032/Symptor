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
        <div style={{ minHeight: '100vh', background: 'var(--bg-main)', color: 'var(--text-main)', display: 'flex', flexDirection: 'column' }}>
            <nav style={{
                background: '#ffffff', // Clean white navbar
                borderBottom: '1px solid var(--border-light)',
                padding: '12px 32px', // More horizontal padding
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                position: 'fixed',
                top: 0,
                width: '100%',
                zIndex: 50,
                boxSizing: 'border-box',
                boxShadow: 'var(--shadow-soft)'
            }}>
                <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
                    <div style={{ background: 'var(--bg-subtle)', padding: '8px', borderRadius: '8px' }}>
                        <Activity size={22} color="var(--primary)" />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ color: 'var(--text-heading)', fontSize: '1.1rem', fontWeight: '700', lineHeight: '1.2' }}>Symptor.AI</span>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '500' }}>Medical Assistant</span>
                    </div>
                </Link>

                <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                    {user ? (
                        <>
                            <Link to="/dashboard" style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                color: 'var(--text-main)',
                                textDecoration: 'none',
                                fontWeight: '500',
                                fontSize: '0.9rem',
                                padding: '8px 12px',
                                borderRadius: '6px',
                                transition: 'background 0.2s'
                            }}
                                onMouseOver={(e) => e.currentTarget.style.background = 'var(--bg-subtle)'}
                                onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                            >
                                <LayoutDashboard size={18} color="var(--text-muted)" /> Dashboard
                            </Link>

                            {user.role === 'admin' && (
                                <Link to="/admin" style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    color: 'var(--text-main)',
                                    textDecoration: 'none',
                                    fontWeight: '500',
                                    fontSize: '0.9rem',
                                    padding: '8px 12px',
                                    borderRadius: '6px'
                                }}>
                                    <Shield size={18} color="#f59e0b" /> Admin
                                </Link>
                            )}

                            <div style={{ width: '1px', height: '24px', background: 'var(--border-light)' }}></div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '50%',
                                    background: 'var(--bg-subtle)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'var(--primary)',
                                    fontWeight: '600',
                                    fontSize: '0.9rem'
                                }}>
                                    {user.name.charAt(0)}
                                </div>
                                <span style={{ fontSize: '0.9rem', fontWeight: '500', color: 'var(--text-heading)' }}>{user.name}</span>
                            </div>

                            <button
                                onClick={handleLogout}
                                style={{
                                    background: 'transparent',
                                    border: '1px solid var(--border-light)',
                                    color: 'var(--text-muted)',
                                    padding: '8px 16px',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    fontSize: '0.85rem',
                                    fontWeight: '500',
                                    transition: 'all 0.2s'
                                }}
                                onMouseOver={(e) => {
                                    e.currentTarget.style.borderColor = '#ef4444';
                                    e.currentTarget.style.color = '#ef4444';
                                }}
                                onMouseOut={(e) => {
                                    e.currentTarget.style.borderColor = 'var(--border-light)';
                                    e.currentTarget.style.color = 'var(--text-muted)';
                                }}
                            >
                                <LogOut size={16} /> Sign Out
                            </button>
                        </>
                    ) : (
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <Link to="/login" style={{ color: 'var(--text-main)', textDecoration: 'none', padding: '8px 16px', fontWeight: '500', fontSize: '0.9rem' }}>Log In</Link>
                            <Link to="/register" style={{
                                background: 'var(--primary)',
                                color: 'white',
                                textDecoration: 'none',
                                padding: '8px 20px',
                                borderRadius: '6px',
                                fontWeight: '600',
                                fontSize: '0.9rem',
                                boxShadow: '0 2px 4px rgba(5, 150, 105, 0.2)'
                            }}>Get Started</Link>
                        </div>
                    )}
                </div>
            </nav>

            <div style={{ flex: 1, marginTop: '80px', padding: '32px', maxWidth: '1200px', margin: '80px auto 0 auto', width: '100%', boxSizing: 'border-box' }}>
                <Outlet />
            </div>
        </div>
    );

};

export default MainLayout;
