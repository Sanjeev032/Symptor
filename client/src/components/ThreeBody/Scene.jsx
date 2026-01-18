import React, { useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, Grid, Html, PerformanceMonitor } from '@react-three/drei';
import RealisticBodyModel from './RealisticBodyModel';
import Controls from './Controls';
import DiagnosisForm from '../Diagnosis/DiagnosisForm';
import { bodySystems as initialSystems } from '../../data/bodySystems';

const Loader = () => (
    <Html center>
        <div style={{ color: 'white', background: '#0f172a', padding: '10px', borderRadius: '8px' }}>Loading Model...</div>
    </Html>
);

const Scene = () => {
    const [systems, setSystems] = useState(initialSystems);
    const [selectedOrgan, setSelectedOrgan] = useState(null);
    const [highlightedOrganIds, setHighlightedOrganIds] = useState([]);
    const [dpr, setDpr] = useState(1.5); // Dynamic Pixel Ratio

    const toggleSystem = (systemKey) => {
        setSystems(prev => ({
            ...prev,
            [systemKey]: {
                ...prev[systemKey],
                visible: !prev[systemKey].visible
            }
        }));
    };
    // ... (rest of functions)

    const handleDiagnosis = (result) => {
        // ... (rest of diagnosis handler)
        const newSystems = Object.keys(systems).reduce((acc, key) => {
            acc[key] = { ...systems[key], visible: false };
            return acc;
        }, {});

        result.affectedSystems.forEach(sysId => {
            if (newSystems[sysId]) {
                newSystems[sysId].visible = true;
            }
        });

        // ... rest of handleDiagnosis implementation preserved

        if (result.affectedOrgans) {
            setHighlightedOrganIds(result.affectedOrgans);
        } else {
            setHighlightedOrganIds([]);
        }

        if (result.affectedOrgans && result.affectedOrgans.length > 0) {
            const organId = result.affectedOrgans[0];
            let organObj = null;
            for (const system of Object.values(initialSystems)) {
                const found = system.organs.find(o => o.id === organId);
                if (found) {
                    organObj = found;
                    break;
                }
            }
            setSelectedOrgan(organObj);
        }

        setSystems(newSystems);
    };

    return (
        <div style={{ position: 'relative', width: '100%', height: '100vh', background: '#0f172a' }}>

            <DiagnosisForm onDiagnosis={handleDiagnosis} />

            <Controls
                systems={systems}
                toggleSystem={toggleSystem}
                selectedOrgan={selectedOrgan}
            />

            {/* PerformanceMonitor added to dynamically adjust DPR based on framerate */}
            <Canvas shadows dpr={dpr}>
                <PerformanceMonitor onIncline={() => setDpr(2)} onDecline={() => setDpr(1)} />
                <PerspectiveCamera makeDefault position={[0, 1, 4]} fov={50} />

                <ambientLight intensity={0.5} />
                <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
                <pointLight position={[-10, -10, -10]} intensity={0.5} color="#4f46e5" />

                <Environment preset="city" />

                <group position={[0, -1, 0]}>
                    <Suspense fallback={<Loader />}>
                        <RealisticBodyModel
                            systems={systems}
                            onSelectOrgan={setSelectedOrgan}
                            selectedOrganId={selectedOrgan?.id}
                            highlightedOrganIds={highlightedOrganIds}
                        />
                    </Suspense>
                    <Grid infiniteGrid fadeDistance={30} fadeStrength={5} sectionColor="#4f46e5" cellColor="#6366f1" position={[0, -0.01, 0]} />
                </group>

                <OrbitControls
                    target={[0, 1, 0]}
                    minPolarAngle={0}
                    maxPolarAngle={Math.PI / 1.5}
                    enablePan={false}
                    minDistance={2}
                    maxDistance={8}
                />
            </Canvas>
        </div>
    );
};

export default Scene;
