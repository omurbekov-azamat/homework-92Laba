import React from 'react';
import {Routes, Route} from "react-router-dom";
import Modal from "./components/UI/Modal/Modal";
import Register from "./features/users/Register";
import Login from "./features/users/Login";

function App() {
    return (
        <Routes>
            <Route path='/' element={<Modal/>}>
                <Route path='/' element={<Register/>}/>
                <Route path='/login' element={<Login/>}/>
            </Route>
            <Route path='*' element={(<h1>Not found!</h1>)}/>
        </Routes>
    );
}

export default App;
