import React, { useState } from 'react';
import { API_BASE_URL } from '../config/api';

const Register = ({ onGoLogin }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage('');
    const res = await fetch(`${API_BASE_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });
    const data = await res.json();
    if (res.ok) {
      setMessage('Registration successful!');
      setName(''); setEmail(''); setPassword('');
    } else {
      setMessage(data.error || 'Registration failed');
    }
  };

  return (
    <div>
      <h2>Register</h2>
      <form onSubmit={handleRegister}>
        <input type="text" placeholder="Name" value={name} onChange={e => setName(e.target.value)} required />
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
        <button type="submit">Register</button>
      </form>
      {message && <p>{message}</p>}
      <div style={{ marginTop: 18, textAlign: 'center' }}>
        <span style={{ color: '#ccc' }}>Already have an account? </span>
        <button type="button" style={{ background: 'none', border: 'none', color: '#ff9800', textDecoration: 'underline', cursor: 'pointer', fontWeight: 600, fontSize: '1em', padding: 0 }} onClick={onGoLogin}>Login</button>
      </div>
    </div>
  );
};

export default Register; 