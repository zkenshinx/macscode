import React from 'react';
import {Routes, Route} from 'react-router-dom';
import Home from './components/Home';
import Login from './components/Login';
import Signup from './components/Signup';
import PrivateRoute from './components/routes/PrivateRoute';
import Profile from "./components/Profile";

const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/login" element={<Login/>}/>
            <Route path="/signup" element={<Signup/>}/>
            <Route
                path="/"
                element={
                    <PrivateRoute>
                        <Home/>
                    </PrivateRoute>
                }
            />
            <Route path="/profile" element={
                <PrivateRoute>
                    <Profile/>
                </PrivateRoute>
            }
            />
        </Routes>
    );
};

export default AppRoutes;
