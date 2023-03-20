import React, {useState} from 'react';
import {Button, Container, Grid, TextField, Typography} from "@mui/material";
import {Message, Online} from "../types";

interface Props {
    userOnline: Online[];
    onSubmit: (message: Message) => void;
    id: string;
    displayName: string;
    messages: Message[];
}

const Chat: React.FC<Props> = ({userOnline, onSubmit, id, displayName, messages}) => {
    const [state, setState] = useState('');

    const inputChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
        setState(e.target.value);
    };

    const submitFormHandler = async (e: React.FormEvent) => {
        e.preventDefault();

        onSubmit({
            _id: id,
            displayName,
            message: state,
        });
        await setState('');
    };

    return (
        <Container maxWidth='lg'>
            <Grid container border={1} height={500} spacing={2} sx={{mt:2}}>
                <Grid item xs={2}>
                    <Typography variant='h5' component='div' color='red'>
                        Online users:
                    </Typography>
                    {userOnline.map(item => (
                        <Typography key={item._id}>
                            <b>Name: </b> {item.displayName}
                        </Typography>
                    ))}
                </Grid>
                <Grid item xs={10} border={1}>
                    <Grid container direction='column' justifyContent='space-around'>
                        <Grid item height={422} overflow='auto'>
                            {messages.map(item => (
                                <Typography key={Math.random()*9999}>
                                    <b>{item.displayName}:</b> {item.message}
                                </Typography>
                            ))}
                        </Grid>
                        <Grid item>
                            <form onSubmit={submitFormHandler}>
                                <Grid container direction='row' alignItems='center'>
                                    <Grid item xs={9}>
                                        <TextField
                                            value={state}
                                            onChange={inputChangeHandler}
                                            label='Message'
                                            fullWidth={true}
                                            required
                                        />
                                    </Grid>
                                    <Grid item xs>
                                        <Button
                                            type='submit'
                                            color='warning'
                                            variant='contained'
                                        >
                                            Send
                                        </Button>
                                    </Grid>
                                </Grid>
                            </form>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        </Container>
    );
};

export default Chat;