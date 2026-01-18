import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { useAuth } from '../../context/AuthContext';

const DiagnosisForm = ({ onDiagnosis }) => {
    const [availableSymptoms, setAvailableSymptoms] = useState([]);
    const [selectedSymptoms, setSelectedSymptoms] = useState([]);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const { token } = useAuth();

    useEffect(() => {
        fetch('http://localhost:5000/api/diagnosis/symptoms')
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
                headers['Authorization'] = `Bearer ${token}`; // Send token if available
            }

            const response = await fetch('http://localhost:5000/api/diagnosis', {
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
            background: '#1e293b',
            borderColor: '#334155',
            color: 'white',
        }),
        menu: (base) => ({
            ...base,
            background: '#1e293b',
            color: 'white'
        }),
        option: (base, state) => ({
            ...base,
            background: state.isFocused ? '#334155' : '#1e293b',
            color: 'white',
            cursor: 'pointer'
        }),
        multiValue: (base) => ({
            ...base,
            background: '#334155',
        }),
        multiValueLabel: (base) => ({
            ...base,
            color: 'white',
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

    return (
        <div style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            width: '320px',
            background: 'rgba(15, 23, 42, 0.95)',
            backdropFilter: 'blur(10px)',
            padding: '24px',
            borderRadius: '16px',
            border: '1px solid #334155',
            color: 'white',
            zIndex: 20,
            boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
        }}>
            <h2 style={{ marginTop: 0, marginBottom: '20px', fontSize: '1.25rem' }}>Symptom Checker</h2>

            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#94a3b8' }}>
                        Select Symptoms
                    </label>
                    <Select
                        isMulti
                        options={availableSymptoms}
                        value={selectedSymptoms}
                        onChange={setSelectedSymptoms}
                        styles={customStyles}
                        placeholder="Type symptoms (e.g., headache)..."
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: '8px',
                        border: 'none',
                        background: '#4f46e5',
                        color: 'white',
                        fontWeight: 'bold',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        opacity: loading ? 0.7 : 1,
                        transition: 'background 0.2s'
                    }}
                >
                    {loading ? 'Analyzing...' : 'Diagnose'}
                </button>
            </form>

            {result && result.details ? (
                <div style={{ marginTop: '24px', borderTop: '1px solid #334155', paddingTop: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#38bdf8' }}>{result.diagnosis}</h3>
                        <span style={{
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '0.8rem',
                            fontWeight: 'bold',
                            background: result.severity === 'Critical' ? '#ef4444' :
                                result.severity === 'High' ? '#f59e0b' : '#22c55e',
                            color: 'white'
                        }}>
                            {result.severity}
                        </span>
                    </div>

                    <p style={{ fontSize: '0.9rem', color: '#cbd5e1', lineHeight: '1.4', marginBottom: '12px' }}>
                        {result.details.description}
                    </p>

                    <p style={{ margin: '0 0 12px 0', fontSize: '0.9rem', color: '#94a3b8' }}>
                        <strong>Affected Systems:</strong> <span style={{ color: 'white' }}>{result.affectedSystems.join(', ')}</span>
                    </p>

                    <div style={{ background: '#334155', padding: '12px', borderRadius: '8px', marginBottom: '12px' }}>
                        <h4 style={{ margin: '0 0 8px 0', fontSize: '0.9rem', color: '#cbd5e1' }}>Recommended Treatment</h4>
                        <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.9rem', color: 'white' }}>
                            {result.details.treatment && result.details.treatment.map((t, i) => (
                                <li key={i}>{t}</li>
                            ))}
                        </ul>
                    </div>

                    <div style={{ fontSize: '0.8rem', color: '#64748b', fontStyle: 'italic', textAlign: 'center' }}>
                        Based on analysis of provided symptoms.
                    </div>
                </div>
            ) : result && (
                <div style={{ marginTop: '24px', borderTop: '1px solid #334155', paddingTop: '16px' }}>
                    <p style={{ color: '#ef4444' }}>{result.message || 'No diagnosis found.'}</p>
                </div>
            )}
        </div>
    );
};

export default DiagnosisForm;
