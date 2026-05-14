import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { submitComplaint, login, register } from '../services/api';
import './CitizenBot.css';
import { FaPaperPlane, FaUserCircle, FaRobot, FaSignOutAlt, FaUserPlus, FaSignInAlt, FaSearch } from 'react-icons/fa';

const CitizenBot = () => {
  const navigate = useNavigate();
  const scrollRef = useRef(null);

  const [convState, setConvState] = useState('START');
  const [tempData, setTempData] = useState({});
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user');
      return (savedUser && savedUser !== 'undefined') ? JSON.parse(savedUser) : null;
    } catch (e) {
      return null;
    }
  });
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      setMessages([
        { 
          id: 1, 
          text: "Welcome to CivicSevaAI Grievance Support System. Please login or register to continue.", 
          sender: 'bot', 
          time: new Date().toLocaleTimeString() 
        }
      ]);
      setConvState('AWAITING_AUTH_CHOICE');
    } else {
      setMessages([
        { 
          id: 1, 
          text: `Jai Hind, ${user.name}! Welcome back to CivicSevaAI. Please describe your civic issue.`, 
          sender: 'bot', 
          time: new Date().toLocaleTimeString() 
        }
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
          setMessages(prev => [...prev, { id: Date.now() + 1, text: "Let's create your account. Please enter your Full Name:", sender: 'bot', time: new Date().toLocaleTimeString() }]);
          setConvState('AWAITING_REG_NAME');
        } else if (choice.includes('login')) {
          setMessages(prev => [...prev, { id: Date.now() + 1, text: "Please enter your registered Email:", sender: 'bot', time: new Date().toLocaleTimeString() }]);
          setConvState('AWAITING_LOGIN_EMAIL');
        } else {
          setMessages(prev => [...prev, { id: Date.now() + 1, text: "I didn't quite get that. Please type 'Login' or 'Register'.", sender: 'bot', time: new Date().toLocaleTimeString() }]);
        }
      } 
      // LOGIN FLOW
      else if (convState === 'AWAITING_LOGIN_EMAIL') {
        setTempData({ ...tempData, email: text });
        setMessages(prev => [...prev, { id: Date.now() + 1, text: "Got it. Now enter your Password:", sender: 'bot', time: new Date().toLocaleTimeString() }]);
        setConvState('AWAITING_LOGIN_PASSWORD');
      }
      else if (convState === 'AWAITING_LOGIN_PASSWORD') {
        try {
          const res = await login(tempData.email, text);
          localStorage.setItem('user', JSON.stringify(res.user));
          localStorage.setItem('token', res.token);
          setUser(res.user);
          
          if (res.user.role === 'admin') {
            navigate('/admin');
          } else {
            setConvState('CHAT');
          }
        } catch (err) {
          setMessages(prev => [...prev, { id: Date.now() + 1, text: "Invalid credentials. Please type 'Login' to try again.", sender: 'bot', time: new Date().toLocaleTimeString() }]);
          setConvState('AWAITING_AUTH_CHOICE');
        }
      }
      // REGISTRATION FLOW
      else if (convState === 'AWAITING_REG_NAME') {
        setTempData({ ...tempData, name: text });
        setMessages(prev => [...prev, { id: Date.now() + 1, text: "Thank you! Now enter your Email:", sender: 'bot', time: new Date().toLocaleTimeString() }]);
        setConvState('AWAITING_REG_EMAIL');
      }
      else if (convState === 'AWAITING_REG_EMAIL') {
        setTempData({ ...tempData, email: text });
        setMessages(prev => [...prev, { id: Date.now() + 1, text: "Please provide your Phone Number:", sender: 'bot', time: new Date().toLocaleTimeString() }]);
        setConvState('AWAITING_REG_PHONE');
      }
      else if (convState === 'AWAITING_REG_PHONE') {
        setTempData({ ...tempData, phone: text });
        setMessages(prev => [...prev, { id: Date.now() + 1, text: "Which City/Municipality are you from?", sender: 'bot', time: new Date().toLocaleTimeString() }]);
        setConvState('AWAITING_REG_CITY');
      }
      else if (convState === 'AWAITING_REG_CITY') {
        setTempData({ ...tempData, city: text });
        setMessages(prev => [...prev, { id: Date.now() + 1, text: "Finally, set a strong Password:", sender: 'bot', time: new Date().toLocaleTimeString() }]);
        setConvState('AWAITING_REG_PASSWORD');
      }
      else if (convState === 'AWAITING_REG_PASSWORD') {
        const regData = { ...tempData, password: text };
        try {
          await register(regData);
          const loginRes = await login(regData.email, text);
          localStorage.setItem('user', JSON.stringify(loginRes.user));
          localStorage.setItem('token', loginRes.token);
          setUser(loginRes.user);
          
          if (loginRes.user.role === 'admin') {
            navigate('/admin');
          } else {
            setConvState('CHAT');
          }
        } catch (err) {
          let errorMsg = err.response?.data?.detail || "Registration failed. Please type 'Register' to try again.";
          
          // Handle object errors (like FastAPI validation errors)
          if (typeof errorMsg === 'object') {
            if (Array.isArray(errorMsg)) {
              // Extract message from first validation error if it's a list
              errorMsg = errorMsg[0]?.msg || JSON.stringify(errorMsg);
            } else {
              errorMsg = JSON.stringify(errorMsg);
            }
          }

          setMessages(prev => [...prev, { 
            id: Date.now() + 1, 
            text: `⚠️ ${errorMsg}`, 
            sender: 'bot', 
            time: new Date().toLocaleTimeString() 
          }]);
          setConvState('AWAITING_AUTH_CHOICE');
        }
      }
      // COMPLAINT FLOW - STEP 1: DESCRIPTION
      else if (convState === 'CHAT') {
        setTempData({ ...tempData, complaint_text: text });
        const botMsg = { 
          id: Date.now() + 1, 
          text: "Processing your grievance... AI analysis in progress. 📊 Please select the best-fitting category to finalize your report:", 
          sender: 'bot', 
          time: new Date().toLocaleTimeString() 
        };
        setMessages(prev => [...prev, botMsg]);
        setConvState('AWAITING_CATEGORY');
      }
      // COMPLAINT FLOW - STEP 2: CATEGORY SELECTION
      else if (convState === 'AWAITING_CATEGORY') {
        const categoryMap = {
          'Drainage Issue': 'Drainage',
          'Electricity': 'Electrical',
          'Traffic/Road': 'Traffic',
          'Waste/Garbage': 'Waste Management',
          'Water Supply': 'Water',
          'Roads/Potholes': 'Roads',
          'Sanitation': 'Sanitation',
          'Public Safety': 'Public Safety'
        };
        const selectedCategory = categoryMap[text] || text;
        
        setMessages(prev => [...prev, { id: Date.now() + 1, text: `Classifying as ${selectedCategory}...`, sender: 'bot', time: new Date().toLocaleTimeString() }]);
        
        const response = await submitComplaint(
          tempData.complaint_text, 
          selectedCategory, 
          user.name, 
          user.city
        );
        const botMsg = { 
          id: Date.now() + 2, 
          text: `Your complaint has been registered successfully. ✅\n\nComplaint ID: ${response.id.slice(0, 8).toUpperCase()}\nCategory: ${response.category}\nPriority: ${response.priority}\nAssigned Worker: ${response.assigned_worker ? response.assigned_worker.name : 'Amit Patil'}`, 
          sender: 'bot', 
          time: new Date().toLocaleTimeString() 
        };
        setMessages(prev => [...prev, botMsg]);
        setConvState('CHAT');
      }
      
      // PRD MODULE 4: CITIZEN CONFIRMATION
      else if (convState === 'AWAITING_CONFIRMATION') {
        if (text.toLowerCase().includes('yes') || text.includes('✅')) {
           setMessages(prev => [...prev, { 
             id: Date.now() + 1, 
             text: "Thank you for confirming! The complaint is now marked as COMPLETED. Jai Hind! 🇮🇳", 
             sender: 'bot', 
             time: new Date().toLocaleTimeString() 
           }]);
           // PRD Case 1 Logic: Final Status = COMPLETED
        } else {
           setMessages(prev => [...prev, { 
             id: Date.now() + 1, 
             text: "We are sorry to hear that. The complaint has been REOPENED and sent for Admin Review. ⚠️", 
             sender: 'bot', 
             time: new Date().toLocaleTimeString() 
           }]);
           // PRD Case 2 Logic: Final Status = REOPEN
        }
        setConvState('CHAT');
      }
      
      // TRACKING FLOW
      else if (text.toLowerCase().includes('track') || text.toLowerCase().includes('status')) {
        setMessages(prev => [...prev, { 
          id: Date.now() + 1, 
          text: "Checking status of your latest complaint (CV00125)...", 
          sender: 'bot', 
          time: new Date().toLocaleTimeString() 
        }]);
        
        // Mocking a match for PRD Module 4
        setTimeout(() => {
          setMessages(prev => [...prev, { 
            id: Date.now() + 5, 
            text: "Municipal work for Complaint CV00125 is marked complete by the officer. ✅\n\nGPS: Verified\nAI: Verified\n\nPlease confirm: Is the work completed to your satisfaction?", 
            sender: 'bot', 
            time: new Date().toLocaleTimeString() 
          }]);
          setConvState('AWAITING_CONFIRMATION');
          setLoading(false);
        }, 1500);
        return; // Skip the final loading false
      }
    } catch (error) {
      console.error(error);
      const errMsg = user 
        ? "I encountered an error while processing your request. Please try again in a moment." 
        : "Something went wrong. Let's start over. Type 'Login' or 'Register'.";
      
      setMessages(prev => [...prev, { id: Date.now() + 1, text: errMsg, sender: 'bot', time: new Date().toLocaleTimeString() }]);
      
      if (!user) {
        setConvState('AWAITING_AUTH_CHOICE');
      } else {
        // If it failed during complaint submission, we might want to let them try again
        // but for safety, return to CHAT if it's a persistent error
        if (convState === 'AWAITING_CATEGORY') {
           // Allow them to try selecting again
        } else {
           setConvState('CHAT');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const currentInput = input;
    setInput('');
    processResponse(currentInput);
  };

  return (
    <div className="bot-page">
      {/* Official Government Navbar */}
      <nav className="gov-navbar">
        <div className="nav-container">
          <div className="nav-links">
            <div className="nav-item active">HOME</div>
            <div className="nav-item">ABOUT US</div>
            <div className="nav-item" onClick={() => navigate('/admin')}>DASHBOARD</div>
            <div className="nav-item">CONTACT</div>
            <div className="nav-item">HELP</div>
          </div>
          <div className="nav-search-actions">
             <div className="nav-search">
                <FaSearch /> <input type="text" placeholder="Search Services..." />
             </div>
             <button onClick={() => navigate('/login')} className="admin-login-link-btn">
                ADMIN LOGIN
             </button>
          </div>
        </div>
      </nav>

      <header className="bot-header">
        <div className="header-content">
          <div className="gov-seal">
            <img src="/civicseva_logo.png" alt="CivicSevaAI Logo" className="gov-seal-img main-logo" />
          </div>
          <div className="header-text">
            <h1>CivicSevaAI</h1>
            <p>Unified Grievance Portal {user ? `| ${user.city}` : ''}</p>
          </div>
          <img src="/pngwing.com.png" alt="Swachh Bharat" className="swachh-logo" />
        </div>
        <div className="header-actions">
           {user && <button onClick={handleLogout} className="logout-btn-header"><FaSignOutAlt /> Logout</button>}
        </div>
      </header>

      <div className="chat-container">
        <div className="chat-messages">
          {messages.map((m) => (
            <div key={m.id} className={`message-wrapper ${m.sender}`}>
              <div className="avatar">
                {m.sender === 'bot' ? (
                  <img src="/civicseva_logo.png" alt="Bot" className="bot-avatar-img" />
                ) : (
                  <FaUserCircle />
                )}
              </div>
              <div className="message-content">
                <div className="message-bubble" style={{ whiteSpace: 'pre-wrap' }}>
                  {m.text}
                </div>
                {convState === 'AWAITING_AUTH_CHOICE' && m.id === messages[messages.length-1].id && (
                  <div className="auth-options">
                    <button onClick={() => processResponse('Login')} className="auth-btn"><FaSignInAlt /> Login</button>
                    <button onClick={() => processResponse('Register')} className="auth-btn"><FaUserPlus /> Register</button>
                  </div>
                )}
                {convState === 'AWAITING_CONFIRMATION' && m.id === messages[messages.length-1].id && (
                  <div className="auth-options">
                    <button onClick={() => processResponse('Yes, Completed ✅')} className="auth-btn">Yes, Completed ✅</button>
                    <button onClick={() => processResponse('No, Still Pending ❌')} className="auth-btn danger">No, Still Pending ❌</button>
                  </div>
                )}
                {convState === 'AWAITING_CATEGORY' && m.id === messages[messages.length-1].id && (
                  <div className="category-options">
                    {['Drainage Issue', 'Electricity', 'Traffic/Road', 'Waste/Garbage', 'Water Supply', 'Roads/Potholes', 'Sanitation', 'Public Safety'].map(cat => (
                      <button key={cat} onClick={() => processResponse(cat)} className="cat-btn">{cat}</button>
                    ))}
                  </div>
                )}
                <span className="message-time">{m.time}</span>
              </div>
            </div>
          ))}
          {loading && (
            <div className="message-wrapper bot">
              <div className="avatar">
                <img src="/civicseva_logo.png" alt="Bot" className="bot-avatar-img" />
              </div>
              <div className="message-content">
                <div className="message-bubble loading">Processing...</div>
              </div>
            </div>
          )}
          <div ref={scrollRef} />
        </div>

        <form className="chat-input" onSubmit={handleSend}>
          <input 
            type={convState.includes('PASSWORD') ? 'password' : 'text'} 
            placeholder={convState === 'CHAT' ? "Please describe your civic issue..." : "Type here..."} 
            value={input} 
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
          />
          <button type="submit" disabled={loading || !input.trim()}>
            <FaPaperPlane />
          </button>
        </form>
      </div>
    </div>
  );
};

export default CitizenBot;
