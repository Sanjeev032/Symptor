import React, { useState, useEffect } from 'react';
import CreatableSelect from 'react-select/creatable';
import { useAuth } from '../../context/AuthContext';
import { Activity, X } from 'lucide-react';
import RecommendationCard from './RecommendationCard';

const DiagnosisForm = ({ onDiagnosis }) => {
    const [availableSymptoms, setAvailableSymptoms] = useState([]);
    const [selectedSymptoms, setSelectedSymptoms] = useState([]);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
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
        control: (base, state) => ({
            ...base,
            background: 'white',
            borderColor: state.isFocused ? 'var(--primary)' : 'var(--border-light)',
            boxShadow: state.isFocused ? '0 0 0 3px rgba(5, 150, 105, 0.1)' : 'none',
            padding: '4px',
            borderRadius: '10px',
            '&:hover': {
                borderColor: 'var(--primary)'
            }
        }),
        menu: (base) => ({
            ...base,
            zIndex: 100,
            borderRadius: '10px',
            border: '1px solid var(--border-light)',
            boxShadow: 'var(--shadow-card)',
            padding: '8px'
        }),
        option: (base, state) => ({
            ...base,
            background: state.isFocused ? 'var(--bg-subtle)' : 'white',
            color: 'var(--text-main)',
            borderRadius: '6px',
            cursor: 'pointer',
            padding: '10px 12px',
            fontSize: '0.9rem'
        }),
        multiValue: (base) => ({
            ...base,
            background: 'var(--bg-subtle)',
            borderRadius: '6px',
            border: '1px solid var(--border-light)'
        }),
        multiValueLabel: (base) => ({
            ...base,
            color: 'var(--text-main)',
            fontWeight: '500'
        }),
        multiValueRemove: (base) => ({
            ...base,
            color: 'var(--text-muted)',
            ':hover': {
                background: '#fee2e2',
                color: '#ef4444'
            }
        })
    };

    return (
        <div style={{
            width: '100%',
            background: 'var(--bg-glass-card)',
            backdropFilter: 'var(--backdrop-blur)',
            padding: '40px',
            borderRadius: 'var(--radius-lg)',
            border: 'var(--glass-border)',
            boxShadow: 'var(--glass-shadow)',
            transition: 'all 0.3s ease'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ background: 'rgba(5, 150, 105, 0.1)', padding: '12px', borderRadius: '16px' }}>
                        <Activity size={28} color="var(--primary)" />
                    </div>
                    <div>
                        <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-heading)', letterSpacing: '-0.025em' }}>Symptom Checker</h2>
                        <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>AI-powered preliminary diagnosis</p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '24px' }}>
                    <label style={{ display: 'block', marginBottom: '10px', fontSize: '0.95rem', color: 'var(--text-heading)', fontWeight: 700 }}>
                        What are you feeling?
                    </label>
                    <CreatableSelect
                        isMulti
                        options={availableSymptoms}
                        value={selectedSymptoms}
                        onChange={(newValue) => setSelectedSymptoms(newValue)}
                        styles={customStyles}
                        placeholder="Type symptoms (e.g., headache, fever)..."
                        formatCreateLabel={(inputValue) => `Add "${inputValue}"`}
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    style={{
                        width: '100%',
                        padding: '16px',
                        borderRadius: 'var(--radius-md)',
                        border: 'none',
                        background: 'var(--primary)',
                        color: 'white',
                        fontWeight: '700',
                        fontSize: '1.1rem',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        opacity: loading ? 0.8 : 1,
                        boxShadow: '0 8px 20px -4px rgba(5, 150, 105, 0.3)',
                        transition: 'all 0.2s',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: '10px',
                        marginTop: '16px'
                    }}
                    onMouseOver={e => !loading && (e.currentTarget.style.background = 'var(--primary-hover)')}
                    onMouseOut={e => !loading && (e.currentTarget.style.background = 'var(--primary)')}
                >
                    {loading ? <Activity className="animate-spin" size={24} /> : 'Analyze Symptoms'}
                </button>
            </form>

            {result && result.details ? (
                <div style={{ marginTop: '32px', paddingTop: '32px', borderTop: '1px solid var(--border-light)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <h3 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--text-heading)', fontWeight: 700, letterSpacing: '-0.025em' }}>{result.diagnosis}</h3>
                            {result.isAiPrediction && (
                                <span style={{
                                    fontSize: '0.75rem',
                                    background: '#f3e8ff', // Soft Purple
                                    color: '#7e22ce',
                                    padding: '4px 10px',
                                    borderRadius: '20px',
                                    fontWeight: '600',
                                    border: '1px solid #d8b4fe'
                                }}>
                                    AI Insight
                                </span>
                            )}
                        </div>
                        <span style={{
                            padding: '6px 12px',
                            borderRadius: '20px',
                            fontSize: '0.8rem',
                            fontWeight: '600',
                            background: result.severity === 'Critical' ? '#fee2e2' :
                                result.severity === 'High' ? '#fef3c7' : '#d1fae5',
                            color: result.severity === 'Critical' ? '#dc2626' :
                                result.severity === 'High' ? '#d97706' : '#059669',
                            border: `1px solid ${result.severity === 'Critical' ? '#fca5a5' :
                                result.severity === 'High' ? '#fcd34d' : '#6ee7b7'
                                }`
                        }}>
                            {result.severity && result.severity.toUpperCase ? result.severity.toUpperCase() : 'UNKNOWN'}
                        </span>
                    </div>

                    <p style={{ fontSize: '1rem', color: 'var(--text-main)', lineHeight: '1.7', marginBottom: '24px' }}>
                        {result.details.description}
                    </p>

                    <div style={{ background: 'var(--bg-subtle)', padding: '24px', borderRadius: '12px', marginBottom: '24px', border: '1px solid var(--border-subtle)' }}>
                        <h4 style={{ margin: '0 0 16px 0', fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>Treatment Plan</h4>
                        <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.95rem', color: 'var(--text-main)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {result.details.treatment && Array.isArray(result.details.treatment) && result.details.treatment.map((t, i) => (
                                <li key={i}>{t}</li>
                            ))}
                        </ul>
                    </div>

                    {/* Yoga & Exercise Recommendations */}
                    {result.recommendations && result.recommendations.length > 0 && (
                        <div style={{ marginTop: '32px' }}>
                            <h4 style={{ margin: '0 0 20px 0', fontSize: '1.1rem', color: 'var(--text-heading)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <Activity size={20} color="var(--primary)" /> Recovery Guidance
                            </h4>
                            <div style={{ display: 'grid', gap: '16px' }}>
                                {result.recommendations.map((rec) => (
                                    <RecommendationCard key={rec._id} recommendation={rec} />
                                ))}
                            </div>
                        </div>
                    )}

                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '32px', paddingTop: '16px', borderTop: '1px solid var(--border-light)' }}>
                        AI-generated diagnosis. Consult a doctor for professional medical advice.
                    </div>
                </div>
            ) : result && (
                <div style={{ marginTop: '24px', padding: '16px', background: '#fee2e2', borderRadius: '12px', border: '1px solid #fca5a5', display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <X color="#dc2626" />
                    <p style={{ margin: 0, color: '#b91c1c', fontSize: '0.95rem', fontWeight: '500' }}>{result.message || 'No diagnosis found.'}</p>
                </div>
            )}
        </div>
    );
};

export default React.memo(DiagnosisForm);
