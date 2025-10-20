import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

const Login = () => {
  const { auth, setAuth } = useAuth();

  const handleLogin = () => {
    // Implement login logic
    setAuth({ user: 'testUser', loggedIn: true });
  };

  return (
    <div>
      <h2>Login</h2>
      <button onClick={handleLogin}>Login</button>
    </div>
  );
};

export default Login;
