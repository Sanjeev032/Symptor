import React from 'react';

const RecommendationCard = ({ recommendation }) => {
    return (
        <div style={{
            border: '1px solid #e0e0e0',
            borderRadius: '12px',
            overflow: 'hidden',
            backgroundColor: 'white',
            boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
            width: '100%',
            maxWidth: '300px',
            transition: 'transform 0.2s',
            cursor: 'default'
        }}>
            <div style={{ height: '200px', overflow: 'hidden', position: 'relative' }}>
                <img
                    src={recommendation.imageUrl}
                    alt={recommendation.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => { e.target.src = 'https://via.placeholder.com/300x200?text=No+Image'; }}
                />
            </div>
            <div style={{ padding: '16px' }}>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '1.2rem', color: '#2c3e50' }}>{recommendation.name}</h3>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#7f8c8d', marginBottom: '12px' }}>
                    <span style={{
                        backgroundColor: '#e8f5e9',
                        color: '#2e7d32',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontWeight: '600'
                    }}>
                        {recommendation.type}
                    </span>
                    <span>{recommendation.duration}</span>
                </div>

                {/* Visual guidance only - No steps */}
                <p style={{ fontSize: '0.9rem', color: '#546e7a', lineHeight: '1.4', marginBottom: '16px' }}>
                    {recommendation.description}
                </p>

                <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: '12px', fontSize: '0.75rem', color: '#95a5a6' }}>
                    <div>Source: {recommendation.imageSource}</div>
                    <div style={{ marginTop: '2px' }}>License: {recommendation.imageLicense}</div>
                </div>
            </div>
        </div>
    );
};

export default RecommendationCard;
