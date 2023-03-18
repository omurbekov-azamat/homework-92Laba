import React from 'react';
import {AppBar, Container, Grid, Toolbar, Typography} from '@mui/material';
import UserMenu from "./UserMenu";

const AppToolbar = () => {
    return (
        <AppBar position="sticky" sx={{mb: 2}}>
            <Container maxWidth='lg'>
                <Toolbar>
                    <Grid container justifyContent='space-between' alignContent='center'>
                        <Typography variant="h6" component="div" sx={{flexGrow: 1}}>
                            Chat
                        </Typography>
                        <Grid item>
                            <UserMenu/>
                        </Grid>
                    </Grid>
                </Toolbar>
            </Container>
        </AppBar>
    );
};

export default AppToolbar;