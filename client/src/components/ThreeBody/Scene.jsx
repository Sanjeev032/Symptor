import React, { useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, Grid, Html, PerformanceMonitor, Center } from '@react-three/drei';
import RealisticBodyModel from './RealisticBodyModel';
import Controls from './Controls';
import DiagnosisForm from '../Diagnosis/DiagnosisForm';
import ErrorBoundary from '../common/ErrorBoundary';
import { bodySystems as initialSystems } from '../../data/bodySystems';
import { useVisualization } from '../../context/VisualizationContext';

const Loader = () => (
    <Html center>
        <div style={{ color: 'white', background: 'rgba(0,0,0,0.8)', padding: '12px 24px', borderRadius: '8px', border: '1px solid #334155' }}>
            Loading 3D Model...
        </div>
    </Html>
);

const Scene = () => {
    const [systems, setSystems] = useState(initialSystems);
    const {
        highlightedOrganIds,
        setHighlightedOrganIds,
        selectedOrgan,
        setSelectedOrgan
    } = useVisualization();

    // const [selectedOrgan, setSelectedOrgan] = useState(null); // Now in context
    // const [highlightedOrganIds, setHighlightedOrganIds] = useState([]); // Now in context
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

    const controlsRef = React.useRef();

    const handleFocusOrgan = (position) => {
        console.log("Scene: handleFocusOrgan called with:", position);
        if (controlsRef.current) {
            console.log("Scene: Updating controls target");
            // Smoothly animate target or just snap
            controlsRef.current.target.copy(position);
            controlsRef.current.update();
        } else {
            console.error("Scene: controlsRef is null!");
        }
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
                {/* Standard Camera Position */}
                <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={50} />

                <ambientLight intensity={0.5} />
                <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
                <pointLight position={[-10, -10, -10]} intensity={0.5} color="#4f46e5" />

                <Environment preset="city" />

                <group position={[0, 0, 0]}>
                    <ErrorBoundary>
                        <Suspense fallback={<Loader />}>
                            {/* Auto-center handled in RealisticBodyModel */}
                            <RealisticBodyModel
                                systems={systems}
                                onSelectOrgan={setSelectedOrgan}
                                selectedOrganId={selectedOrgan?.id}
                                highlightedOrganIds={highlightedOrganIds}
                                onFocusOrgan={handleFocusOrgan}
                            />
                        </Suspense>
                    </ErrorBoundary>
                    <Grid infiniteGrid fadeDistance={30} fadeStrength={5} sectionColor="#4f46e5" cellColor="#6366f1" position={[0, -2, 0]} />
                </group>

                <OrbitControls
                    ref={controlsRef}
                    target={[0, 0, 0]} /* Focus on center */
                    enablePan={false} /* Locked panning */
                    minPolarAngle={Math.PI / 6} /* Allow looking from higher up */
                    maxPolarAngle={Math.PI / 1.5} /* Ground constraint */
                    minDistance={2.5}
                    maxDistance={8}
                    enableDamping={true}
                    dampingFactor={0.05}
                />
            </Canvas>
        </div>
    );
};


export default Scene;
