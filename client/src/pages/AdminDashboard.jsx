import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Trash2, Plus, X, Activity, BookOpen, Download, Search, Loader } from 'lucide-react';

const AdminDashboard = () => {
    const { token } = useAuth();
    const [activeTab, setActiveTab] = useState('diseases'); // 'diseases' or 'recommendations'
    const [diseases, setDiseases] = useState([]);
    const [recommendations, setRecommendations] = useState([]);
    const [showForm, setShowForm] = useState(false);

    // Import Mode State
    const [showImport, setShowImport] = useState(false);
    const [importTerm, setImportTerm] = useState('');
    const [importLoading, setImportLoading] = useState(false);
    const [importError, setImportError] = useState('');
    const [previewData, setPreviewData] = useState(null);

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
        // Reset forms when switching tabs
        setShowImport(false);
        setPreviewData(null);
    }, [token, activeTab]);

    // ... (handleDelete remains same)
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
            symptoms: typeof diseaseForm.symptoms === 'string' ? diseaseForm.symptoms.split(',').map(s => s.trim()).filter(Boolean) : diseaseForm.symptoms,
            affectedSystems: typeof diseaseForm.affectedSystems === 'string' ? diseaseForm.affectedSystems.split(',').map(s => s.trim()).filter(Boolean) : diseaseForm.affectedSystems,
            affectedOrgans: typeof diseaseForm.affectedOrgans === 'string' ? diseaseForm.affectedOrgans.split(',').map(s => s.trim()).filter(Boolean) : diseaseForm.affectedOrgans,
            treatment: typeof diseaseForm.treatment === 'string' ? diseaseForm.treatment.split(',').map(s => s.trim()).filter(Boolean) : diseaseForm.treatment
        };
        await submitData('api/admin/diseases', payload);
    };

    const handleRecSubmit = async (e) => {
        e.preventDefault();
        const payload = {
            ...recForm,
            symptoms: typeof recForm.symptoms === 'string' ? recForm.symptoms.split(',').map(s => s.trim()).filter(Boolean) : recForm.symptoms
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
                setShowImport(false);
                setPreviewData(null);
                setDiseaseForm({ name: '', severity: 'Low', symptoms: '', affectedSystems: '', affectedOrgans: '', description: '', treatment: '' });
                setRecForm({ name: '', type: 'Yoga', duration: '', difficulty: 'Beginner', description: '', symptoms: '', imageUrl: '', imageSource: '', imageLicense: '' });
                fetchData();
                alert('Saved successfully!');
            } else {
                const errData = await res.json();
                alert(`Error saving data: ${errData.message || 'Unknown error'}`);
            }
        } catch (err) {
            console.error(err);
            alert('Network error during save.');
        }
    };

    // --- Import Logic ---
    const handleBulkImport = async () => {
        setImportLoading(true);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/recommendations/import`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) {
                alert(data.message);
                fetchData();
            } else {
                alert(data.message || 'Import failed');
            }
        } catch (err) {
            console.error(err);
            alert('Network error');
        } finally {
            setImportLoading(false);
        }
    };

    const handleImportSearch = async (e) => {
        // ... (rest of existing logic)
        e.preventDefault();
        if (!importTerm.trim()) return;

        setImportLoading(true);
        setImportError('');
        setPreviewData(null);

        const endpoint = activeTab === 'diseases' ? 'api/admin/import/disease' : 'api/admin/import/exercise';

        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ term: importTerm })
            });
            const data = await res.json();

            if (res.ok) {
                setPreviewData(data);
                // Pre-fill the relevant form state so the admin can edit before saving
                if (activeTab === 'diseases') {
                    setDiseaseForm({
                        name: data.name || '',
                        severity: data.severity || 'Low', // Enhanced: use AI severity
                        symptoms: data.symptoms ? data.symptoms.join(', ') : '',
                        affectedSystems: data.affectedSystems ? data.affectedSystems.join(', ') : '',
                        affectedOrgans: data.affectedOrganIds ? data.affectedOrganIds.join(', ') : '',
                        description: data.description || '',
                        treatment: data.treatment ? data.treatment.join(', ') : ''
                    });
                } else {
                    setRecForm({
                        name: data.name || '',
                        type: data.type || 'Exercise',
                        duration: '10 mins', // Default
                        difficulty: data.difficulty || 'Beginner',
                        description: data.description || '',
                        symptoms: data.symptoms ? data.symptoms.join(', ') : '', // Fetched via AI now
                        imageUrl: data.imageUrl || '',
                        imageSource: data.imageSource || '',
                        imageLicense: data.imageLicense || ''
                    });
                }
            } else {
                setImportError(data.message || 'Import failed');
            }
        } catch (err) {
            console.error(err);
            setImportError('Network error');
        } finally {
            setImportLoading(false);
        }
    };

    return (
        <div className="container dashboard-container" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ color: 'var(--text-heading)', margin: '0 0 0.5rem 0' }}>Admin Control Center</h1>
                    <p style={{ color: 'var(--text-muted)', margin: 0 }}>Manage medical knowledge base.</p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button onClick={() => { setShowImport(!showImport); setShowForm(false); }} className={`btn ${showImport ? 'btn-secondary' : 'btn-ghost'}`} style={{ border: '1px solid var(--border-medium)' }}>
                        <Download size={18} /> Import Data
                    </button>
                    <button onClick={() => { setShowForm(!showForm); setShowImport(false); }} className="btn btn-primary">
                        {showForm ? <><X size={18} /> Cancel</> : <><Plus size={18} /> Manual Entry</>}
                    </button>
                </div>
            </div>

            <div className="tabs" style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--border-light)', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                        onClick={() => setActiveTab('diseases')}
                        className={`btn btn-ghost ${activeTab === 'diseases' ? 'active' : ''}`}
                        style={activeTab === 'diseases' ? { color: 'var(--primary)', borderBottom: '2px solid var(--primary)', borderRadius: '0', background: 'transparent' } : { borderRadius: '0' }}
                    >
                        <BookOpen size={18} /> Diseases
                    </button>
                    <button
                        onClick={() => setActiveTab('recommendations')}
                        className={`btn btn-ghost ${activeTab === 'recommendations' ? 'active' : ''}`}
                        style={activeTab === 'recommendations' ? { color: 'var(--primary)', borderBottom: '2px solid var(--primary)', borderRadius: '0', background: 'transparent' } : { borderRadius: '0' }}
                    >
                        <Activity size={18} /> Yoga & Exercises
                    </button>
                </div>
                {activeTab === 'recommendations' && (
                    <button onClick={handleBulkImport} className="btn btn-secondary" disabled={importLoading} style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}>
                        {importLoading ? <Loader className="animate-spin" size={16} /> : <Download size={16} />} Populate Defaults
                    </button>
                )}
            </div>

            {/* Import Section */}
            {showImport && (
                <div className="card mb-6" style={{ background: 'var(--primary-subtle)', border: '1px solid var(--primary-light)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h2 className="card-title" style={{ margin: 0, color: 'var(--primary)' }}>
                            <Download size={20} style={{ display: 'inline', marginRight: '8px' }} />
                            Import {activeTab === 'diseases' ? 'Disease' : 'Exercise'} Data
                        </h2>
                        <button onClick={() => setShowImport(false)} className="btn btn-ghost" style={{ padding: '4px' }}><X size={18} /></button>
                    </div>

                    <form onSubmit={handleImportSearch} style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                        <input
                            className="form-input"
                            placeholder={`Search Wikipedia/Wger for ${activeTab === 'diseases' ? 'diseases' : 'exercises'}...`}
                            value={importTerm}
                            onChange={(e) => setImportTerm(e.target.value)}
                            style={{ flex: 1, background: 'white' }}
                        />
                        <button type="submit" className="btn btn-primary" disabled={importLoading}>
                            {importLoading ? <Loader className="animate-spin" size={18} /> : <Search size={18} />} Search
                        </button>
                    </form>

                    {importError && (
                        <div className="alert alert-error">{importError}</div>
                    )}

                    {previewData && (
                        <div style={{ background: 'white', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                            <div style={{ marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-light)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <h3 style={{ margin: 0 }}>Preview: {previewData.name}</h3>
                                    <span className="text-muted" style={{ fontSize: '0.8rem' }}>Source: {previewData.source || previewData.imageSource || 'External API'}</span>
                                </div>
                                <p className="text-muted" style={{ margin: '0.5rem 0 0 0', fontSize: '0.9rem' }}>{previewData.description ? previewData.description.substring(0, 150) + '...' : 'No description available'}</p>
                            </div>

                            {/* Reuse the manual entry form but pre-filled */}
                            {activeTab === 'diseases' ? (
                                <form onSubmit={handleDiseaseSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                                    <input className="form-input" required placeholder="Disease Name" value={diseaseForm.name} onChange={e => setDiseaseForm({ ...diseaseForm, name: e.target.value })} />
                                    <select className="form-input" value={diseaseForm.severity} onChange={e => setDiseaseForm({ ...diseaseForm, severity: e.target.value })}>
                                        <option value="Low">Low</option> <option value="Medium">Medium</option> <option value="High">High</option> <option value="Critical">Critical</option>
                                    </select>
                                    <textarea className="form-input" required placeholder="Description (Auto-filled)" value={diseaseForm.description} onChange={e => setDiseaseForm({ ...diseaseForm, description: e.target.value })} style={{ gridColumn: 'span 2', minHeight: '100px' }} />

                                    <input className="form-input" placeholder="Symptoms (comma separated)" value={diseaseForm.symptoms} onChange={e => setDiseaseForm({ ...diseaseForm, symptoms: e.target.value })} style={{ gridColumn: 'span 2' }} />
                                    <input className="form-input" placeholder="Affected Systems (comma separated)" value={diseaseForm.affectedSystems} onChange={e => setDiseaseForm({ ...diseaseForm, affectedSystems: e.target.value })} />
                                    <input className="form-input" placeholder="Affected Organ IDs" value={diseaseForm.affectedOrgans} onChange={e => setDiseaseForm({ ...diseaseForm, affectedOrgans: e.target.value })} />
                                    <input className="form-input" placeholder="Treatments" value={diseaseForm.treatment} onChange={e => setDiseaseForm({ ...diseaseForm, treatment: e.target.value })} style={{ gridColumn: 'span 2' }} />

                                    <div style={{ gridColumn: 'span 2', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                                        <button type="button" onClick={() => setPreviewData(null)} className="btn btn-ghost">Cancel</button>
                                        <button type="submit" className="btn btn-primary">Import & Save</button>
                                    </div>
                                </form>
                            ) : (
                                <form onSubmit={handleRecSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                                    <input className="form-input" required placeholder="Name" value={recForm.name} onChange={e => setRecForm({ ...recForm, name: e.target.value })} />
                                    <select className="form-input" value={recForm.type} onChange={e => setRecForm({ ...recForm, type: e.target.value })}>
                                        <option value="Yoga">Yoga</option> <option value="Exercise">Exercise</option> <option value="Stretch">Stretch</option>
                                    </select>
                                    <textarea className="form-input" required placeholder="Description (Auto-filled)" value={recForm.description} onChange={e => setRecForm({ ...recForm, description: e.target.value })} style={{ gridColumn: 'span 2', minHeight: '80px' }} />

                                    <input className="form-input" placeholder="Symptoms (For recommendation logic)" value={recForm.symptoms} onChange={e => setRecForm({ ...recForm, symptoms: e.target.value })} style={{ gridColumn: 'span 2' }} />

                                    <div style={{ gridColumn: 'span 2', display: 'flex', gap: '0.75rem' }}>
                                        <input className="form-input" required placeholder="Image URL" value={recForm.imageUrl || ''} onChange={e => setRecForm({ ...recForm, imageUrl: e.target.value })} style={{ flex: 2 }} />
                                        <input className="form-input" required placeholder="Source" value={recForm.imageSource || ''} onChange={e => setRecForm({ ...recForm, imageSource: e.target.value })} style={{ flex: 1 }} />
                                    </div>

                                    <div style={{ gridColumn: 'span 2', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                                        <button type="button" onClick={() => setPreviewData(null)} className="btn btn-ghost">Cancel</button>
                                        <button type="submit" className="btn btn-primary">Import & Save</button>
                                    </div>
                                </form>
                            )}
                        </div>
                    )}
                </div>
            )}

            {showForm && (
                <div className="card mb-6">
                    <h2 className="card-title mb-4">New {activeTab === 'diseases' ? 'Disease' : 'Recommendation'} Entry</h2>
                    {/* Reuse existing create logic (simplified for brevity, normally componentize this) */}
                    {activeTab === 'diseases' ? (
                        <form onSubmit={handleDiseaseSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                            <input className="form-input" required placeholder="Disease Name" value={diseaseForm.name} onChange={e => setDiseaseForm({ ...diseaseForm, name: e.target.value })} />
                            <select className="form-input" value={diseaseForm.severity} onChange={e => setDiseaseForm({ ...diseaseForm, severity: e.target.value })}>
                                <option value="Low">Low</option> <option value="Medium">Medium</option> <option value="High">High</option> <option value="Critical">Critical</option>
                            </select>
                            <input className="form-input" required placeholder="Symptoms (comma separated)" value={diseaseForm.symptoms} onChange={e => setDiseaseForm({ ...diseaseForm, symptoms: e.target.value })} />
                            <input className="form-input" required placeholder="Affected Systems (comma separated)" value={diseaseForm.affectedSystems} onChange={e => setDiseaseForm({ ...diseaseForm, affectedSystems: e.target.value })} />
                            <input className="form-input" required placeholder="Affected Organ IDs (comma separated)" value={diseaseForm.affectedOrgans} onChange={e => setDiseaseForm({ ...diseaseForm, affectedOrgans: e.target.value })} />
                            <input className="form-input" required placeholder="Treatments (comma separated)" value={diseaseForm.treatment} onChange={e => setDiseaseForm({ ...diseaseForm, treatment: e.target.value })} />
                            <textarea className="form-input" required placeholder="Description" value={diseaseForm.description} onChange={e => setDiseaseForm({ ...diseaseForm, description: e.target.value })} style={{ gridColumn: 'span 2', minHeight: '100px' }} />
                            <div style={{ gridColumn: 'span 2' }}>
                                <button type="submit" className="btn btn-primary">Save Disease</button>
                            </div>
                        </form>
                    ) : (
                        <form onSubmit={handleRecSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                            <input className="form-input" required placeholder="Name (e.g. Cat-Cow)" value={recForm.name} onChange={e => setRecForm({ ...recForm, name: e.target.value })} />
                            <select className="form-input" value={recForm.type} onChange={e => setRecForm({ ...recForm, type: e.target.value })}>
                                <option value="Yoga">Yoga</option> <option value="Exercise">Exercise</option> <option value="Stretch">Stretch</option>
                            </select>
                            <input className="form-input" required placeholder="Duration (e.g. 5 mins)" value={recForm.duration} onChange={e => setRecForm({ ...recForm, duration: e.target.value })} />
                            <select className="form-input" value={recForm.difficulty} onChange={e => setRecForm({ ...recForm, difficulty: e.target.value })}>
                                <option value="Beginner">Beginner</option> <option value="Intermediate">Intermediate</option> <option value="Advanced">Advanced</option>
                            </select>
                            <input className="form-input" required placeholder="Symptoms (comma separated)" value={recForm.symptoms} onChange={e => setRecForm({ ...recForm, symptoms: e.target.value })} style={{ gridColumn: 'span 2' }} />

                            <div style={{ gridColumn: 'span 2', display: 'flex', gap: '0.75rem' }}>
                                <input className="form-input" required placeholder="Image URL (Unsplash/Wikimedia)" value={recForm.imageUrl || ''} onChange={e => setRecForm({ ...recForm, imageUrl: e.target.value })} style={{ flex: 2 }} />
                                <input className="form-input" required placeholder="Image Source (e.g. Unsplash)" value={recForm.imageSource || ''} onChange={e => setRecForm({ ...recForm, imageSource: e.target.value })} style={{ flex: 1 }} />
                                <input className="form-input" required placeholder="License (e.g. CC0)" value={recForm.imageLicense || ''} onChange={e => setRecForm({ ...recForm, imageLicense: e.target.value })} style={{ flex: 1 }} />
                            </div>

                            <textarea className="form-input" required placeholder="Description" value={recForm.description} onChange={e => setRecForm({ ...recForm, description: e.target.value })} style={{ gridColumn: 'span 2', minHeight: '80px' }} />
                            <div style={{ gridColumn: 'span 2' }}>
                                <button type="submit" className="btn btn-primary">Save Visual Recommendation</button>
                            </div>
                        </form>
                    )}
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
                {activeTab === 'diseases' ? diseases.map(d => (
                    <div key={d._id} className="card card-hover">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                            <h3 className="card-title" style={{ margin: 0 }}>{d.name}</h3>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span style={{ fontSize: '0.8rem', padding: '2px 8px', borderRadius: '4px', background: 'var(--bg-subtle)', color: 'var(--text-muted)' }}>{d.severity}</span>
                                <button onClick={() => handleDelete(d._id, 'disease')} className="btn btn-ghost" style={{ padding: '0.25rem', color: 'var(--danger)' }}><Trash2 size={18} /></button>
                            </div>
                        </div>
                        <p className="text-muted mb-2" style={{ fontSize: '0.85rem' }}><strong>System:</strong> {d.affectedSystems.join(', ')}</p>
                        <p className="text-muted mb-0" style={{ fontSize: '0.85rem' }}><strong>Symptoms:</strong> {d.symptoms.slice(0, 3).join(', ')}{d.symptoms.length > 3 && '...'}</p>
                    </div>
                )) : recommendations.map(r => (
                    <div key={r._id} className="card card-hover">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                            <h3 className="card-title" style={{ margin: 0 }}>{r.name}</h3>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span style={{ fontSize: '0.8rem', padding: '2px 8px', borderRadius: '4px', background: 'var(--success-bg)', color: 'var(--success)' }}>{r.type}</span>
                                <button onClick={() => handleDelete(r._id, 'recommendation')} className="btn btn-ghost" style={{ padding: '0.25rem', color: 'var(--danger)' }}><Trash2 size={18} /></button>
                            </div>
                        </div>
                        <p className="text-muted mb-2" style={{ fontSize: '0.85rem' }}><strong>Duration:</strong> {r.duration} • {r.difficulty}</p>
                        <p className="text-muted mb-0" style={{ fontSize: '0.85rem' }}><strong>For:</strong> {r.symptoms.join(', ')}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdminDashboard;
