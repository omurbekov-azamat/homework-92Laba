import React from 'react';
import {useAppDispatch} from "../../app/hook";
import {GoogleLogin} from "@react-oauth/google";
import {Box} from "@mui/material";
import {googleLogin} from "../../features/users/usersThunks";

const LoginWithGoogle = () => {
    const dispatch = useAppDispatch();

    const googleRegisterHandler = async (credentials: string) => {
        await dispatch(googleLogin(credentials)).unwrap();
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