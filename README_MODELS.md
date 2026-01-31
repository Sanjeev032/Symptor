# 3D Anatomy Model Setup

## Current Status
The application is currently using a **placeholder** GLTF model (`CesiumMan`) to demonstrate the technical implementation of specific features like:
- **GLTF Loading**: Using `useGLTF` hook with Suspense.
- **Node Traversal**: Iterating through the model mesh hierarchy.
- **Raycasting**: Clicking on specific parts to identify them.
- **Dynamic Highlighting**: Changing the material color of specific nodes based on diagnosis.

**The file is located at:** `client/public/models/human_anatomy.glb`

## How to use a Realistic Anatomy Model

To replace the placeholder with a medically accurate model, follow these steps:

### 1. Acquire a Model
You need a `.glb` or `.gltf` file that has separate meshes for major organs.
**Recommended sources:**
- **Sketchfab**: Search for "Human Organs" or "Anatomy" (look for CC-0 or CC-BY licenses).
- **Z-Anatomy**: Open source anatomy atlas (requires export to GLB).
- **Smithsonian 3D Digitization**: Search for anatomy.

### 2. Replace the File
1.  Rename your downloaded file to `human_anatomy.glb`.
2.  Place it in `client/public/models/`, overwriting the existing file.

### 3. Update the Mapping
Open `client/src/components/ThreeBody/RealisticBodyModel.jsx`.
You must update the `organMap` object to match the **Node Names** in your specific GLTF file.

**Example:**
If your new model has a mesh named `Heart_Mesh_01`, update the map:

```javascript
const organMap = useMemo(() => ({
    'heart': ['Heart_Mesh_01'], // Matches the name in your GLB
    'brain': ['Brain_Cortex', 'Cerebellum'],
    'l_lung': ['Lung_Left'],
    // ... map other internal IDs to your model's mesh names
}), []);
```

### 4. Adjust Scale/Position
If your new model is too big or small, adjust the `<primitive>` props in `RealisticBodyModel.jsx`:

```jsx
<primitive 
    object={clonedScene} 
    position={[0, -1, 0]} // Adjust Y to center it
    scale={[0.5, 0.5, 0.5]} // Adjust scale
/>
```

## Troubleshooting
- **White Screen**: Ensure the model file exists and is a valid binary GLTF (.glb).
- **No Highlighting**: Check the console logs for "Traversing model..." to see the actual names of the nodes in your model, and update `organMap` accordingly.
