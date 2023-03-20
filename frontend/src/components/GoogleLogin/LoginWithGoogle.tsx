import React from 'react';
import {useNavigate} from "react-router-dom";
import {googleLogin} from "../../features/users/usersThunks";
import {useAppDispatch} from "../../app/hook";
import {GoogleLogin} from "@react-oauth/google";
import {Box} from "@mui/material";

const LoginWithGoogle = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const googleRegisterHandler = async (credentials: string) => {
        await dispatch(googleLogin(credentials));
        await navigate('/');
    };

    return (
        <Box sx={{ pt: 2 }}>
            <GoogleLogin
                onSuccess={(credentialResponse) => {
                    if (credentialResponse.credential) {
                        void googleRegisterHandler(credentialResponse.credential);
                    }
                }}
                onError={() => {
                    console.log('Login failed');
                }}
            />
        </Box>
    );
};

export default LoginWithGoogle;