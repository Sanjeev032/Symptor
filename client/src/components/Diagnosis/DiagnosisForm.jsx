import React, { useState, useEffect } from 'react';
import CreatableSelect from 'react-select/creatable';
import { useAuth } from '../../context/AuthContext';
import { Activity, X, AlertCircle } from 'lucide-react';
import RecommendationCard from './RecommendationCard';

const DiagnosisForm = ({ onDiagnosis }) => {
    const [availableSymptoms, setAvailableSymptoms] = useState([]);
    const [selectedSymptoms, setSelectedSymptoms] = useState([]);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const { token } = useAuth();

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
            background: 'var(--bg-card)',
            borderColor: state.isFocused ? 'var(--primary)' : 'var(--border-light)',
            boxShadow: state.isFocused ? 'var(--focus-ring)' : 'none',
            padding: '2px',
            borderRadius: 'var(--radius-md)',
            '&:hover': {
                borderColor: 'var(--primary-light)'
            }
        }),
        menu: (base) => ({
            ...base,
            zIndex: 100,
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-light)',
            boxShadow: 'var(--shadow-md)',
            padding: '4px',
            background: 'var(--bg-card)'
        }),
        option: (base, state) => ({
            ...base,
            background: state.isFocused ? 'var(--bg-subtle)' : 'transparent',
            color: 'var(--text-main)',
            borderRadius: 'var(--radius-sm)',
            cursor: 'pointer',
            padding: '8px 12px',
            fontSize: '0.9rem'
        }),
        multiValue: (base) => ({
            ...base,
            background: 'var(--bg-subtle)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-light)'
        }),
        multiValueLabel: (base) => ({
            ...base,
            color: 'var(--text-heading)',
            fontWeight: '500'
        }),
        multiValueRemove: (base) => ({
            ...base,
            color: 'var(--text-muted)',
            ':hover': {
                background: 'var(--danger-bg)',
                color: 'var(--danger)'
            }
        }),
        input: (base) => ({
            ...base,
            color: 'var(--text-main)'
        })
    };

    return (
        <div className="card">
            <div className="flex-center" style={{ justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ background: 'var(--primary-subtle)', padding: '0.75rem', borderRadius: '1rem', color: 'var(--primary)' }}>
                        <Activity size={28} />
                    </div>
                    <div>
                        <h2 className="card-title" style={{ fontSize: '1.5rem', margin: 0 }}>Symptom Checker</h2>
                        <p className="text-muted" style={{ margin: 0 }}>AI-powered preliminary diagnosis</p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="form-group mb-6">
                    <label className="form-label mb-2">What are you feeling?</label>
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
                    className="btn btn-primary btn-full"
                    disabled={loading}
                    style={{ fontSize: '1.1rem', padding: '1rem' }}
                >
                    {loading ? 'Analyzing...' : 'Analyze Symptoms'}
                </button>
            </form>

            {result && result.details ? (
                <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid var(--border-light)' }}>
                    <div className="flex-center" style={{ justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <h3 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--text-heading)', fontWeight: 700 }}>{result.diagnosis}</h3>
                            {result.isAiPrediction && (
                                <span style={{
                                    fontSize: '0.75rem',
                                    background: '#f3e8ff',
                                    color: '#7e22ce',
                                    padding: '0.25rem 0.625rem',
                                    borderRadius: '999px',
                                    fontWeight: '600',
                                    border: '1px solid #d8b4fe'
                                }}>
                                    AI Insight
                                </span>
                            )}
                        </div>
                        <span style={{
                            padding: '0.375rem 0.75rem',
                            borderRadius: '999px',
                            fontSize: '0.8rem',
                            fontWeight: '600',
                            background: result.severity === 'Critical' ? 'var(--danger-bg)' :
                                result.severity === 'High' ? 'var(--warning-bg)' : 'var(--success-bg)',
                            color: result.severity === 'Critical' ? 'var(--danger)' :
                                result.severity === 'High' ? 'var(--warning)' : 'var(--success)',
                            border: `1px solid ${result.severity === 'Critical' ? 'var(--danger)' :
                                result.severity === 'High' ? 'var(--warning)' : 'var(--success)'}`
                        }}>
                            {result.severity && result.severity.toUpperCase ? result.severity.toUpperCase() : 'UNKNOWN'}
                        </span>
                    </div>

                    <p className="text-main mb-6" style={{ lineHeight: '1.7', fontSize: '1rem' }}>
                        {result.details.description}
                    </p>

                    <div style={{ background: 'var(--bg-subtle)', padding: '1.5rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>
                        <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '600' }}>Treatment Plan</h4>
                        <ul style={{ margin: 0, paddingLeft: '1.25rem', color: 'var(--text-main)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {result.details.treatment && Array.isArray(result.details.treatment) && result.details.treatment.map((t, i) => (
                                <li key={i}>{t}</li>
                            ))}
                        </ul>
                    </div>

                    {/* Yoga & Exercise Recommendations */}
                    {result.recommendations && result.recommendations.length > 0 && (
                        <div style={{ marginTop: '2rem' }}>
                            <h4 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', color: 'var(--text-heading)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Activity size={20} className="text-primary" /> Recovery Guidance
                            </h4>
                            <div style={{ display: 'grid', gap: '1rem' }}>
                                {result.recommendations.map((rec) => (
                                    <RecommendationCard key={rec._id} recommendation={rec} />
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="text-center text-muted mt-6 pt-4" style={{ fontSize: '0.85rem', borderTop: '1px solid var(--border-light)' }}>
                        AI-generated diagnosis. Consult a doctor for professional medical advice.
                    </div>
                </div>
            ) : result && (
                <div className="alert alert-error mt-4 flex-center" style={{ justifyContent: 'flex-start', gap: '0.75rem' }}>
                    <X size={20} />
                    <span style={{ fontWeight: 500 }}>{result.message || 'No diagnosis found.'}</span>
                </div>
            )}
        </div>
    );
};

export default React.memo(DiagnosisForm);
