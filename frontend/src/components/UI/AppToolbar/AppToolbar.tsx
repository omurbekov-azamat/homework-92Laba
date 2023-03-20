import React from 'react';
import {AppBar, Container, Grid, Toolbar, Typography} from '@mui/material';
import {useAppSelector} from "../../../app/hook";
import {selectUser} from "../../../features/users/usersSlice";
import UserMenu from "./UserMenu";

const AppToolbar = () => {
    const user = useAppSelector(selectUser);
    return (
        <AppBar position="sticky" sx={{mb: 2}}>
            <Container maxWidth='lg'>
                <Toolbar>
                    <Grid container justifyContent='space-between' alignContent='center'>
                        <Typography variant="h6" component="div" sx={{flexGrow: 1}}>
                            Chat
                        </Typography>
                        <Grid item>
                            {user &&  <UserMenu user={user}/>}
                        </Grid>
                    </Grid>
                </Toolbar>
            </Container>
        </AppBar>
    );
};

export default AppToolbar;