import React, { useState } from 'react';

const shopSuggestions = [
  {
    keywords: ['engine', 'oil', 'battery', 'overheat', 'smoke', 'stall', 'misfire'],
    name: 'JOHN AUTO CARS',
    phone: '1234567',
    location: 'KIAMBU ROAD',
    type: 'Engine Specialist',
  },
  {
    keywords: ['body', 'paint', 'scratch', 'dent', 'panel', 'bumper', 'repair'],
    name: 'MARY CAR BODY SHOP',
    phone: '56789',
    location: 'ACCRA ROAD',
    type: 'Body & Paint',
  },
  {
    keywords: ['suspension', 'tire', 'tyre', 'wheel', 'shock', 'spring', 'alignment'],
    name: 'KAMAU RIDES LTD',
    phone: '0116198',
    location: 'KAMPALA ROAD',
    type: 'Suspension & Tires',
  },
];

function getSuggestion(problem) {
  const text = problem.toLowerCase();
  for (const shop of shopSuggestions) {
    if (shop.keywords.some(k => text.includes(k))) {
      return shop;
    }
  }
  return null;
}

const Diagnostics = () => {
  const [problem, setProblem] = useState('');
  const [result, setResult] = useState('');
  const [suggestion, setSuggestion] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Basic diagnostic
    setResult('Preliminary diagnostic: Please check your car and consider visiting a specialist.');
    const shop = getSuggestion(problem);
    setSuggestion(shop);
  };

  return (
    <div>
      <h2>Diagnostics</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Describe your car problem..."
          value={problem}
          onChange={e => setProblem(e.target.value)}
          required
        />
        <button type="submit">Get Diagnostic</button>
      </form>
      {result && <p style={{ marginTop: 24, fontWeight: 600 }}>{result}</p>}
      {suggestion && (
        <div style={{ marginTop: 18, background: '#181818', borderRadius: 10, padding: 16, color: '#ff9800', boxShadow: '0 2px 12px rgba(255,152,0,0.08)' }}>
          <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{suggestion.type} Recommendation:</div>
          <div style={{ color: '#fff', marginTop: 6 }}>
            Visit <strong>{suggestion.name}</strong><br />
            <span>Phone: {suggestion.phone}</span><br />
            <span>Location: {suggestion.location}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Diagnostics; 