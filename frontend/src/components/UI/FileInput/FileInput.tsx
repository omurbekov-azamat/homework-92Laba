import React, {useRef, useState} from 'react';
import {Box, Button, Grid, TextField} from '@mui/material';
import {ValidationError} from "../../../types";

interface Props {
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    name: string;
    label: string;
    type?: string;
    error?: ValidationError | null;
}

const FileInput: React.FC<Props> = ({onChange, name, label, type, error}) => {
    const inputRef = useRef<HTMLInputElement>(null);

    const [filename, setFilename] = useState('');

    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFilename(e.target.files[0].name);
        } else {
            setFilename('');
        }

        onChange(e);
    };

    const activateInput = () => {
        if (inputRef.current) {
            inputRef.current.click();
        }
    };

    const getFieldError = (fieldName: string) => {
        try {
            return error?.errors[fieldName].message;
        } catch {
            return undefined;
        }
    };

    return (
        <Box sx={{width: '350px', ml: '130px'}}>
            <input
                style={{display: 'none'}}
                type="file"
                accept={type}
                name={name}
                onChange={onFileChange}
                ref={inputRef}
            />
            <Grid container direction="row" spacing={2} alignItems="center">
                <Grid item xs>
                    <TextField
                        disabled
                        label={label}
                        value={filename}
                        onClick={activateInput}
                        error={Boolean(getFieldError('image'))}
                        helperText={getFieldError('image')}
                    />
                </Grid>
                <Grid item>
                    <Button type="button" variant="contained" onClick={activateInput}>Browse</Button>
                </Grid>
            </Grid>
        </Box>
    );
};

export default FileInput;