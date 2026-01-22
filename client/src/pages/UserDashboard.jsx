import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';
import { Clock } from 'lucide-react';
import DiagnosisForm from '../components/Diagnosis/DiagnosisForm';

const UserDashboard = () => {
    const { token } = useAuth();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL}/api/diagnosis/history`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await res.json();
                if (res.ok) setHistory(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, [token]);

    return (
        <div style={{ padding: '32px', maxWidth: '1000px', margin: '0 auto', position: 'relative' }}>
            <div style={{ marginBottom: '32px' }}>
                <h1 style={{ color: 'var(--text-heading)', marginBottom: '8px', fontSize: '2rem', fontWeight: 700, letterSpacing: '-0.025em' }}>Health History</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>Your past diagnoses and symptom checks.</p>
            </div>

            {/* Diagnosis Form added here */}
            <div style={{ marginBottom: '40px' }}>
                <DiagnosisForm onDiagnosis={(result) => {
                    // Update history immediately if possible
                    setHistory(prev => [result, ...prev]);
                }} />
            </div>

            {loading ? (
                <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px' }}>Loading history...</div>
            ) : history.length === 0 ? (
                <div style={{ background: 'var(--bg-card)', padding: '48px', borderRadius: '16px', textAlign: 'center', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-card)' }}>
                    <div style={{ color: 'var(--text-muted)', marginBottom: '16px', fontSize: '1.1rem' }}>No history found.</div>
                    <p style={{ color: 'var(--text-main)' }}>Use the Symptom Checker above to check your symptoms.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '20px' }}>
                    {history.map((record, index) => (
                        <div key={record._id || index} style={{
                            background: 'var(--bg-glass-card)',
                            backdropFilter: 'var(--backdrop-blur)',
                            padding: '24px',
                            borderRadius: 'var(--radius-md)',
                            border: 'var(--glass-border)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            boxShadow: 'var(--shadow-soft)',
                            transition: 'all 0.2s ease',
                            cursor: 'default'
                        }}
                            onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                            onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                    <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-heading)', fontWeight: 600 }}>{record.diagnosis}</h3>
                                    <span style={{
                                        padding: '4px 10px',
                                        borderRadius: '20px',
                                        fontSize: '0.75rem',
                                        fontWeight: '600',
                                        background: record.severity === 'Critical' ? '#fee2e2' :
                                            record.severity === 'High' ? '#fef3c7' : '#d1fae5',
                                        color: record.severity === 'Critical' ? '#dc2626' :
                                            record.severity === 'High' ? '#d97706' : '#059669',
                                        border: `1px solid ${record.severity === 'Critical' ? '#fca5a5' :
                                            record.severity === 'High' ? '#fcd34d' : '#6ee7b7'
                                            }`
                                    }}>
                                        {record.severity}
                                    </span>
                                </div>
                                <p style={{ margin: '0 0 8px 0', color: 'var(--text-main)', fontSize: '0.9rem' }}>
                                    <strong style={{ color: 'var(--text-heading)' }}>Symptoms:</strong> {record.symptoms && Array.isArray(record.symptoms) ? record.symptoms.join(', ') : 'No symptoms listed'}
                                </p>
                                <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                    {record.affectedSystems && Array.isArray(record.affectedSystems) ? record.affectedSystems.join(', ') : 'Unknown'} System(s)
                                </p>
                            </div>

                            <div style={{ textAlign: 'right', color: 'var(--text-muted)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Clock size={14} />
                                {record.createdAt ? format(new Date(record.createdAt), 'MMM d, yyyy h:mm a') : 'Just now'}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default UserDashboard;
