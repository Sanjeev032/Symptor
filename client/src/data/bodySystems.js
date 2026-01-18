export const bodySystems = {
    skeletal: {
        color: "#e6e6e6",
        label: "Skeletal System",
        visible: true,
        organs: [
            { id: 'skull', shape: 'sphere', position: [0, 1.6, 0], scale: [0.22, 0.25, 0.22], name: 'Skull' },
            { id: 'spine', shape: 'cylinder', position: [0, 0.8, -0.05], scale: [0.08, 1.4, 0.08], name: 'Spine' },
            { id: 'ribs', shape: 'cylinder', position: [0, 1.0, 0], scale: [0.25, 0.4, 0.15], name: 'Rib Cage' },
            { id: 'pelvis', shape: 'box', position: [0, 0.05, 0], scale: [0.35, 0.2, 0.2], name: 'Pelvis' },
            { id: 'l_arm_upper', shape: 'cylinder', position: [-0.35, 1.0, 0], scale: [0.06, 0.6, 0.06], name: 'L Humerus' },
            { id: 'r_arm_upper', shape: 'cylinder', position: [0.35, 1.0, 0], scale: [0.06, 0.6, 0.06], name: 'R Humerus' },
            { id: 'l_leg_upper', shape: 'cylinder', position: [-0.15, -0.4, 0], scale: [0.07, 0.7, 0.07], name: 'L Femur' },
            { id: 'r_leg_upper', shape: 'cylinder', position: [0.15, -0.4, 0], scale: [0.07, 0.7, 0.07], name: 'R Femur' },
        ]
    },
    digestive: {
        color: "#ffaa00",
        label: "Digestive System",
        visible: false,
        organs: [
            { id: 'esophagus', shape: 'cylinder', position: [0, 1.25, 0.05], scale: [0.03, 0.4, 0.03], name: 'Esophagus' },
            { id: 'stomach', shape: 'sphere', position: [0.1, 0.9, 0.15], scale: [0.12, 0.15, 0.1], name: 'Stomach' },
            { id: 'liver', shape: 'box', position: [-0.1, 1.0, 0.15], scale: [0.2, 0.15, 0.1], name: 'Liver' },
            { id: 'intestines', shape: 'cylinder', position: [0, 0.6, 0.15], scale: [0.2, 0.3, 0.1], name: 'Small Intestine' },
            { id: 'colon', shape: 'box', position: [0, 0.6, 0.15], scale: [0.25, 0.35, 0.12], name: 'Large Intestine' }
        ]
    },
    respiratory: {
        color: "#ff8888",
        label: "Respiratory System",
        visible: false,
        organs: [
            { id: 'trachea', shape: 'cylinder', position: [0, 1.35, 0.05], scale: [0.03, 0.2, 0.03], name: 'Trachea' },
            { id: 'l_lung', shape: 'sphere', position: [-0.15, 1.1, 0.1], scale: [0.15, 0.3, 0.15], name: 'Left Lung' },
            { id: 'r_lung', shape: 'sphere', position: [0.15, 1.1, 0.1], scale: [0.15, 0.3, 0.15], name: 'Right Lung' },
        ]
    },
    circulatory: {
        color: "#ff0000",
        label: "Circulatory System",
        visible: false,
        organs: [
            { id: 'heart', shape: 'sphere', position: [0.02, 1.15, 0.1], scale: 0.09, name: 'Heart' },
            { id: 'aorta', shape: 'cylinder', position: [0, 1.0, -0.05], scale: [0.02, 0.8, 0.02], name: 'Aorta' }
        ]
    },
    muscular: {
        color: "#cc4444",
        label: "Muscular System",
        visible: false,
        organs: [
            { id: 'pecs', shape: 'box', position: [0, 1.25, 0.2], scale: [0.4, 0.2, 0.05], name: 'Pectorals' },
            { id: 'abs', shape: 'box', position: [0, 0.8, 0.2], scale: [0.25, 0.5, 0.05], name: 'Abdominals' },
            { id: 'quads', shape: 'cylinder', position: [0, -0.4, 0.1], scale: [0.35, 0.7, 0.1], name: 'Quadriceps' }
        ]
    },
    nervous: {
        color: "#ffff00",
        label: "Nervous System",
        visible: false,
        organs: [
            { id: 'brain', shape: 'sphere', position: [0, 1.6, 0], scale: 0.18, name: 'Brain' },
            { id: 'spinal_cord', shape: 'cylinder', position: [0, 0.8, -0.05], scale: [0.03, 1.4, 0.03], name: 'Spinal Cord' }
        ]
    },
    integumentary: {
        color: "#e2c4a6",
        label: "Integumentary System",
        visible: true,
        organs: [
            { id: 'skin', shape: 'capsule', position: [0, 0, 0], scale: 1, name: 'Skin' }
        ]
    }
};
