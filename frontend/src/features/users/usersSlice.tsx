import {createSlice} from "@reduxjs/toolkit";
import {RootState} from "../../app/store";
import {register, googleLogin} from "./usersThunks";
import {GlobalError, User, ValidationError} from "../../types";

interface UsersState {
    modalState: boolean;
    user: User | null;
    registerLoading: boolean;
    registerError: ValidationError | null;
    userTakenError: GlobalError | null;
}

const initialState: UsersState = {
    modalState: true,
    user: null,
    registerLoading: false,
    registerError: null,
    userTakenError: null,
}

export const usersSlice = createSlice({
    name: 'users',
    initialState,
    reducers: {
        closeModal: (state) => {
            state.modalState = false;
        }
    },
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
        builder.addCase(googleLogin.pending, (state) => {
            state.registerError = null;
            state.registerLoading = true;
        });
        builder.addCase(googleLogin.fulfilled, (state, {payload: user}) => {
            state.registerLoading = false;
            state.user = user;
        });
        builder.addCase(googleLogin.rejected, (state, {payload: error}) => {
            state.registerLoading = false;
            if (error) {
                if (error.hasOwnProperty('error')) {
                    state.userTakenError = error as GlobalError;
                }
            }
        });
    }
});

export const usersReducer = usersSlice.reducer;

export const {closeModal} = usersSlice.actions;
export const selectModal = (state: RootState) => state.users.modalState;
export const selectUser = (state: RootState) => state.users.user;
export const selectRegisterLoading = (state: RootState) => state.users.registerLoading;
export const selectRegisterError = (state: RootState) => state.users.registerError;
export const selectUserTakenError = (state: RootState) => state.users.userTakenError;