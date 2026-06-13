import React,{createContext,useState,useContext,useEffect} from "react";
import authService from "../services/authService";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({children}) =>{
    const [user,setUser] = useState(null);
    const [loading,setLoading] = useState(true);
    const [error,setError] = useState(null);

    useEffect(() =>{
        const loadUser = () =>{
            const token = localStorage.getItem('access_token');
            if(!token){
                console.log('No access token found. User is not authenticated.');
                setLoading(false);
                return;
            }
            try{
                console.log('🔄 Loading user from storage...');
                const storedUser = authService.getCurrentUser();
                if(storedUser){
                    console.log('✅ User loaded:',storedUser);
                    setUser(storedUser);
                }else{
                    console.log('No user found.');
                }
                setLoading(false);
            }catch(err){
                console.error('Error loading user:', err);
                setLoading(false);
            }
        };
        loadUser();
    },[]);

    const login = async(email,password) =>{
        try{
            setError(null);
            const response = await authService.login(email,password);

            console.log('✅Logged in successfully setting user state..');
            setUser(response.data.user);
            return response;
        }catch(err){
            setError(err.response?.data?.message || 'Login Failed');
            throw err;
        }
    };

    const logout = () =>{
        console.log('Logout successful');
        authService.logout();
        setUser(null);
    };

    const register = async(userData,doctorData,operatorData,type) =>{
        try{
            setError(null);
            let response;
            if(type === 'patient'){
                try{
                    setError(null);
                    console.log('📝 Register patient function called with data:', userData);
                    const response = await authService.registerPatient(userData);
                    console.log('✅ Patient registration successful:', response);
                    return response;
                }catch(err){
                    console.error('Registration error in context',err);
                    setError(err.response?.data?.message || 'Registration failed');
                    throw err;
                }
            }
            else if(type === 'doctor'){
                try{
                    setError(null);
                    console.log('📝 Register doctor function called with data:', doctorData);
                    const response = await authService.registerDoctor(doctorData);
                    console.log('✅ Doctor registration successful:', response);
                    return response;
                }catch(err){
                    console.error('Registration error in context',err);
                    setError(err.response?.data?.message || 'Registration failed');
                    throw err;
                }
            }
            else{
                try{
                    setError(null);
                    console.log('📝 Register staff function called with data:', operatorData);
                    const response = await authService.registerOperator(operatorData);
                    console.log('✅ Staff registration successful:', response);
                    return response;
                }catch(err){
                    console.error('Registration error in context',err);
                    setError(err.response?.data?.message || 'Registration failed.');
                    throw err;
                }
            }
            return response;
        }catch(err){
            setError(err.response?.data?.message || 'Registration failed');
            throw err;
        }
    };

    const forgotPass = async(email) =>{
        try{
            setError(null);
            console.log('Forgot Password for email:',email);
            const response = await authService.forgotPassword(email);
            return response;
        }catch(err){
            console.error('An error occurred. Try again later',err)
            setError(err.response?.data?.message || 'Failed to send request!');
            throw err;
        }
    };

    const resetPass = async(uId,token,newPassword,confirmPassword) =>{
        try{
            setError(null);
            console.log('Reset Password for UID:',uId);
            const response = await authService.resetPassword(uId,token,newPassword,confirmPassword);
            console.log('Reset Password successful.');
            return response;
        }
        catch(err){
            console.error('Error occurred while reseting password!',err);
            setError(err.response?.data?.message || 'Reset password unsuccessful. Try again.');
        }
    };

    const value = {
        user,loading,error,login,logout,register,setError,forgotPass,resetPass
    };

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
};