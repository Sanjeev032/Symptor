import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Trash2, Plus, X } from 'lucide-react';

const AdminDashboard = () => {
    const { token } = useAuth();
    const [diseases, setDiseases] = useState([]);
    const [showForm, setShowForm] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        severity: 'Low',
        symptoms: '', // Comma separated
        affectedSystems: '', // Comma separated
        affectedOrgans: '', // Comma separated
        description: '',
        treatment: '' // Comma separated
    });

    const fetchDiseases = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/diseases`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) setDiseases(data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchDiseases();
    }, [token]);

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure?')) return;
        try {
            await fetch(`${import.meta.env.VITE_API_URL}/api/admin/diseases/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            fetchDiseases();
        } catch (err) {
            console.error(err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Transform strings to arrays
        const payload = {
            ...formData,
            symptoms: formData.symptoms.split(',').map(s => s.trim()),
            affectedSystems: formData.affectedSystems.split(',').map(s => s.trim()),
            affectedOrgans: formData.affectedOrgans.split(',').map(s => s.trim()),
            treatment: formData.treatment.split(',').map(s => s.trim())
        };

        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/diseases`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                setShowForm(false);
                setFormData({
                    name: '', severity: 'Low', symptoms: '', affectedSystems: '', affectedOrgans: '', description: '', treatment: ''
                });
                fetchDiseases();
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h1 style={{ color: '#f59e0b', margin: '0 0 8px 0' }}>Admin Control Center</h1>
                    <p style={{ color: '#94a3b8', margin: 0 }}>Manage medical knowledge base.</p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    style={{
                        background: '#4f46e5',
                        color: 'white',
                        border: 'none',
                        padding: '10px 20px',
                        borderRadius: '8px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}
                >
                    {showForm ? <><X size={18} /> Cancel</> : <><Plus size={18} /> Add Disease</>}
                </button>
            </div>

            {showForm && (
                <div style={{ background: '#1e293b', padding: '24px', borderRadius: '16px', border: '1px solid #334155', marginBottom: '32px' }}>
                    <h2 style={{ margin: '0 0 24px 0', color: 'white' }}>New Disease Entry</h2>
                    <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <input required placeholder="Disease Name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} style={inputStyle} />
                        <select value={formData.severity} onChange={e => setFormData({ ...formData, severity: e.target.value })} style={inputStyle}>
                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                            <option value="Critical">Critical</option>
                        </select>
                        <input required placeholder="Symptoms (comma separated)" value={formData.symptoms} onChange={e => setFormData({ ...formData, symptoms: e.target.value })} style={inputStyle} />
                        <input required placeholder="Affected Systems (comma separated)" value={formData.affectedSystems} onChange={e => setFormData({ ...formData, affectedSystems: e.target.value })} style={inputStyle} />
                        <input required placeholder="Affected Organ IDs (comma separated)" value={formData.affectedOrgans} onChange={e => setFormData({ ...formData, affectedOrgans: e.target.value })} style={inputStyle} />
                        <input required placeholder="Treatments (comma separated)" value={formData.treatment} onChange={e => setFormData({ ...formData, treatment: e.target.value })} style={inputStyle} />
                        <textarea required placeholder="Description" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} style={{ ...inputStyle, gridColumn: 'span 2', minHeight: '100px' }} />

                        <button type="submit" style={{ gridColumn: 'span 2', padding: '12px', background: '#22c55e', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Save Disease</button>
                    </form>
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                {diseases.map(d => (
                    <div key={d._id} style={{ background: '#1e293b', padding: '20px', borderRadius: '12px', border: '1px solid #334155', position: 'relative' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                            <h3 style={{ margin: 0, color: 'white' }}>{d.name}</h3>
                            <span style={{ fontSize: '0.8rem', padding: '2px 8px', borderRadius: '4px', background: '#334155', color: '#cbd5e1' }}>{d.severity}</span>
                        </div>
                        <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: '0 0 8px 0' }}><strong>System:</strong> {d.affectedSystems.join(', ')}</p>
                        <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0 }}><strong>Symptoms:</strong> {d.symptoms.slice(0, 3).join(', ')}{d.symptoms.length > 3 && '...'}</p>

                        <button
                            onClick={() => handleDelete(d._id)}
                            style={{
                                position: 'absolute',
                                top: '20px',
                                right: '20px',
                                background: 'transparent',
                                border: 'none',
                                color: '#ef4444',
                                cursor: 'pointer'
                            }}
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

const inputStyle = {
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #475569',
    background: '#0f172a',
    color: 'white',
    width: '100%',
    boxSizing: 'border-box'
};

export default AdminDashboard;
