import { useLoaderData } from "react-router-dom";
import api from "./api";
import { useEffect } from "react";

export const authService = {
    registerAdmin: async (adminData) => {
        try {
            const response = await api.post('/accounts/admin/register/', {
                email: adminData.email,
                password: adminData.password,
                confirm_password: adminData.confirm_password,
                full_name: adminData.full_name,
                phone: adminData.phone
            });
            console.log('Admin Registration successful:', response.data);
            return response.data;
        } catch (error) {
            console.error('Admin Registration failed.', error.response?.data || error.message);
            throw error;
        }
    },
    adminLogin: async (email, password) => {
        try {
            console.log('Attempting login for:', email);
            const response = await api.post('/accounts/admin/login/', { email, password });

            if (response.data.data.tokens) {
                localStorage.setItem('access_token', response.data.data.tokens.access);
                localStorage.setItem('refresh_token', response.data.data.tokens.refresh);
                localStorage.setItem('user', JSON.stringify(response.data.data.user));
            }
            return response.data
        } catch (err) {
            console.log('Login Failed:', err.response?.data || err.message);
            throw err;
        }
    },
    registerPatient: async (userData) => {
        try {
            const response = await api.post('/accounts/signup/', {
                email: userData.email,
                password: userData.password,
                confirm_password: userData.confirm_password,
                first_name: userData.first_name,
                last_name: userData.last_name,
                phone: userData.phone,
                age: userData.age,
                gender: userData.gender,
                address: userData.address,
            });
            console.log('Patient Registration successful:', response.data);
            return response.data;
        } catch (error) {
            console.error('Patient Registration failed.', error.response?.data || error.message);
            throw error;
        }
    },

    registerDoctor: async (doctorData) => {
        try {
            const response = await api.post('/accounts/doctor/register/', {
                email: doctorData.email,
                password: doctorData.password,
                confirm_password: doctorData.confirm_password,
                full_name: doctorData.full_name,
                phone: doctorData.phone,
                gender: doctorData.gender,
                specialization: doctorData.specialization,
                qualification: doctorData.qualification,
                license_number: doctorData.license_number
            });
            console.log('Doctor Registration successful:', response.data);
            return response.data;
        } catch (error) {
            console.error('Doctor Registration failed.', error.response?.data || error.message);
            throw error;
        }
    },

    registerOperator: async (operatorData) => {
        try {
            const response = await api.post('/accounts/operator/register/', {
                email: operatorData.email,
                password: operatorData.password,
                confirm_password: operatorData.confirm_password,
                full_name: operatorData.full_name,
                phone: operatorData.phone,
                qualification: operatorData.qualification
            });
            console.log('Operator Registration successful:', response.data);
            return response.data;
        } catch (error) {
            console.error('Operator Registration failed.', error.response?.data || error.message);
            throw error;
        }
    },

    registerLabTechnician: async (labTechData) => {
        try {
            const response = await api.post('/accounts/lab/register/', {
                email: labTechData.email,
                password: labTechData.password,
                confirm_password: labTechData.confirm_password,
                full_name: labTechData.full_name,
                phone: labTechData.phone,
                qualification: labTechData.qualification
            });
            console.log('Lab Technician Registration successful:', response.data);
            return response.data;
        } catch (error) {
            console.error('Lab Technician Registration failed.', error.response?.data || error.message);
            throw error;
        }
    },

    login: async (email, password) => {
        try {
            console.log('Attempting login for:', email);
            const response = await api.post('/accounts/login/', { email, password });

            if (response.data.data.tokens) {
                localStorage.setItem('access_token', response.data.data.tokens.access);
                localStorage.setItem('refresh_token', response.data.data.tokens.refresh);
                localStorage.setItem('user', JSON.stringify(response.data.data.user));
            }
            return response.data
        } catch (err) {
            console.log('Login Failed:', err.response?.data || err.message);
            throw err;
        }
    },

    forgotPassword: async (email) => {
        try {
            console.log("📧 Requesting password reset for:", email);
            const response = await api.post('/accounts/forgot-password/', { email });
            console.log("Password reset email sent:", response.data);
            return response.data;
        } catch (err) {
            console.error('Forgot Password failed.Try again later!:', err.response?.data || err.message);
            throw err;
        }
    },

    resetPassword: async (uId, token, newPassword, confirmPassword) => {
        try {
            console.log('Reseting password for UID:', uId);
            const response = await api.post('/accounts/change-password/', {
                uId: uId, token: token, newPassword: newPassword, confirm_Password: confirmPassword
            });
            console.log('Password reset successfully');
            return response;
        } catch (err) {
            console.error('🔄 Reset password error');
            throw err;
        }
    },

    logout: () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        window.location.href = '/login';
    },

    adminLogout:()=>{
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/admin/login'
    },

    getCurrentUser: async (uId) => {
        try {
            const token = localStorage.getItem('access_token');
            if (!token) {
                throw new Error('No access token available');
            }
            console.log('Getting current user for UID:', uId);
            const response = await api.get('/accounts/profile/', {
                uId: uId
            });
            console.log('Current user retrieved successfully');
            return response;
        } catch (err) {
            console.error('🔄 Get current user error');
            throw err;
        }
    },

    refreshToken: async () => {
        try {
            const refresh = localStorage.getItem('refresh_token');
            if (!refresh) {
                throw new Error('No refresh token available');
            }

            console.log('🔄 Refreshing access token');
            const response = await api.post('/accounts/refresh_token/', { refresh: refresh });
            localStorage.setItem('access_token', response.data.data.access);
            console.log('Token refreshed successfully.');
            return response;
        }
        catch (err) {
            console.error('Token refresh failed!');
            this.logout();
            throw err;
        }
    },
};

export default authService;