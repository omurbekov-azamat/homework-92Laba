import React from 'react';
import {Container, Grid, Typography} from "@mui/material";
import {Online} from "../types";

interface Props {
    userOnline: Online[]
}

const Chat: React.FC<Props> = ({userOnline}) => {
    return (
        <Container maxWidth='lg'>
            <Grid container border={1} height={500} spacing={1}>
                <Grid item xs={2} border={1}>
                    <Typography variant='h5' component='div' color='red'>
                        Online users:
                    </Typography>
                    {userOnline.map(item =>(
                        <Typography key={item._id}>
                            <b>Name: </b> {item.displayName}
                        </Typography>
                    ))}
                </Grid>
                <Grid item>

                </Grid>
            </Grid>
        </Container>
    );
};

export default Chat;