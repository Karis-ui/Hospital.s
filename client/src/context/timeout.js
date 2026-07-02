import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import { toast } from 'react-toastify';
import authService from '../services/authService';

export const useSessionTimeout = (timeoutMinutes = 15) => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [showWarning, setShowWarning] = useState(false);
    const timeoutRef = useRef(null);
    const warningRef = useRef(null);
    const lastActivityRef = useRef(Date.now());

    const timeoutMs = timeoutMinutes * 60 * 1000;
    const warningMs = (timeoutMinutes - 2) * 60 * 1000;

    const getLoginPath = () => {
        const role = user?.user_type || user?.role || 'patient';
        const loginPaths = {
            admin: '/admin/login',
            doctor: '/login',
            lab_technician: '/login',
            patient: '/login',
            operator: '/login',
        };
        return loginPaths[role] || '/login';
    };

    const getLogoutMethod = () => {
        const role = user?.user_type || user?.role || 'patient';
        if (role === 'admin') {
            return authService.adminLogout;
        }
        return authService.logout;
    };

    const getLogoutMessage = () => {
        const role = user?.user_type || user?.role || 'patient';
        const messages = {
            admin: 'Admin session expired. Please login again.',
            doctor: 'Doctor session expired. Please login again.',
            lab_technician: 'Lab Technician session expired. Please login again.',
            patient: 'Session expired. Please login again.',
            operator: 'Operator session expired. Please login again.',
        };
        return messages[role] || 'Session expired. Please login again.';
    };

    const resetTimer = () => {
        lastActivityRef.current = Date.now();
        setShowWarning(false);
        clearTimeout(warningRef.current);
        clearTimeout(timeoutRef.current);

        warningRef.current = setTimeout(() => {
            setShowWarning(true);
            const role = user?.user_type || user?.role || 'patient';
            const roleName = role.charAt(0).toUpperCase() + role.slice(1).replace('_', ' ');
            toast.warning(`${roleName} session will expire in 2 minutes. Please save your work.`, {
                autoClose: 10000,
                toastId: 'session-warning',
            });
        }, warningMs);

        timeoutRef.current = setTimeout(() => {
            handleLogout();
        }, timeoutMs);
    };

    const handleLogout = () => {
        clearTimeout(warningRef.current);
        clearTimeout(timeoutRef.current);

        const role = user?.user_type || user?.role || 'patient';
        if (role === 'admin') {
            authService.adminLogout();
        } else {
            authService.logout();
        }
        logout();

        const message = getLogoutMessage();
        toast.info(message, { toastId: 'session-expired' });

        const loginPath = getLoginPath();
        navigate(loginPath);
    };

    const extendSession = async () => {
        try {
            const response = await authService.refreshToken();
            if (response) {
                resetTimer();
                setShowWarning(false);

                const role = user?.user_type || user?.role || 'patient';
                const roleName = role.charAt(0).toUpperCase() + role.slice(1).replace('_', ' ');
                toast.success(`${roleName} session extended successfully`);
                return true;
            }
        } catch (error) {
            console.error('Failed to extend session:', error);
            handleLogout();
            return false;
        }
    };

    useEffect(() => {
        const handleUserActivity = () => {
            resetTimer();
        };

        const events = ['mousemove', 'keydown', 'scroll', 'click', 'touchstart'];
        events.forEach(event => {
            window.addEventListener(event, handleUserActivity);
        });

        resetTimer();

        return () => {
            clearTimeout(warningRef.current);
            clearTimeout(timeoutRef.current);
            events.forEach(event => {
                window.removeEventListener(event, handleUserActivity);
            });
        };
    }, []);

    return {
        showWarning,
        extendSession,
        logout: handleLogout,
        resetTimer,
        getLoginPath,
        getLogoutMessage,
        getLogoutMethod
    };
};