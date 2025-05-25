import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
const AuthContext = createContext(undefined);
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const login = async (email, password) => {
        try {
            const response = await axios.post('/api/auth/login', { email, password });
            const userData = response.data;
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
        }
        catch (error) {
            console.error('Login failed:', error);
            throw error;
        }
    };
    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
    };
    // Load user from localStorage on mount
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);
    return (<AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>);
};
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
