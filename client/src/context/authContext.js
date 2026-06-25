import React, { createContext, useState, useContext, useEffect } from "react";
import authService from "../services/authService";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadUser = () => {
            const storedUser = authService.getCurrentUser();
            if (storedUser) {
                console.log('✅ User loaded from storage:', storedUser);
                setUser(storedUser);
            } else {
                console.log('No user found in storage.');
            }
            setLoading(false);
        };
        loadUser();
    }, []);

    const login = async (email, password, type) => {
        try {
            setError(null);
            const response = await authService.login(email, password);
            const userData = response?.data?.data?.user || response?.data?.user || null;

            if (userData) {
                setUser(userData);
            }

            console.log('✅ Logged in successfully setting user state...');
            return response;
        } catch (err) {
            setError('Login Failed:', err);
            throw err;
        }
    };

    const adminLogin = async (email, password) => {
        try {
            setError(null);
            const res = await authService.adminLogin(email, password);
            const userData = res?.data?.data?.user || res?.data?.user || null;

            if (userData) {
                setUser(userData);
            }

            console.log('✅ Logged in successfully setting user state...');
            return res;
        } catch (err) {
            setError('Login failed:', err);
            throw err;
        }
    };

    const logout = () => {
        console.log('Logout successful');
        authService.logout();
        setUser(null);
    };

    const adminLogout = ()=>{
        console.log('Admin logged out successfull......');
        authService.adminLogout();
        setUser(null);
    };

    const register = async (data, type) => {
        try {
            setError(null);
            let response;
            if (type === 'admin') {
                try {
                    setError(null);
                    console.log('📝 Register admin function called with data:', data);
                    response = await authService.registerAdmin(data);
                } catch (err) {
                    console.error('Registration error in context', err);
                    setError('Registration failed:', err);
                    throw err;
                }
            }
            else if (type === 'patient') {
                try {
                    setError(null);
                    console.log('📝 Register patient function called with data:', data);
                    response = await authService.registerPatient(data);
                } catch (err) {
                    console.error('Registration error in context', err);
                    setError('Registration failed:', err);
                    throw err;
                }
            }
            else if (type === 'doctor') {
                try {
                    setError(null);
                    console.log('📝 Register doctor function called with data:', data);
                    response = await authService.registerDoctor(data);
                } catch (err) {
                    console.error('Registration error in context', err);
                    setError('Registration failed:', err);
                    throw err;
                }
            }
            else if (type === 'lab_technician') {
                try {
                    setError(null);
                    console.log('📝 Register Lab Tech function called with data:', data);
                    response = await authService.registerLabTechnician(data);
                } catch (err) {
                    console.error('Registration error in context', err);
                    setError('Registration failed:', err);
                    throw err;
                }
            }
            else {
                try {
                    setError(null);
                    console.log('📝 Register staff function called with data:', data);
                    response = await authService.registerOperator(data);
                } catch (err) {
                    console.error('Registration error in context', err);
                    setError('Registration failed:', err);
                    throw err;
                }
            }

            const tokenData = response?.data?.data?.tokens || response?.data?.tokens;
            const userData = response?.data?.data?.user || response?.data?.user;

            if (tokenData) {
                localStorage.setItem('access_token', tokenData.access);
                localStorage.setItem('refresh_token', tokenData.refresh);
            }
            if (userData) {
                localStorage.setItem('user', JSON.stringify(userData));
                setUser(userData);
            }

            return response;
        } catch (err) {
            setError('Registration failed:', err);
            throw err;
        }
    };

    const forgotPass = async (email) => {
        try {
            setError(null);
            console.log('Forgot Password for email:', email);
            const response = await authService.forgotPassword(email);
            return response;
        } catch (err) {
            console.error('An error occurred. Try again later', err)
            setError(err.response?.data?.message || 'Failed to send request!');
            throw err;
        }
    };

    const resetPass = async (uId, token, newPassword, confirmPassword) => {
        try {
            setError(null);
            console.log('Reset Password for UID:', uId);
            const response = await authService.resetPassword(uId, token, newPassword, confirmPassword);
            console.log('Reset Password successful.');
            return response;
        }
        catch (err) {
            console.error('Error occurred while reseting password!', err);
            setError(err.response?.data?.message || 'Reset password unsuccessful. Try again.');
        }
    };

    const value = {
        user,
        isLoading: loading,
        loading,
        error,
        login,
        adminLogin,
        adminLogout,
        logout,
        register,
        setError,
        forgotPass,
        resetPass,
    };

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
};