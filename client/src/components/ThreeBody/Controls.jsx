import React from 'react';
import { Layers, Activity, Heart, Brain, Bone, ArrowRight } from 'lucide-react';

const Icons = {
    skeletal: Bone,
    digestive: Layers, // Placeholder
    respiratory: Activity, // Placeholder
    circulatory: Heart,
    muscular: Activity, // Placeholder
    nervous: Brain
};

const Controls = ({ systems, toggleSystem, selectedOrgan }) => {
    return (
        <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 10,
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
        }}>

            {/* Header */}
            <div style={{ pointerEvents: 'auto' }}>
                <h1 style={{ color: 'white', margin: 0, fontSize: '1.5rem', fontWeight: 'bold' }}>Interactive Anatomy</h1>
                <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.9rem' }}>3D Medical Visualization System</p>
            </div>

            {/* Selected Organ Info Panel */}
            {selectedOrgan && (
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    right: '20px',
                    transform: 'translateY(-50%)',
                    background: 'rgba(15, 23, 42, 0.9)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid #334155',
                    borderRadius: '12px',
                    padding: '20px',
                    width: '300px',
                    pointerEvents: 'auto',
                    color: 'white',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
                }}>
                    <h2 style={{ marginTop: 0, color: '#38bdf8' }}>{selectedOrgan.name}</h2>
                    <div style={{ fontSize: '0.9rem', color: '#cbd5e1', lineHeight: '1.5' }}>
                        <p><strong>System ID:</strong> {selectedOrgan.id}</p>
                        <p>Interactive 3D representation showing spatial positioning relative to other organs.</p>
                    </div>
                </div>
            )}

            {/* System Toggles */}
            <div style={{
                pointerEvents: 'auto',
                background: 'rgba(15, 23, 42, 0.8)',
                backdropFilter: 'blur(8px)',
                borderRadius: '16px',
                padding: '16px',
                border: '1px solid #334155',
                width: 'fit-content',
                alignSelf: 'center',
                marginBottom: '20px',
                display: 'flex',
                gap: '12px'
            }}>
                {Object.entries(systems).map(([key, system]) => {
                    const Icon = Icons[key] || Activity;
                    return (
                        <button
                            key={key}
                            onClick={() => toggleSystem(key)}
                            title={system.label}
                            style={{
                                background: system.visible ? system.color : '#1e293b',
                                color: system.visible ? '#000' : '#94a3b8',
                                border: 'none',
                                borderRadius: '8px',
                                width: '48px',
                                height: '48px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                opacity: system.visible ? 1 : 0.6,
                                transform: system.visible ? 'scale(1.05)' : 'scale(1)'
                            }}
                        >
                            <Icon size={24} />
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default Controls;
