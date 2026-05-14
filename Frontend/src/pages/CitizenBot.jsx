import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { submitComplaint, login, register } from '../services/api';
import './CitizenBot.css';
import { FiSend, FiUser, FiInfo, FiCheckCircle, FiShield, FiLogOut } from 'react-icons/fi';

const CitizenBot = () => {
  const navigate = useNavigate();
  const scrollRef = useRef(null);

  const [convState, setConvState] = useState('START');
  const [tempData, setTempData] = useState({});
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user');
      return (savedUser && savedUser !== 'undefined') ? JSON.parse(savedUser) : null;
    } catch (e) { return null; }
  });
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      setMessages([
        { id: 1, text: "Welcome to the Municipal Complaint Assistant. Please log in or register to report a civic issue.", sender: 'bot', time: new Date().toLocaleTimeString() }
      ]);
      setConvState('AWAITING_AUTH_CHOICE');
    } else {
      setMessages([
        { id: 1, text: `Welcome back, ${user.name}. How can the municipality assist you today? Please describe your grievance.`, sender: 'bot', time: new Date().toLocaleTimeString() }
      ]);
      setConvState('CHAT');
    }
  }, [user]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
    setConvState('START');
    setMessages([]);
    setTempData({});
  };

  const processResponse = async (text) => {
    const userMsg = { id: Date.now(), text, sender: 'user', time: new Date().toLocaleTimeString() };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      if (convState === 'AWAITING_AUTH_CHOICE') {
        const choice = text.toLowerCase();
        if (choice.includes('register')) {
          setMessages(prev => [...prev, { id: Date.now()+1, text: "Please provide your Full Name to begin registration:", sender: 'bot', time: new Date().toLocaleTimeString() }]);
          setConvState('AWAITING_REG_NAME');
        } else {
          setMessages(prev => [...prev, { id: Date.now()+1, text: "Please enter your Registered Email Address:", sender: 'bot', time: new Date().toLocaleTimeString() }]);
          setConvState('AWAITING_LOGIN_EMAIL');
        }
      }
      else if (convState === 'AWAITING_LOGIN_EMAIL') {
        setTempData({ ...tempData, email: text });
        setMessages(prev => [...prev, { id: Date.now()+1, text: "Thank you. Now please enter your Password:", sender: 'bot', time: new Date().toLocaleTimeString() }]);
        setConvState('AWAITING_LOGIN_PASSWORD');
      }
      else if (convState === 'AWAITING_LOGIN_PASSWORD') {
        try {
          const res = await login(tempData.email, text);
          localStorage.setItem('user', JSON.stringify(res.user));
          localStorage.setItem('token', res.token);
          setUser(res.user);
          if (res.user.role === 'admin') navigate('/admin');
          else setConvState('CHAT');
        } catch (err) {
          setMessages(prev => [...prev, { id: Date.now()+1, text: "Invalid credentials. Please select 'Log In' to try again.", sender: 'bot', time: new Date().toLocaleTimeString() }]);
          setConvState('AWAITING_AUTH_CHOICE');
        }
      }
      else if (convState === 'AWAITING_REG_NAME') {
          setTempData({ ...tempData, name: text });
          setMessages(prev => [...prev, { id: Date.now()+1, text: "Enter your Email Address for account updates:", sender: 'bot', time: new Date().toLocaleTimeString() }]);
          setConvState('AWAITING_REG_EMAIL');
      }
      else if (convState === 'AWAITING_REG_EMAIL') {
          setTempData({ ...tempData, email: text });
          setMessages(prev => [...prev, { id: Date.now()+1, text: "Create a password for your account:", sender: 'bot', time: new Date().toLocaleTimeString() }]);
          setConvState('AWAITING_REG_PASSWORD');
      }
      else if (convState === 'AWAITING_REG_PASSWORD') {
          const regData = { ...tempData, password: text, city: 'Mumbai', phone: '0000000000' };
          await register(regData);
          const lr = await login(regData.email, text);
          localStorage.setItem('user', JSON.stringify(lr.user));
          localStorage.setItem('token', lr.token);
          setUser(lr.user);
          setConvState('CHAT');
      }
      else if (convState === 'CHAT') {
        setTempData({ ...tempData, complaint_text: text });
        setMessages(prev => [...prev, { id: Date.now()+1, text: "Analyzing your request... Please select the appropriate category for this issue:", sender: 'bot', time: new Date().toLocaleTimeString() }]);
        setConvState('AWAITING_CATEGORY');
      }
      else if (convState === 'AWAITING_CATEGORY') {
        const response = await submitComplaint(tempData.complaint_text, text, user.name, user.city);
        setMessages(prev => [...prev, { 
          id: Date.now()+2, 
          text: `Complaint registered successfully. ✅\nReference ID: ${response.id.slice(-6).toUpperCase()}\nAssigned Worker: ${response.assigned_worker ? response.assigned_worker.name : 'Processing'}\nPriority: ${response.priority}`, 
          sender: 'bot', 
          time: new Date().toLocaleTimeString() 
        }]);
        setConvState('CHAT');
      }
    } catch (e) {
      setMessages(prev => [...prev, { id: Date.now()+1, text: "We are currently experiencing technical difficulties. Please try again later.", sender: 'bot', time: new Date().toLocaleTimeString() }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    const i = input;
    setInput('');
    processResponse(i);
  };

  return (
    <div className="bot-page">
      <nav className="gov-navbar">
        <div className="nav-container">
          <div className="nav-item active">Home</div>
          <div className="nav-item">About Us</div>
          <div className="nav-item">Help</div>
        </div>
        <div style={{display: 'flex', gap: '15px'}}>
          <button onClick={() => navigate('/login')} style={{fontSize: '0.8rem', color: '#003366', fontWeight: 600}}>Admin Dashboard</button>
        </div>
      </nav>

      <header className="bot-header">
        <div className="header-content">
          <img src="/civicseva_logo.png" alt="Gov Logo" className="gov-seal-img" />
          <div className="header-text">
            <h1>Municipal Grievance Portal</h1>
            <p>Unified Complaint Redressal System {user ? `| ${user.city}` : ''}</p>
          </div>
        </div>
        <div style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
          <img src="/pngwing.com.png" alt="Swachh Bharat" className="swachh-logo" />
          {user && <button onClick={handleLogout} className="logout-btn" style={{color: 'white'}}><FiLogOut /></button>}
        </div>
      </header>

      <div className="chat-container">
        <div className="chat-messages">
          {messages.map(m => (
            <div key={m.id} className={`message-wrapper ${m.sender}`}>
              <div className="avatar">
                {m.sender === 'bot' ? <FiShield /> : <FiUser />}
              </div>
              <div className="message-content">
                <div className="message-bubble" style={{whiteSpace: 'pre-wrap'}}>{m.text}</div>
                
                {/* Official Action Buttons */}
                {m.id === messages[messages.length-1].id && !loading && (
                    <>
                      {convState === 'AWAITING_AUTH_CHOICE' && (
                        <div className="auth-options">
                          <button onClick={() => processResponse('Log In')} className="auth-btn">Log In</button>
                          <button onClick={() => processResponse('Register')} className="auth-btn" style={{background: '#64748b'}}>Register</button>
                        </div>
                      )}
                      {convState === 'AWAITING_CATEGORY' && (
                        <div className="category-options">
                          {['Waste Management', 'Water Supply', 'Electricity', 'Roads/Potholes', 'Sanitation', 'Public Safety'].map(cat => (
                            <button key={cat} onClick={() => processResponse(cat)} className="cat-btn">{cat}</button>
                          ))}
                        </div>
                      )}
                    </>
                )}
                <span className="message-time">{m.time}</span>
              </div>
            </div>
          ))}
          {loading && <div className="message-bubble loading">...</div>}
          <div ref={scrollRef} />
        </div>

        <form className="chat-input" onSubmit={handleSend}>
          <input 
            type={convState.includes('PASSWORD') ? 'password' : 'text'}
            placeholder="Type your message here..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
          />
          <button type="submit" disabled={loading || !input.trim()}>
            <FiSend />
          </button>
        </form>
      </div>
    </div>
  );
};

export default CitizenBot;
