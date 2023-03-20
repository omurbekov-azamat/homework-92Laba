import {createAsyncThunk} from "@reduxjs/toolkit";
import axiosApi from '../../axiosApi';
import {RegisterResponse, User} from "../../types";

export const googleLogin = createAsyncThunk<User, string>(
    'users/googleLogin',
    async (credential, ) => {
        try {
            const response = await axiosApi.post<RegisterResponse>('/users/google', {credential});
            return response.data.user
        } catch (e) {
            throw e;
        }
    },
);