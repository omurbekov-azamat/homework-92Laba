import React from 'react';
import {Outlet} from "react-router-dom";
import {selectUser} from "../../../features/users/usersSlice";
import {useAppSelector} from "../../../app/hook";
import Modal from "@mui/material/Modal";
import {Box} from "@mui/material";
import {styleModal} from "../../../constants";

const ModalCover = () => {
    const user = useAppSelector(selectUser)
    return (
        <Modal
            open={user === null}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
        >
            <Box sx={styleModal}>
                <Outlet/>
            </Box>
        </Modal>
    );
};

export default ModalCover;