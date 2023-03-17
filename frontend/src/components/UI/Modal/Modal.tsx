import * as React from 'react';
import {Outlet} from "react-router-dom";
import {selectModal} from "../../../features/users/usersSlice";
import {useAppSelector} from "../../../app/hook";
import Modal from '@mui/material/Modal';
import {Box} from "@mui/material";

export const styleModal = {
    position: 'absolute',
    top: '35%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 500,
    border: '2px solid black',
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
};

export default function BasicModal() {
    const open = useAppSelector(selectModal);

    return (
        <Modal
            open={open}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
        >
            <Box sx={styleModal}>
                <Outlet/>
            </Box>
        </Modal>
    );
};