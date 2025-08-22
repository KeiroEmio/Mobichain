import { useState } from 'react';

const useSearch = () => {
    const [filters, setFilters] = useState({
        searchTerm: '',
        priceRange: ''
    });

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const resetFilters = () => {
        setFilters({
            searchTerm: '',
            priceRange: ''
        });
    };

    return {
        filters,
        handleFilterChange,
        resetFilters
    };
};

export default useSearch;