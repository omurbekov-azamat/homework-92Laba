import {createSlice} from "@reduxjs/toolkit";
import {RootState} from "../../app/store";
import {register, googleLogin, login, logout} from "./usersThunks";
import {GlobalError, User, ValidationError} from "../../types";

interface UsersState {
    modalState: boolean;
    user: User | null;
    registerLoading: boolean;
    registerError: ValidationError | null;
    userTakenError: GlobalError | null;
    loginLoading: boolean;
    loginError: GlobalError | null;
    logoutLoading: boolean;
}

const initialState: UsersState = {
    modalState: true,
    user: null,
    registerLoading: false,
    registerError: null,
    userTakenError: null,
    loginLoading: false,
    loginError: null,
    logoutLoading: false,
}

export const usersSlice = createSlice({
    name: 'users',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(register.pending, (state) => {
            state.registerError = null;
            state.registerLoading = true;
        });
        builder.addCase(register.fulfilled, (state, {payload: user}) => {
            state.registerLoading = false;
            state.user = user;
        });
        builder.addCase(register.rejected, (state, {payload: error}) => {
            state.registerLoading = false;
            if (error) {
                if (error.hasOwnProperty('error')) {
                    state.userTakenError = error as GlobalError;
                }
                if (error.hasOwnProperty('errors')) {
                    state.registerError = error as ValidationError;
                }
            }
        });
        builder.addCase(login.pending, (state) => {
            state.loginLoading = true;
            state.loginError = null;
        });
        builder.addCase(login.fulfilled, (state, {payload: user}) => {
            state.loginLoading = false;
            state.user = user;
        });
        builder.addCase(login.rejected, (state, {payload: error}) => {
            state.loginLoading = false;
            state.loginError = error || null;
        });
        builder.addCase(googleLogin.pending, (state) => {
            state.loginLoading = true;
            state.loginError = null;
        });
        builder.addCase(googleLogin.fulfilled, (state, {payload: user}) => {
            state.loginLoading = false;
            state.user = user;
        });
        builder.addCase(googleLogin.rejected, (state, {payload: error}) => {
            state.loginLoading = false;
            state.loginError = error || null;
        });
        builder.addCase(logout.pending, (state) => {
            state.user = null;
            state.logoutLoading = true;
        });
        builder.addCase(logout.fulfilled, (state) => {
            state.logoutLoading = false;
        });
        builder.addCase(logout.rejected, (state) => {
            state.logoutLoading = false;
        });
    }
});

export const usersReducer = usersSlice.reducer;

export const selectModal = (state: RootState) => state.users.modalState;
export const selectUser = (state: RootState) => state.users.user;
export const selectRegisterLoading = (state: RootState) => state.users.registerLoading;
export const selectRegisterError = (state: RootState) => state.users.registerError;
export const selectUserTakenError = (state: RootState) => state.users.userTakenError;
export const selectLoginLoading = (state: RootState) => state.users.loginLoading;
export const selectLoginError = (state: RootState) => state.users.loginError;
export const selectLogoutLoading = (state: RootState) => state.users.logoutLoading;