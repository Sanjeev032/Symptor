import React from 'react';
import { Clock, Activity, AlertTriangle, CheckCircle } from 'lucide-react';

const RecommendationCard = ({ recommendation }) => {
    const { name, type, duration, difficulty, description, imageUrl, imageSource, imageLicense } = recommendation;

    const getDifficultyColor = (level) => {
        switch (level) {
            case 'Beginner': return '#22c55e';
            case 'Intermediate': return '#f59e0b';
            case 'Advanced': return '#ef4444';
            default: return '#38bdf8';
        }
    };

    return (
        <div style={{
            background: 'var(--bg-glass-card)',
            backdropFilter: 'var(--backdrop-blur)',
            border: 'var(--glass-border)',
            borderRadius: 'var(--radius-md)',
            overflow: 'hidden', // Contain image
            marginBottom: '16px',
            boxShadow: 'var(--shadow-soft)',
            transition: 'transform 0.2s',
        }}
            onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
        >
            {/* Valid Image Header */}
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
                        padding: '20px 20px 10px 20px'
                    }}>
                        <h3 style={{ margin: 0, color: 'white', fontSize: '1.2rem' }}>{name}</h3>
                        <span style={{ fontSize: '0.8rem', color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{type}</span>
                    </div>
                </div>
            )}

            <div style={{ padding: '24px' }}>
                {!imageUrl && (
                    <div style={{ marginBottom: '16px' }}>
                        <h3 style={{ margin: '0 0 6px 0', color: 'var(--text-heading)', fontSize: '1.25rem', fontWeight: 700 }}>{name}</h3>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>{type}</span>
                    </div>
                )}

                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '16px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                        <Clock size={16} /> {duration}
                    </span>
                    <span style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        background: getDifficultyColor(difficulty) + '15',
                        color: getDifficultyColor(difficulty),
                        border: `1px solid ${getDifficultyColor(difficulty)}30`
                    }}>
                        {difficulty}
                    </span>
                </div>

                <p style={{ color: 'var(--text-main)', fontSize: '0.95rem', margin: '0 0 20px 0', lineHeight: '1.6' }}>{description}</p>

                {/* Attribution Footer */}
                <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    <span>Source: {imageSource || 'Unknown'} ({imageLicense || 'Unknown'})</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-muted)' }}>
                        <Activity size={14} /> Ref Only
                    </span>
                </div>
            </div>
        </div>
    );
};

export default RecommendationCard;
