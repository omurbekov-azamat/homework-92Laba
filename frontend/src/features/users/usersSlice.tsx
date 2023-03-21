import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {RootState} from "../../app/store";
import {googleLogin} from "./usersThunks";
import {LoginMutation, RegisterMutation, User, ValidationError} from "../../types";

interface UsersState {
    registerState: RegisterMutation | null;
    registerError: ValidationError | null;
    user: User | null;
    loginState: LoginMutation | null;
    loginError: string | null;
    token: string | null;
    loginLoading: boolean;
    googleUser: string | null;
}

const initialState: UsersState = {
    registerState: null,
    registerError: null,
    user: null,
    loginState: null,
    loginError: null,
    token: null,
    loginLoading: false,
    googleUser: null,
}

export const usersSlice = createSlice({
    name: 'users',
    initialState,
    reducers: {
        userState: (state, {payload: userState}: PayloadAction<RegisterMutation>) => {
            state.token = null;
            state.registerError = null;
            state.registerState = userState;
        },
        register: (state, {payload: user}: PayloadAction<User>) => {
            state.token = null;
            state.googleUser = null;
            state.registerState = null;
            state.loginState = null;
            state.user = user;
        },
        catchRegisterError: (state, {payload: error}: PayloadAction<ValidationError>) => {
            state.registerError = error;
        },
        loginState: (state, {payload: loginState}: PayloadAction<LoginMutation>) => {
            state.token = null;
            state.loginError = null;
            state.loginState = loginState;
        },
        catchLoginError: (state, {payload: error}: PayloadAction<string>) => {
            state.loginError = error;
        },
        logout: (state, {payload: token}: PayloadAction<string>) => {
            state.googleUser = null;
            state.loginState = null;
            state.registerState = null;
            state.token = token;
            state.user = null;
        }
    },
    extraReducers: (builder) => {
        builder.addCase(googleLogin.pending, (state) => {
            state.googleUser = null;
            state.loginLoading = true;
        });
        builder.addCase(googleLogin.fulfilled, (state, {payload: user}) => {
            state.loginLoading = false;
            state.user = user;
            state.googleUser = user.token
        });
        builder.addCase(googleLogin.rejected, (state) => {
            state.loginLoading = false;
        });
    },
});

export const usersReducer = usersSlice.reducer;

export const {userState, register, catchRegisterError, loginState, catchLoginError, logout} = usersSlice.actions;

export const selectUser = (state: RootState) => state.users.user;
export const selectUserRegisterMutation = (state: RootState) => state.users.registerState;
export const selectUserLoginMutation = (state: RootState) => state.users.loginState;
export const selectLoginError = (state: RootState) => state.users.loginError;
export const selectRegisterError = (state: RootState) => state.users.registerError;
export const selectToken = (state: RootState) => state.users.token;
export const selectLoginLoading = (state: RootState) => state.users.loginLoading;
export const selectGoogleUser = (state: RootState) => state.users.googleUser;
