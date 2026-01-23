import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';
import { Clock, Activity, AlertCircle } from 'lucide-react';
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

    const getSeverityBadgeClass = (severity) => {
        switch (severity) {
            case 'Critical': return 'badge badge-critical'; // You'll need to define these or use inline style for specific colors if badge classes aren't in index.css yet. 
            // Let's stick to inline styles for dynamic colors for now, or add utility classes.
            // I'll add utility classes in index.css later or use style objects.
            // Actually, I can use inline styles for the dynamic parts but keep the structure clean.
            default: return '';
        }
    };

    return (
        <div className="container dashboard-container">
            <div className="dashboard-header mb-6">
                <h1 className="page-title">Health History</h1>
                <p className="page-subtitle">Your past diagnoses and symptom checks.</p>
            </div>

            {/* Diagnosis Form added here */}
            <div className="mb-6">
                <DiagnosisForm onDiagnosis={(result) => {
                    // Update history immediately if possible
                    setHistory(prev => [result, ...prev]);
                }} />
            </div>

            {loading ? (
                <div className="text-center text-muted py-8">Loading history...</div>
            ) : history.length === 0 ? (
                <div className="card text-center py-8">
                    <div className="text-muted mb-4" style={{ fontSize: '1.2rem' }}>No history found.</div>
                    <p className="text-main">Use the Symptom Checker above to check your symptoms.</p>
                </div>
            ) : (
                <div className="history-list">
                    {history.map((record, index) => (
                        <div key={record._id || index} className="card card-hover mb-4 history-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <div className="flex-center mb-2" style={{ justifyContent: 'flex-start', gap: '0.75rem' }}>
                                    <h3 className="card-title" style={{ margin: 0 }}>{record.diagnosis}</h3>

                                    <span style={{
                                        padding: '0.25rem 0.75rem',
                                        borderRadius: '999px',
                                        fontSize: '0.75rem',
                                        fontWeight: '600',
                                        background: record.severity === 'Critical' ? 'var(--danger-bg)' :
                                            record.severity === 'High' ? 'var(--warning-bg, #fffbeb)' : 'var(--success-bg)',
                                        color: record.severity === 'Critical' ? 'var(--danger)' :
                                            record.severity === 'High' ? 'var(--warning)' : 'var(--success)',
                                        border: `1px solid ${record.severity === 'Critical' ? 'var(--danger)' :
                                            record.severity === 'High' ? 'var(--warning)' : 'var(--success)'}`
                                    }}>
                                        {record.severity}
                                    </span>
                                </div>
                                <p className="text-main mb-2" style={{ fontSize: '0.9rem' }}>
                                    <strong className="text-heading">Symptoms:</strong> {record.symptoms && Array.isArray(record.symptoms) ? record.symptoms.join(', ') : 'No symptoms listed'}
                                </p>
                                <p className="text-muted mb-0" style={{ fontSize: '0.85rem' }}>
                                    {record.affectedSystems && Array.isArray(record.affectedSystems) ? record.affectedSystems.join(', ') : 'Unknown'} System(s)
                                </p>
                            </div>

                            <div className="text-muted" style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
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
