import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Trash2, Plus, X, Activity, BookOpen } from 'lucide-react';

const AdminDashboard = () => {
    const { token } = useAuth();
    const [activeTab, setActiveTab] = useState('diseases'); // 'diseases' or 'recommendations'
    const [diseases, setDiseases] = useState([]);
    const [recommendations, setRecommendations] = useState([]);
    const [showForm, setShowForm] = useState(false);

    // Disease Form State
    const [diseaseForm, setDiseaseForm] = useState({
        name: '', severity: 'Low', symptoms: '', affectedSystems: '', affectedOrgans: '', description: '', treatment: ''
    });

    // Recommendation Form State
    const [recForm, setRecForm] = useState({
        name: '', type: 'Yoga', duration: '', difficulty: 'Beginner', description: '', symptoms: '', imageUrl: '', imageSource: '', imageLicense: ''
    });

    const fetchData = async () => {
        try {
            if (activeTab === 'diseases') {
                const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/diseases`, { headers: { 'Authorization': `Bearer ${token}` } });
                if (res.ok) setDiseases(await res.json());
            } else {
                const res = await fetch(`${import.meta.env.VITE_API_URL}/api/recommendations`, { headers: { 'Authorization': `Bearer ${token}` } });
                if (res.ok) setRecommendations(await res.json());
            }
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchData();
    }, [token, activeTab]);

    const handleDelete = async (id, type) => {
        if (!window.confirm('Are you sure?')) return;
        const endpoint = type === 'disease' ? `api/admin/diseases/${id}` : `api/recommendations/${id}`;
        try {
            await fetch(`${import.meta.env.VITE_API_URL}/${endpoint}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            fetchData();
        } catch (err) {
            console.error(err);
        }
    };

    const handleDiseaseSubmit = async (e) => {
        e.preventDefault();
        const payload = {
            ...diseaseForm,
            symptoms: diseaseForm.symptoms.split(',').map(s => s.trim()),
            affectedSystems: diseaseForm.affectedSystems.split(',').map(s => s.trim()),
            affectedOrgans: diseaseForm.affectedOrgans.split(',').map(s => s.trim()),
            treatment: diseaseForm.treatment.split(',').map(s => s.trim())
        };
        await submitData('api/admin/diseases', payload);
    };

    const handleRecSubmit = async (e) => {
        e.preventDefault();
        const payload = {
            ...recForm,
            symptoms: recForm.symptoms.split(',').map(s => s.trim())
        };
        await submitData('api/recommendations', payload);
    };

    const submitData = async (endpoint, payload) => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                setShowForm(false);
                setDiseaseForm({ name: '', severity: 'Low', symptoms: '', affectedSystems: '', affectedOrgans: '', description: '', treatment: '' });
                setRecForm({ name: '', type: 'Yoga', duration: '', difficulty: 'Beginner', description: '', symptoms: '', imageUrl: '', imageSource: '', imageLicense: '' });
                fetchData();
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h1 style={{ color: '#064e3b', margin: '0 0 8px 0' }}>Admin Control Center</h1>
                    <p style={{ color: '#64748b', margin: 0 }}>Manage medical knowledge base.</p>
                </div>
                <button onClick={() => setShowForm(!showForm)} style={btnStyle}>
                    {showForm ? <><X size={18} /> Cancel</> : <><Plus size={18} /> Add New</>}
                </button>
            </div>

            <div style={{ display: 'flex', gap: '20px', marginBottom: '32px', borderBottom: '1px solid #e2e8f0' }}>
                <button onClick={() => setActiveTab('diseases')} style={activeTab === 'diseases' ? activeTabStyle : tabStyle}>
                    <BookOpen size={18} /> Diseases
                </button>
                <button onClick={() => setActiveTab('recommendations')} style={activeTab === 'recommendations' ? activeTabStyle : tabStyle}>
                    <Activity size={18} /> Yoga & Exercises
                </button>
            </div>

            {showForm && (
                <div style={{ background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', marginBottom: '32px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                    <h2 style={{ margin: '0 0 24px 0', color: '#064e3b' }}>New {activeTab === 'diseases' ? 'Disease' : 'Recommendation'} Entry</h2>

                    {activeTab === 'diseases' ? (
                        <form onSubmit={handleDiseaseSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            <input required placeholder="Disease Name" value={diseaseForm.name} onChange={e => setDiseaseForm({ ...diseaseForm, name: e.target.value })} style={inputStyle} />
                            <select value={diseaseForm.severity} onChange={e => setDiseaseForm({ ...diseaseForm, severity: e.target.value })} style={inputStyle}>
                                <option value="Low">Low</option> <option value="Medium">Medium</option> <option value="High">High</option> <option value="Critical">Critical</option>
                            </select>
                            <input required placeholder="Symptoms (comma separated)" value={diseaseForm.symptoms} onChange={e => setDiseaseForm({ ...diseaseForm, symptoms: e.target.value })} style={inputStyle} />
                            <input required placeholder="Affected Systems (comma separated)" value={diseaseForm.affectedSystems} onChange={e => setDiseaseForm({ ...diseaseForm, affectedSystems: e.target.value })} style={inputStyle} />
                            <input required placeholder="Affected Organ IDs (comma separated)" value={diseaseForm.affectedOrgans} onChange={e => setDiseaseForm({ ...diseaseForm, affectedOrgans: e.target.value })} style={inputStyle} />
                            <input required placeholder="Treatments (comma separated)" value={diseaseForm.treatment} onChange={e => setDiseaseForm({ ...diseaseForm, treatment: e.target.value })} style={inputStyle} />
                            <textarea required placeholder="Description" value={diseaseForm.description} onChange={e => setDiseaseForm({ ...diseaseForm, description: e.target.value })} style={{ ...inputStyle, gridColumn: 'span 2', minHeight: '100px' }} />
                            <button type="submit" style={submitBtnStyle}>Save Disease</button>
                        </form>
                    ) : (
                        <form onSubmit={handleRecSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            <input required placeholder="Name (e.g. Cat-Cow)" value={recForm.name} onChange={e => setRecForm({ ...recForm, name: e.target.value })} style={inputStyle} />
                            <select value={recForm.type} onChange={e => setRecForm({ ...recForm, type: e.target.value })} style={inputStyle}>
                                <option value="Yoga">Yoga</option> <option value="Exercise">Exercise</option> <option value="Stretch">Stretch</option>
                            </select>
                            <input required placeholder="Duration (e.g. 5 mins)" value={recForm.duration} onChange={e => setRecForm({ ...recForm, duration: e.target.value })} style={inputStyle} />
                            <select value={recForm.difficulty} onChange={e => setRecForm({ ...recForm, difficulty: e.target.value })} style={inputStyle}>
                                <option value="Beginner">Beginner</option> <option value="Intermediate">Intermediate</option> <option value="Advanced">Advanced</option>
                            </select>
                            <input required placeholder="Symptoms (comma separated)" value={recForm.symptoms} onChange={e => setRecForm({ ...recForm, symptoms: e.target.value })} style={{ ...inputStyle, gridColumn: 'span 2' }} />

                            <div style={{ gridColumn: 'span 2', display: 'flex', gap: '12px' }}>
                                <input required placeholder="Image URL (Unsplash/Wikimedia)" value={recForm.imageUrl || ''} onChange={e => setRecForm({ ...recForm, imageUrl: e.target.value })} style={{ ...inputStyle, flex: 2 }} />
                                <input required placeholder="Image Source (e.g. Unsplash)" value={recForm.imageSource || ''} onChange={e => setRecForm({ ...recForm, imageSource: e.target.value })} style={{ ...inputStyle, flex: 1 }} />
                                <input required placeholder="License (e.g. CC0)" value={recForm.imageLicense || ''} onChange={e => setRecForm({ ...recForm, imageLicense: e.target.value })} style={{ ...inputStyle, flex: 1 }} />
                            </div>

                            <textarea required placeholder="Description" value={recForm.description} onChange={e => setRecForm({ ...recForm, description: e.target.value })} style={{ ...inputStyle, gridColumn: 'span 2', minHeight: '80px' }} />
                            <button type="submit" style={submitBtnStyle}>Save Visual Recommendation</button>
                        </form>
                    )}
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                {activeTab === 'diseases' ? diseases.map(d => (
                    <div key={d._id} style={cardStyle}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                            <h3 style={{ margin: 0, color: '#064e3b' }}>{d.name}</h3>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontSize: '0.8rem', padding: '2px 8px', borderRadius: '4px', background: '#f1f5f9', color: '#64748b' }}>{d.severity}</span>
                                <button onClick={() => handleDelete(d._id, 'disease')} style={deleteBtnStyle}><Trash2 size={18} /></button>
                            </div>
                        </div>
                        <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 8px 0' }}><strong>System:</strong> {d.affectedSystems.join(', ')}</p>
                        <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}><strong>Symptoms:</strong> {d.symptoms.slice(0, 3).join(', ')}{d.symptoms.length > 3 && '...'}</p>
                    </div>
                )) : recommendations.map(r => (
                    <div key={r._id} style={cardStyle}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                            <h3 style={{ margin: 0, color: '#064e3b' }}>{r.name}</h3>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontSize: '0.8rem', padding: '2px 8px', borderRadius: '4px', background: '#d1fae5', color: '#059669' }}>{r.type}</span>
                                <button onClick={() => handleDelete(r._id, 'recommendation')} style={deleteBtnStyle}><Trash2 size={18} /></button>
                            </div>
                        </div>
                        <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 8px 0' }}><strong>Duration:</strong> {r.duration} • {r.difficulty}</p>
                        <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}><strong>For:</strong> {r.symptoms.join(', ')}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

// Light Theme Styles
const inputStyle = { padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', color: '#1e293b', width: '100%', boxSizing: 'border-box' };
const btnStyle = { background: '#10b981', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 2px 4px rgba(16, 185, 129, 0.2)' };
const tabStyle = { background: 'transparent', color: '#64748b', border: 'none', padding: '12px 24px', cursor: 'pointer', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '2px solid transparent' };
const activeTabStyle = { ...tabStyle, color: '#10b981', borderBottom: '2px solid #10b981' };
const cardStyle = { background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' };
const deleteBtnStyle = { background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' };
const submitBtnStyle = { gridColumn: 'span 2', padding: '12px', background: '#059669', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 6px rgba(5, 150, 105, 0.2)' };

export default AdminDashboard;
