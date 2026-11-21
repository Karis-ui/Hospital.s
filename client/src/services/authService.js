import { useLoaderData } from "react-router-dom";
import api from "./api";
import { useEffect } from "react";

export const authService = {
    registerAdmin: async (adminData) => {
        try {
            const response = await api.post('accounts/admin/public-register/', {
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
            const response = await api.post('accounts/admin/login/', { email, password });

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
            const response = await api.post('accounts/signup/', {
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
            const formData = new FormData();
            formData.append('email', doctorData.email);
            formData.append('password', doctorData.password);
            formData.append('confirm_password', doctorData.confirm_password);
            formData.append('full_name', doctorData.full_name);
            formData.append('phone', doctorData.phone);
            formData.append('specialization', doctorData.specialization);
            formData.append('license_number', doctorData.license_number);

            if (doctorData.resume) {
                formData.append('resume', doctorData.resume);
            }

            const response = await api.post('accounts/doctor/register/', formData);
            console.log('Doctor Registration successful:', response.data);
            return response.data;
        } catch (error) {
            console.error('Doctor Registration failed.', error.response?.data || error.message);
            throw error;
        }
    },

    registerOperator: async (operatorData) => {
        try {
            const formData = new FormData();
            formData.append('username', operatorData.username);
            formData.append('email', operatorData.email);
            formData.append('password', operatorData.password);
            formData.append('confirm_password', operatorData.confirm_password);
            formData.append('full_name', operatorData.full_name);
            formData.append('phone', operatorData.phone);
            formData.append('shift_time', operatorData.shift_time);
            formData.append('license_number', operatorData.license_number || '');

            if (operatorData.resume) {
                formData.append('resume', operatorData.resume);
            }

            const response = await api.post('accounts/operator/register/', formData);
            console.log('Operator Registration successful:', response.data);
            return response.data;
        } catch (error) {
            console.error('Operator Registration failed.', error.response?.data || error.message);
            throw error;
        }
    },

    registerLabTechnician: async (labTechData) => {
        try {
            const formData = new FormData();
            formData.append('email', labTechData.email);
            formData.append('password', labTechData.password);
            formData.append('confirm_password', labTechData.confirm_password);
            formData.append('username', labTechData.username);
            formData.append('full_name', labTechData.full_name);
            formData.append('phone_number', labTechData.phone_number); 
            formData.append('license_number', labTechData.license_number); 
            formData.append('gender', labTechData.gender);
            formData.append('department', labTechData.department || '');
            formData.append('shift_time', labTechData.shift_time || '');
            formData.append('experience_years', labTechData.experience_years || '0');

            if (labTechData.date_of_birth) {
                formData.append('date_of_birth', labTechData.date_of_birth);
            }

            if (labTechData.resume) {
                formData.append('resume', labTechData.resume);
            }

            const response = await api.post('accounts/lab/register/', formData);
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
            const response = await api.post('accounts/login/', { email, password });

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
            const response = await api.post('accounts/forgot-password/', { email });
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
            const response = await api.post('accounts/reset-password/', {
                uid: uId,
                token: token,
                new_password: newPassword,
                confirm_password: confirmPassword
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
        window.location.href = 'login';
    },

    adminLogout: () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = 'admin/login'
    },

    getCurrentUser: () => {
        try {
            const user = localStorage.getItem('user');
            if (!user) {
                return null;
            }
            return JSON.parse(user);
        } catch (err) {
            console.error('🔄 Failed to parse stored user', err);
            return null;
        }
    },

    refreshToken: async () => {
        try {
            const refresh = localStorage.getItem('refresh_token');
            if (!refresh) {
                throw new Error('No refresh token available');
            }

            console.log('🔄 Refreshing access token');
            const response = await api.post('accounts/refresh_token/', { refresh: refresh });
            localStorage.setItem('access_token', response.data.access);
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