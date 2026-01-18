import React, { useEffect, useMemo, useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const RealisticBodyModel = ({ systems, onSelectOrgan, selectedOrganId, highlightedOrganIds = [] }) => {
    // Enable Draco compression support automatically by providing the path
    const { scene } = useGLTF('/models/human_anatomy.glb', true);
    const modelRef = useRef();

    // MATERIALS: Create shared materials once to reduce memory usage and draw calls
    const materials = useMemo(() => ({
        default: new THREE.MeshStandardMaterial({
            color: '#cbd5e1',
            transparent: true,
            opacity: 0.3,
            roughness: 0.5,
            metalness: 0.2,
            skinning: true
        }),
        selected: new THREE.MeshStandardMaterial({
            color: '#00ffff',
            transparent: true,
            opacity: 0.9,
            emissive: '#00aaaa',
            emissiveIntensity: 0.5,
            skinning: true
        }),
        highlighted: new THREE.MeshStandardMaterial({
            color: '#ef4444',
            transparent: true,
            opacity: 0.9,
            emissive: '#ff0000',
            emissiveIntensity: 0.5,
            skinning: true
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
                for (const [sysName, sysData] of Object.entries(systems)) {
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

    // AUTO-CENTERING & SCALING
    useEffect(() => {
        if (!scene) return;

        // 1. Compute Bounding Box
        const box = new THREE.Box3().setFromObject(scene);
        const size = new THREE.Vector3();
        box.getSize(size);
        const center = new THREE.Vector3();
        box.getCenter(center);

        // 2. Normalize Scale (Target Height = 4 units)
        const maxDim = Math.max(size.x, size.y, size.z);
        const targetHeight = 4;
        const scaleFactor = targetHeight / maxDim;

        scene.scale.setScalar(scaleFactor);

        // 3. Center the Model
        // We need to shift the model so its center aligns with (0,0,0)
        // Since we scaled it, the offset needs to be scaled too if we move position, 
        // OR we just move the position to negative center * scale.
        scene.position.x = -center.x * scaleFactor;
        scene.position.y = -center.y * scaleFactor; // Center vertically too
        scene.position.z = -center.z * scaleFactor;

        // Optional: Lift it up slightly if we want feet on ground?
        // For "centering", (0,0,0) is usually the middle of volume. 
        // If we want feet on y=0 (ground), we shift y up by half height.
        // scene.position.y += (size.y * scaleFactor) / 2;

    }, [scene]);

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
            // Position/Scale controlled by useEffect now
            onClick={handleClick}
        />
    );
};

// Preload the model
useGLTF.preload('/models/human_anatomy.glb');

export default RealisticBodyModel;
