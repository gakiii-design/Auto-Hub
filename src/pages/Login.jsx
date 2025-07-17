import React, { useState } from 'react';

const Login = ({ onLogin, onGoRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  // Handles form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const res = await fetch('http://127.0.0.1:5000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('Login successful!');
        if (onLogin) onLogin(data.user_id);
      } else {
        setMessage(data.error || 'Login failed');
      }
    } catch (err) {
      setMessage('Network error');
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
        <button type="submit">Login</button>
      </form>
      {message && <p>{message}</p>}
      <div style={{ marginTop: 18, textAlign: 'center' }}>
        <span style={{ color: '#ccc' }}>You don&apos;t have an account? </span>
        <button type="button" style={{ background: 'none', border: 'none', color: '#ff9800', textDecoration: 'underline', cursor: 'pointer', fontWeight: 600, fontSize: '1em', padding: 0 }} onClick={onGoRegister}>Register</button>
      </div>
    </div>
  );
};

export default Login; 