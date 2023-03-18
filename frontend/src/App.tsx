import React from 'react';
import {Routes, Route} from "react-router-dom";
import Modal from "./components/UI/Modal/Modal";
import Register from "./features/users/Register";
import Login from "./features/users/Login";
import Chat from "./container/Chat";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
import {useAppSelector} from "./app/hook";
import {selectUser} from "./features/users/usersSlice";

function App() {
    const user = useAppSelector(selectUser);
    return (
        <Routes>
            <Route path='/' element={<Modal/>}>
                <Route path='/' element={<Register/>}/>
                <Route path='/login' element={<Login/>}/>
            </Route>
            <Route path='/chat' element={(
                <ProtectedRoute isAllowed={user && Boolean(user)}>
                    <Chat/>
                </ProtectedRoute>
            )}/>
            <Route path='*' element={(<h1>Not found!</h1>)}/>
        </Routes>
    );
}

export default App;
