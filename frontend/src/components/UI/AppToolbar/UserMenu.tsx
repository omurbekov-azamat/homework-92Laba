import React, {useState} from 'react';
import {logout} from "../../../features/users/usersSlice";
import {useAppDispatch} from "../../../app/hook";
import {Avatar, Button, Grid, Menu, MenuItem} from '@mui/material';
import {User} from "../../../types";

interface Props {
    user: User;
}

const UserMenu: React.FC<Props> = ({user}) => {
    const dispatch = useAppDispatch();

    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = async (token: string) => {
        dispatch(logout(token)) ;
    };

    return (
        <>
            <Grid container>
                <Grid item>
                    <Avatar alt={user.displayName}/>
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
                <MenuItem onClick={() => handleLogout(user.token)}>Logout</MenuItem>
            </Menu>
        </>
    );
};

export default UserMenu;