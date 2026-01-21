import React, { useEffect, useMemo, useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const RealisticBodyModel = ({ systems, onSelectOrgan, selectedOrganId, highlightedOrganIds = [], onFocusOrgan }) => {
    // Enable Draco compression (true calls the default CDN for decoders)
    const { scene } = useGLTF('/models/human_anatomy.glb', true);
    const modelRef = useRef();

    // MATERIALS: Create shared materials once to reduce memory usage and draw calls
    const materials = useMemo(() => ({
        default: new THREE.MeshStandardMaterial({
            color: '#cbd5e1',
            transparent: true,
            opacity: 0.8,
            roughness: 0.5,
            metalness: 0.2
        }),
        selected: new THREE.MeshStandardMaterial({
            color: '#00ffff',
            transparent: true,
            opacity: 0.9,
            emissive: '#00aaaa',
            emissiveIntensity: 0.5
        }),
        highlighted: new THREE.MeshStandardMaterial({
            color: '#ef4444',
            transparent: true,
            opacity: 0.9,
            emissive: '#ff0000',
            emissiveIntensity: 0.5
        }),
        invisible: new THREE.MeshStandardMaterial({ visible: false }) // Helper if needed
    }), []);

    // MEMOIZED MAP: Map Mesh Names -> Organ IDs
    const organMap = useMemo(() => ({
        'brain': ['Brain', 'Cerebrum'],
        'head': ['Head', 'Skull', 'Cranium', 'Face'],
        'heart': ['Heart', 'Atrium', 'Ventricle'],
        'l_lung': ['Lung_L'],
        'r_lung': ['Lung_R'],
        'chest': ['Rib', 'Costal', 'Sternum', 'Thorax'],
        'stomach': ['Stomach'],
        'liver': ['Liver'],
        'abdomen': ['Intestine', 'Colon', 'Abdomen'], // Fallback for general abdominal pain
        'intestines': ['Intestine', 'Colon'], // Specific
        'skin': ['Body', 'Skin'],
        'spine': ['Spine', 'Vertebra'],
        'arm': ['Arm', 'Humerus', 'Radius', 'Ulna', 'Hand', 'Finger'],
        'leg': ['Leg', 'Femur', 'Tibia', 'Fibula', 'Foot', 'Toe']
    }), []);

    // CACHED TRAVERSAL: Build a lookup map of meshes once
    const meshLookup = useMemo(() => {
        const lookup = {};
        scene.traverse((child) => {
            if (child.isMesh) {
                // Find which organ this mesh belongs to
                let ownerId = null;
                for (const [id, names] of Object.entries(organMap)) {
                    if (names.some(n => child.name.includes(n))) {
                        ownerId = id;
                        break;
                    }
                }

                if (ownerId) {
                    child.userData.organId = ownerId;
                    // We might have multiple meshes per organ (e.g. Brain parts), store them in an array if needed
                    // For simplified lookup, keying by mesh uuid or direct reference is better, 
                    // but here we just tag userData so we can process them in the effect.
                }
            }
        });
        return scene; // return scene after tagging
    }, [scene, organMap]);

    // RENDER PASS: Apply styles based on state
    useEffect(() => {
        meshLookup.traverse((child) => {
            if (child.isMesh && child.userData.organId) {
                const organId = child.userData.organId;

                // 1. Determine System Visibility
                // Find which system this organ belongs to
                let parentSystem = null;
                for (const sysData of Object.values(systems)) {
                    if (sysData.organs.some(o => o.id === organId)) {
                        parentSystem = sysData;
                        break;
                    }
                }

                // If system is hidden, HIDE THE MESH appropriately
                // Note: Special handling for 'Skin' (Integumentary) if we want transparency vs hidden
                if (parentSystem && !parentSystem.visible) {
                    child.visible = false;
                    return; // Skip further processing
                } else {
                    child.visible = true;
                }

                // 2. Apply Material based on Selection/Highlight
                const isSelected = organId === selectedOrganId;
                const isHighlighted = highlightedOrganIds.includes(organId);

                if (isSelected) {
                    child.material = materials.selected;
                } else if (isHighlighted) {
                    child.material = materials.highlighted;
                } else {
                    child.material = materials.default;
                }
            }
        });
    }, [meshLookup, systems, selectedOrganId, highlightedOrganIds, materials]);

    // AUTO-SCALING & CENTERING
    useEffect(() => {
        if (!scene) return;

        // 1. Reset transformations to ensure clean measurements
        scene.position.set(0, 0, 0);
        scene.scale.set(1, 1, 1);
        scene.updateMatrixWorld(true);

        // 2. Compute Bounding Box
        const box = new THREE.Box3().setFromObject(scene);
        const size = new THREE.Vector3();
        const center = new THREE.Vector3();
        box.getSize(size);
        box.getCenter(center);

        // 3. Center the model (Offset by negative center)
        // We move the scene so its center aligns with world (0,0,0)
        scene.position.sub(center);

        // 4. Normalize Scale (Target Height = 4 units to fit nicely)
        const maxDim = Math.max(size.x, size.y, size.z);
        const targetHeight = 4; // Slightly smaller to ensure fit

        if (maxDim > 0) {
            const scaleFactor = targetHeight / maxDim;
            scene.scale.setScalar(scaleFactor);
        }

    }, [scene]);

    // FOCUS ON ORGAN
    useEffect(() => {
        // DEBUG LOG TO TRACE
        console.log("RealisticBodyModel: Focus Logic Triggered", { selectedOrganId, hasScene: !!scene, hasCallback: !!onFocusOrgan });

        if (!selectedOrganId || !scene || !onFocusOrgan) return;

        const selectedMeshes = [];
        scene.traverse((child) => {
            // console.log("Checking child:", child.name, "ID:", child.userData.organId); // TOO NOISY
            if (child.isMesh && child.userData.organId === selectedOrganId) {
                selectedMeshes.push(child);
            }
        });

        console.log("RealisticBodyModel: Found meshes for focus:", selectedMeshes.length);

        if (selectedMeshes.length > 0) {
            const box = new THREE.Box3();
            selectedMeshes.forEach(mesh => {
                mesh.updateMatrixWorld(true); // Force update
                box.expandByObject(mesh);
            });

            const center = new THREE.Vector3();
            box.getCenter(center);

            console.log("RealisticBodyModel: Calculator Center:", center);
            onFocusOrgan(center);
        }
    }, [selectedOrganId, scene, onFocusOrgan]);


    const handleClick = (e) => {
        e.stopPropagation();
        const mesh = e.object;
        if (mesh && mesh.userData.organId) {
            // Find the full organ object
            let foundOrgan = null;
            Object.values(systems).forEach(sys => {
                const o = sys.organs.find(organ => organ.id === mesh.userData.organId);
                if (o) foundOrgan = o;
            });
            onSelectOrgan(foundOrgan);
        } else {
            onSelectOrgan(null);
        }
    };

    return (
        <primitive
            ref={modelRef}
            object={scene}
            scale={2}
            position={[0, -2, 0]}
            onClick={handleClick}
        />
    );
};

// Preload the model
useGLTF.preload('/models/human_anatomy.glb');

export default RealisticBodyModel;
