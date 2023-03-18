import {createAsyncThunk} from "@reduxjs/toolkit";
import axiosApi from '../../axiosApi';
import {isAxiosError} from "axios";
import {GlobalError, LoginMutation, RegisterMutation, RegisterResponse, User, ValidationError} from "../../types";

export const register = createAsyncThunk<User, RegisterMutation, {rejectValue: ValidationError | GlobalError}>(
    'users/register',
    async (registerMutation,{rejectWithValue}) => {
        try {
            const formData = new FormData();
            const keys = Object.keys(registerMutation) as (keyof RegisterMutation)[];

            keys.forEach((key) => {
                const value = registerMutation[key];

                if (value !== null) {
                    formData.append(key, value);
                }
            });

            const response = await axiosApi.post<RegisterResponse>('/users', formData);
            return response.data.user;
        } catch (e) {
            if (isAxiosError(e) && e.response && e.response.status === 400) {
                return rejectWithValue(e.response.data as ValidationError);
            }
            if (isAxiosError(e) && e.response && e.response.status === 500 && e.response.statusText === 'Internal Server Error') {
                const error: GlobalError = {
                    error: 'That username is taken. Try another.',
                };
                return rejectWithValue(error as GlobalError);
            }
            throw e;
        }
    }
);

export const googleLogin = createAsyncThunk<User, string, { rejectValue: GlobalError }>(
    'users/googleLogin',
    async (credential, { rejectWithValue }) => {
        try {
            const response = await axiosApi.post<RegisterResponse>('/users/google', {credential});
            return response.data.user
        } catch (e) {
            if (isAxiosError(e) && e.response && e.response.status === 400) {
                return rejectWithValue(e.response.data as GlobalError);
            }
            throw e;
        }
    },
);

export const login = createAsyncThunk<User, LoginMutation, { rejectValue: GlobalError }>(
    'users/login',
    async (loginMutation, {rejectWithValue}) => {
        try {
            const response = await axiosApi.post<RegisterResponse>('/users/sessions', loginMutation);
            return response.data.user;
        } catch (e) {
            if (isAxiosError(e) && e.response && e.response.status === 400) {
                return rejectWithValue(e.response.data as GlobalError);
            }
            throw e;
        }
    }
);

export const logout = createAsyncThunk(
    'users/logout',
    async () => {
        await axiosApi.delete('/users/sessions');
    }
);
