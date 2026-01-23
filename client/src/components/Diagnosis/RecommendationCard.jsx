import React from 'react';
import { Clock, Activity } from 'lucide-react';

const RecommendationCard = ({ recommendation }) => {
    const { name, type, duration, difficulty, description, imageUrl, imageSource, imageLicense } = recommendation;

    const getDifficultyClass = (level) => {
        switch (level) {
            case 'Beginner': return 'text-success bg-success-subtle';
            case 'Intermediate': return 'text-warning bg-warning-subtle';
            case 'Advanced': return 'text-danger bg-danger-subtle';
            default: return 'text-info bg-info-subtle';
        }
    };

    // Helper since we didn't define utility classes for thesebg colors in index.css yet, defaulting to inline styles for pill colors
    const getDifficultyStyle = (level) => {
        switch (level) {
            case 'Beginner': return { color: '#16a34a', background: '#dcfce7', border: '1px solid #bbf7d0' };
            case 'Intermediate': return { color: '#d97706', background: '#fef3c7', border: '1px solid #fde68a' };
            case 'Advanced': return { color: '#dc2626', background: '#fee2e2', border: '1px solid #fca5a5' };
            default: return { color: '#0284c7', background: '#e0f2fe', border: '1px solid #bae6fd' };
        }
    };

    return (
        <div className="card card-hover p-0" style={{ padding: 0, overflow: 'hidden' }}>
            {/* Image Header */}
            {imageUrl && (
                <div style={{ width: '100%', height: '200px', overflow: 'hidden', position: 'relative' }}>
                    <img
                        src={imageUrl}
                        alt={name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => e.target.style.display = 'none'}
                    />
                    <div style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        background: 'linear-gradient(to top, rgba(15, 23, 42, 0.9), transparent)',
                        padding: '1.25rem 1.25rem 0.75rem 1.25rem'
                    }}>
                        <h3 style={{ margin: 0, color: 'white', fontSize: '1.25rem' }}>{name}</h3>
                        <span style={{ fontSize: '0.75rem', color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>{type}</span>
                    </div>
                </div>
            )}

            <div style={{ padding: '1.25rem' }}>
                {!imageUrl && (
                    <div className="mb-4">
                        <h3 className="card-title" style={{ fontSize: '1.25rem' }}>{name}</h3>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>{type}</span>
                    </div>
                )}

                <div className="flex-center" style={{ justifyContent: 'flex-start', gap: '1rem', marginBottom: '1rem' }}>
                    <span className="text-muted" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.85rem', fontWeight: 500 }}>
                        <Clock size={16} /> {duration}
                    </span>
                    <span style={{
                        padding: '0.25rem 0.625rem',
                        borderRadius: '0.375rem',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        ...getDifficultyStyle(difficulty)
                    }}>
                        {difficulty}
                    </span>
                </div>

                <p className="text-main mb-4" style={{ fontSize: '0.95rem', lineHeight: '1.6' }}>{description}</p>

                {/* Attribution Footer */}
                <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    <span>Source: {imageSource || 'Unknown'} ({imageLicense || 'Unknown'})</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Activity size={14} /> Ref Only
                    </span>
                </div>
            </div>
        </div>
    );
};

export default RecommendationCard;
