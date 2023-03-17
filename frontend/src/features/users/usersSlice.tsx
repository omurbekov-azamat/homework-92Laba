import {createSlice} from "@reduxjs/toolkit";
import {RootState} from "../../app/store";

interface UsersState {
    modalState: boolean;
}

const initialState: UsersState = {
    modalState: true,
}

export const usersSlice = createSlice({
    name: 'users',
    initialState,
    reducers: {
        closeModal: (state) => {
            state.modalState = false;
        }
    },
});

export const usersReducer = usersSlice.reducer;

export const {closeModal} = usersSlice.actions;
export const selectModal = (state: RootState) => state.users.modalState;