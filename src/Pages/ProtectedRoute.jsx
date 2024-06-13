import React from 'react';
import { Route, Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

function ProtectedRoute({ ...props }) {
    const auth = useAuth();
    const isAuthenticated = auth.isLoggedIn;

    if (isAuthenticated) {
        return <Route {...props} />;
    } else {
        return <Navigate to="/" />;
    }
}

export default ProtectedRoute;
