import React from 'react';
import {Routes, Route} from "react-router-dom";
import Modal from "./components/UI/Modal/Modal";

function App() {
    return (
        <Routes>
            <Route path='/' element={<Modal/>}/>
            <Route path='*' element={(<h1>Not found!</h1>)}/>
        </Routes>
    );
}

export default App;
