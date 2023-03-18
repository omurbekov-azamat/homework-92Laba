import React, {useState} from 'react';
import {useNavigate} from "react-router-dom";
import {logout} from "../../../features/users/usersThunks";
import {selectLogoutLoading, selectUser} from "../../../features/users/usersSlice";
import {useAppDispatch, useAppSelector} from "../../../app/hook";
import {Avatar, Button, Grid, Menu, MenuItem} from '@mui/material';
import {apiURL} from "../../../constants";

const UserMenu = () => {
    const dispatch = useAppDispatch();
    const user = useAppSelector(selectUser)!;
    const loading = useAppSelector(selectLogoutLoading);
    const navigate = useNavigate();

    let avatar = '';

    if (user.avatar && user.avatar.length > 50) {
        avatar = user.avatar;
    }
    if (user.avatar && user.avatar.length < 50) {
        avatar = apiURL + '/' + user.avatar;
    }

    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = async () => {
        await dispatch(logout());
        await navigate('/');
    };

    return (
        <>
            <Grid container>
                <Grid item>
                    <Avatar alt={user.displayName} src={avatar}/>
                </Grid>
                <Grid item>
                    <Button
                        onClick={handleClick}
                        color="inherit"
                    >
                        Hello, {user.displayName}
                    </Button>
                </Grid>
            </Grid>
            <Menu
                anchorEl={anchorEl}
                keepMounted
                open={Boolean(anchorEl)}
                onClose={handleClose}
            >
                <MenuItem onClick={handleLogout} disabled={loading}>Logout</MenuItem>
            </Menu>
        </>
    );
};

export default UserMenu;