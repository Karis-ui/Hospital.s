import React, { createContext, useState, useContext, useEffect } from "react";
import authService from "../services/authService";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const loadUser = () => {
            const token = localStorage.getItem('access_token');
            if (!token) {
                console.log('No access token found. User is not authenticated.');
                setLoading(false);
                return;
            }
            try {
                console.log('🔄 Loading user from storage...');
                const storedUser = authService.getCurrentUser();
                if (storedUser) {
                    console.log('✅ User loaded:', storedUser);
                    setUser(storedUser);
                } else {
                    console.log('No user found.');
                }
                setLoading(false);
            } catch (err) {
                console.error('Error loading user:', err);
                setLoading(false);
            }
        };
        loadUser();
    }, []);

    const redirectToDashboard = (role) => {
        const rolePaths = {
            admin: '/admin/dashboard',
            doctor: '/doctor/dashboard',
            lab_technician: '/lab/dashboard',
            patient: '/patient/dashboard',
            operator: '/operator/dashboard',
        };
        const path = rolePaths[role] || '/patient/dashboard';
        navigate(path);
    }

    const login = async (email, password) => {
        try {
            setError(null);
            const response = await authService.login(email, password);
            const userData = response.data.user;

            console.log('✅Logged in successfully setting user state...');
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
            const role = userData?.user_type || userData?.role || 'patient';
            redirectToDashboard(role);
            return { status: true, data: response.data };
        } catch (err) {
            setError('Login Failed:', err);
            throw err;
        }
    };

    const adminLogin = async (email, password) => {
        try {
            setError(null);
            const response = await authService.adminLogin(email, password);
            const userData = response.data.user;

            console.log('✅Logged in successfully setting user state...');
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
            const role = 'admin';
            redirectToDashboard(role);
            return { status: true, data: response.data };
        } catch (err) {
            setError('Login failed:', err);
            throw err;
        }
    };

    const logout = () => {
        console.log('Logout successful');
        authService.logout();
        setUser(null);
        localStorage.removeItem('user');
    };

    const adminLogout = () => {
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
                    const response = await authService.registerAdmin(data);
                    console.log('✅ Admin registration successful...Proceed to login', response);
                    navigate('/admin/login');
                    return response;
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
                    const response = await authService.registerPatient(data);
                    console.log('✅ Patient registration successful...Proceed to login', response);
                    navigate('/login');
                    return response;
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
                    const response = await authService.registerDoctor(data);
                    console.log('✅ Doctor registration successful...Proceed to login', response);
                    navigate('/login');
                    return response;
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
                    const response = await authService.registerLabTechnician(data);
                    console.log('✅ Lab Tech registration successful...Proceed to login', response);
                    navigate('/login');
                    return response;
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
                    const response = await authService.registerOperator(data);
                    console.log('✅ Staff registration successful...Proceed to login', response);
                    navigate('/login');
                    return response;
                } catch (err) {
                    console.error('Registration error in context', err);
                    setError('Registration failed:', err);
                    throw err;
                }
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
            navigate('/forgot-password')
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
            navigate('/resetPass')
            console.log('Reset Password successful.');
            return response;
        }
        catch (err) {
            console.error('Error occurred while reseting password!', err);
            setError(err.response?.data?.message || 'Reset password unsuccessful. Try again.');
        }
    };

    const value = {
        user, loading, error, login, adminLogin, adminLogout, logout, register, setError, forgotPass, resetPass
    };

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
};