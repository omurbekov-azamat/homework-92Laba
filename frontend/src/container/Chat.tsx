import React, {useState} from 'react';
import {Button, Container, Grid, TextField, Typography} from "@mui/material";
import {useAppSelector} from "../app/hook";
import {selectUser} from "../features/users/usersSlice";
import {Message, MessageMutation, Online} from "../types";

interface Props {
    userOnline: Online[];
    onSubmit: (message: MessageMutation) => void;
    messages: Message[];
    moderatorSubmit: () => void;
}

const Chat: React.FC<Props> = ({userOnline, onSubmit, messages, moderatorSubmit}) => {
    const [state, setState] = useState('');
    const user = useAppSelector(selectUser);

    const inputChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
        setState(e.target.value);
    };

    const submitFormHandler = async (e: React.FormEvent) => {
        e.preventDefault();

        if (user) {
            onSubmit({
                _id: user._id,
                message: state,
            });
        }
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
                        <Grid item height={380} overflow='auto'>
                            {messages.map(item => (
                                <Typography key={Math.random()*9999}>
                                    <b>{item.user.displayName}:</b> {item.message}
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
                                    <Grid item xs>
                                        {user && user.role === 'moderator' &&
                                            <Button
                                                type='button'
                                                color='primary'
                                                variant='outlined'
                                                onClick={moderatorSubmit}
                                            >
                                                clear
                                            </Button>
                                        }
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