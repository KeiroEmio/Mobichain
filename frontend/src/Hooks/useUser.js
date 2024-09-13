import { useState, useEffect } from 'react';
import jwtDecode from 'jwt-decode';

const useUser = (token) => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        if (token) {
            try {
                const decoded = jwtDecode(token);
                setUser(decoded);
            } catch (error) {
                console.error("Failed to decode token", error);
                setUser(null);
            }
        } else {
            setUser(null);
        }
    }, [token]);

    console.log('user:', user);
    return user;
};

export default useUser;
