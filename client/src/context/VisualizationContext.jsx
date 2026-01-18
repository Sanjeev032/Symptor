import React, { createContext, useContext, useState } from 'react';

const VisualizationContext = createContext();

export const useVisualization = () => {
    return useContext(VisualizationContext);
};

export const VisualizationProvider = ({ children }) => {
    const [highlightedOrganIds, setHighlightedOrganIds] = useState([]);
    const [selectedOrgan, setSelectedOrgan] = useState(null);
    const [systems, setSystems] = useState(null); // Optional: if we want to toggle systems globally

    const highlightOrgans = (ids) => {
        setHighlightedOrganIds(ids);
    };

    const clearHighlights = () => {
        setHighlightedOrganIds([]);
    };

    const value = {
        highlightedOrganIds,
        setHighlightedOrganIds, // Direct access if needed
        highlightOrgans,
        clearHighlights,
        selectedOrgan,
        setSelectedOrgan,
        systems, // We might not lift systems yet if it's heavy, but leaving slot
        setSystems
    };

    return (
        <VisualizationContext.Provider value={value}>
            {children}
        </VisualizationContext.Provider>
    );
};
