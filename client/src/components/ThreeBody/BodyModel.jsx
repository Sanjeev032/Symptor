import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import Organ from './Organ';

const BodyModel = ({ systems, onSelectOrgan, selectedOrganId, highlightedOrganIds = [] }) => {
    const group = useRef();

    useFrame((state) => {
        // Optional: Add subtle floating animation or rotation
        if (group.current) {
            group.current.rotation.y = Math.sin(state.clock.getElapsedTime() * 0.1) * 0.1;
        }
    });

    return (
        <group ref={group}>
            {Object.entries(systems).map(([key, system]) => (
                system.visible && (
                    <group key={key} name={key}>
                        {system.organs.map((organ) => (
                            <Organ
                                key={organ.id}
                                organ={organ}
                                baseColor={system.color}
                                onSelect={onSelectOrgan}
                                selectedId={selectedOrganId}
                                highlighted={highlightedOrganIds.includes(organ.id)}
                            />
                        ))}
                    </group>
                )
            ))}
        </group>
    );
};

export default BodyModel;
