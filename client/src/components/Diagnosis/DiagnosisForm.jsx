import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { useAuth } from '../../context/AuthContext';
import { ChevronDown, ChevronUp, Activity, X } from 'lucide-react';

const DiagnosisForm = ({ onDiagnosis }) => {
    const [availableSymptoms, setAvailableSymptoms] = useState([]);
    const [selectedSymptoms, setSelectedSymptoms] = useState([]);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [isMinimized, setIsMinimized] = useState(false); // New State
    const { token } = useAuth();

    // ... (useEffect and handleSubmit remain same)
    useEffect(() => {
        fetch(`${import.meta.env.VITE_API_URL}/api/diagnosis/symptoms`)
            .then(res => res.json())
            .then(data => {
                const options = data.map(s => ({ value: s, label: s.charAt(0).toUpperCase() + s.slice(1) }));
                setAvailableSymptoms(options);
            })
            .catch(err => console.error('Failed to fetch symptoms', err));
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (selectedSymptoms.length === 0) return;

        setLoading(true);
        try {
            const headers = {
                'Content-Type': 'application/json'
            };
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/diagnosis`, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify({
                    symptoms: selectedSymptoms.map(s => s.value)
                })
            });
            const data = await response.json();
            setResult(data);
            onDiagnosis(data);
        } catch (err) {
            console.error('Diagnosis failed', err);
        } finally {
            setLoading(false);
        }
    };

    const customStyles = {
        control: (base) => ({
            ...base,
            background: 'rgba(30, 41, 59, 0.6)',
            borderColor: 'rgba(51, 65, 85, 0.5)',
            color: 'white',
            backdropFilter: 'blur(4px)'
        }),
        menu: (base) => ({
            ...base,
            background: '#1e293b',
            color: 'white',
            zIndex: 100
        }),
        option: (base, state) => ({
            ...base,
            background: state.isFocused ? '#334155' : '#1e293b',
            color: 'white',
            cursor: 'pointer'
        }),
        multiValue: (base) => ({
            ...base,
            background: 'rgba(56, 189, 248, 0.2)',
            border: '1px solid rgba(56, 189, 248, 0.3)',
        }),
        multiValueLabel: (base) => ({
            ...base,
            color: '#e0f2fe',
        }),
        multiValueRemove: (base) => ({
            ...base,
            color: '#94a3b8',
            ':hover': {
                background: '#ef4444',
                color: 'white'
            }
        }),
        input: (base) => ({
            ...base,
            color: 'white'
        })
    };

    // If minimized, show a sleek button
    if (isMinimized) {
        return (
            <button
                onClick={() => setIsMinimized(false)}
                style={{
                    position: 'absolute',
                    top: '20px',
                    left: '20px',
                    background: 'rgba(15, 23, 42, 0.6)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    padding: '12px 20px',
                    borderRadius: '12px',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                    zIndex: 20,
                    transition: 'all 0.3s ease'
                }}
            >
                <Activity size={20} color="#38bdf8" />
                <span style={{ fontWeight: 500 }}>Symptom Checker</span>
            </button>
        );
    }

    return (
        <div style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            width: '340px',
            maxHeight: '90vh',
            overflowY: 'auto',
            background: 'rgba(15, 23, 42, 0.75)', // Glassmorphism
            backdropFilter: 'blur(16px)',
            padding: '24px',
            borderRadius: '20px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            color: 'white',
            zIndex: 20,
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            transition: 'all 0.3s ease'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ background: 'rgba(56, 189, 248, 0.15)', padding: '8px', borderRadius: '10px' }}>
                        <Activity size={20} color="#38bdf8" />
                    </div>
                    <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, letterSpacing: '0.5px' }}>Check Symptoms</h2>
                </div>
                <button
                    onClick={() => setIsMinimized(true)}
                    style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
                >
                    <ChevronUp size={20} />
                </button>
            </div>

            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '10px', fontSize: '0.85rem', color: '#94a3b8', fontWeight: 500 }}>
                        What are you feeling?
                    </label>
                    <Select
                        isMulti
                        options={availableSymptoms}
                        value={selectedSymptoms}
                        onChange={setSelectedSymptoms}
                        styles={customStyles}
                        placeholder="Search symptoms..."
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    style={{
                        width: '100%',
                        padding: '14px',
                        borderRadius: '12px',
                        border: 'none',
                        background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                        color: 'white',
                        fontWeight: '600',
                        fontSize: '0.95rem',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        opacity: loading ? 0.7 : 1,
                        boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
                        transition: 'transform 0.2s, box-shadow 0.2s'
                    }}
                    onMouseOver={e => !loading && (e.currentTarget.style.transform = 'translateY(-1px)')}
                    onMouseOut={e => !loading && (e.currentTarget.style.transform = 'translateY(0)')}
                >
                    {loading ? 'Analyzing...' : 'Analyze Symptoms'}
                </button>
            </form>

            {result && result.details ? (
                <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                        <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#e0f2fe', fontWeight: 600 }}>{result.diagnosis}</h3>
                        <span style={{
                            padding: '4px 10px',
                            borderRadius: '20px',
                            fontSize: '0.75rem',
                            fontWeight: '700',
                            background: result.severity === 'Critical' ? 'rgba(239, 68, 68, 0.2)' :
                                result.severity === 'High' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(34, 197, 94, 0.2)',
                            color: result.severity === 'Critical' ? '#fca5a5' :
                                result.severity === 'High' ? '#fcd34d' : '#86efac',
                            border: `1px solid ${result.severity === 'Critical' ? 'rgba(239, 68, 68, 0.3)' :
                                result.severity === 'High' ? 'rgba(245, 158, 11, 0.3)' : 'rgba(34, 197, 94, 0.3)'}`
                        }}>
                            {result.severity.toUpperCase()}
                        </span>
                    </div>

                    <p style={{ fontSize: '0.9rem', color: '#cbd5e1', lineHeight: '1.6', marginBottom: '16px' }}>
                        {result.details.description}
                    </p>

                    <div style={{ background: 'rgba(15, 23, 42, 0.4)', padding: '16px', borderRadius: '12px', marginBottom: '16px' }}>
                        <h4 style={{ margin: '0 0 10px 0', fontSize: '0.85rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Treatment Plan</h4>
                        <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.9rem', color: '#e2e8f0', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            {result.details.treatment && result.details.treatment.map((t, i) => (
                                <li key={i}>{t}</li>
                            ))}
                        </ul>
                    </div>

                    <div style={{ fontSize: '0.75rem', color: '#64748b', textAlign: 'center' }}>
                        AI-generated diagnosis. Consult a doctor for medical advice.
                    </div>
                </div>
            ) : result && (
                <div style={{ marginTop: '20px', padding: '12px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                    <p style={{ margin: 0, color: '#fca5a5', fontSize: '0.9rem', textAlign: 'center' }}>{result.message || 'No diagnosis found.'}</p>
                </div>
            )}
        </div>
    );
};

export default React.memo(DiagnosisForm);
