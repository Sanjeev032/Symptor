import React, { useState } from 'react';
import { Html } from '@react-three/drei';

const Organ = ({ organ, baseColor, onSelect, selectedId, highlighted }) => {
    const [hovered, setHover] = useState(false);
    const isSelected = selectedId === organ.id;

    const handlePointerOver = (e) => {
        e.stopPropagation();
        setHover(true);
    };

    const handlePointerOut = (e) => {
        e.stopPropagation();
        setHover(false);
    };

    const handleClick = (e) => {
        e.stopPropagation();
        onSelect(organ.id === selectedId ? null : organ);
    };

    // Determine geometry based on shape prop
    let Geometry;
    switch (organ.shape) {
        case 'sphere':
            Geometry = <sphereGeometry args={[1, 32, 32]} />;
            break;
        case 'cylinder':
            Geometry = <cylinderGeometry args={[1, 1, 1, 32]} />;
            break;
        case 'box':
        default:
            Geometry = <boxGeometry args={[1, 1, 1]} />;
            break;
    }

    // Multiply scale if it's a single number
    const scale = Array.isArray(organ.scale) ? organ.scale : [organ.scale, organ.scale, organ.scale];

    // Dynamic Color Logic
    const color = isSelected ? '#00ffff' : (highlighted ? '#ef4444' : (hovered ? '#ffffff' : baseColor));
    const opacity = isSelected || highlighted || hovered ? 0.9 : 0.7;

    return (
        <mesh
            position={organ.position}
            scale={scale}
            onPointerOver={handlePointerOver}
            onPointerOut={handlePointerOut}
            onClick={handleClick}
        >
            {Geometry}
            <meshStandardMaterial
                color={color}
                transparent
                opacity={opacity}
                roughness={0.3}
                metalness={0.1}
                emissive={highlighted ? '#ff0000' : '#000000'}
                emissiveIntensity={highlighted ? 0.5 : 0}
            />
            {(hovered || isSelected || highlighted) && (
                <Html distanceFactor={10}>
                    <div style={{
                        background: 'rgba(0,0,0,0.8)',
                        color: 'white',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        marginTop: '20px',
                        whiteSpace: 'nowrap',
                        border: highlighted ? '1px solid #ef4444' : 'none'
                    }}>
                        {organ.name} {highlighted && '(Impacted)'}
                    </div>
                </Html>
            )}
        </mesh>
    );
};

export default Organ;
