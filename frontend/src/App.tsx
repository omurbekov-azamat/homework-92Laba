import React from 'react';
import {Routes, Route} from "react-router-dom";
import Register from "./features/users/Register";
import Login from "./features/users/Login";
import Home from "./container/Home";

function App() {

    return (
        <Routes>
            <Route path='/' element={<Home/>}>
                <Route path='/' element={<Register/>}/>
                <Route path='/login' element={<Login/>}/>
            </Route>
            <Route path='*' element={(<h1>Not found!</h1>)}/>
        </Routes>
    );
}

export default App;
