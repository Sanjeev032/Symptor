import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';
import { Clock } from 'lucide-react';

const UserDashboard = () => {
    const { token } = useAuth();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await fetch('http://localhost:5000/api/diagnosis/history', {
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
        <div style={{ padding: '40px', maxWidth: '1000px', margin: '0 auto' }}>
            <h1 style={{ color: '#38bdf8', marginBottom: '8px' }}>Health History</h1>
            <p style={{ color: '#94a3b8', marginBottom: '32px' }}>Your past diagnoses and symptom checks.</p>

            {loading ? (
                <div style={{ color: 'white' }}>Loading history...</div>
            ) : history.length === 0 ? (
                <div style={{ background: '#1e293b', padding: '40px', borderRadius: '16px', textAlign: 'center', border: '1px solid #334155' }}>
                    <div style={{ color: '#94a3b8', marginBottom: '16px' }}>No history found.</div>
                    <p>Use the visualizer to check your symptoms.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '16px' }}>
                    {history.map((record) => (
                        <div key={record._id} style={{
                            background: '#1e293b',
                            padding: '24px',
                            borderRadius: '12px',
                            border: '1px solid #334155',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                    <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'white' }}>{record.diagnosis}</h3>
                                    <span style={{
                                        padding: '4px 8px',
                                        borderRadius: '4px',
                                        fontSize: '0.75rem',
                                        fontWeight: 'bold',
                                        background: record.severity === 'Critical' ? '#ef4444' :
                                            record.severity === 'High' ? '#f59e0b' : '#22c55e',
                                        color: 'white'
                                    }}>
                                        {record.severity}
                                    </span>
                                </div>
                                <p style={{ margin: '0 0 8px 0', color: '#cbd5e1', fontSize: '0.9rem' }}>
                                    <strong>Symptoms:</strong> {record.symptoms.join(', ')}
                                </p>
                                <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.85rem' }}>
                                    {record.affectedSystems.join(', ')} System(s)
                                </p>
                            </div>

                            <div style={{ textAlign: 'right', color: '#64748b', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Clock size={14} />
                                {format(new Date(record.createdAt), 'MMM d, yyyy h:mm a')}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default UserDashboard;
