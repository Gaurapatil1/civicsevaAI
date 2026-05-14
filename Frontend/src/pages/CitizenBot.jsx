import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { submitComplaint, login, register, predictCategory } from '../services/api';
import './CitizenBot.css';
import { FiSend, FiUser, FiInfo, FiCheckCircle, FiShield, FiLogOut } from 'react-icons/fi';

const CitizenBot = () => {
  const [messages, setMessages] = useState([
    { id: 1, text: "Jai Hind! I am your AI Municipal Assistant. How can I serve you today?", sender: 'bot', time: new Date().toLocaleTimeString() }
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [convState, setConvState] = useState('AWAITING_AUTH_CHOICE'); 
  const [tempData, setTempData] = useState({});
  const navigate = useNavigate();
  const scrollRef = useRef(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser && savedUser !== 'undefined') {
      try {
        const parsed = JSON.parse(savedUser);
        setUser(parsed);
        setConvState('CHAT');
        setMessages(prev => [...prev, { id: Date.now(), text: `Welcome back, ${parsed.name}. Please describe the municipal issue you'd like to report.`, sender: 'bot', time: new Date().toLocaleTimeString() }]);
      } catch (e) {
        console.error("Error parsing user", e);
      }
    } else {
      setMessages(prev => [...prev, { 
        id: Date.now(), 
        text: "To provide personalized assistance, would you like to Log In or Register as a guest?", 
        sender: 'bot', 
        time: new Date().toLocaleTimeString() 
      }]);
    }
  }, []);

  useEffect(() => {
    let intervalId;
    if (convState === 'AWAITING_WORKER_RESOLUTION' && tempData.current_complaint_id) {
      intervalId = setInterval(async () => {
         try {
           const res = await api.get(`/complaints/${tempData.current_complaint_id}`);
           if (res.data && res.data.status === 'Resolved') {
             clearInterval(intervalId);
             setMessages(prev => [...prev, {
                id: Date.now()+40,
                text: `✅ Resolution Verified. GPS data: ${res.data.gps_coordinates}\n\nAre you satisfied with the work? Please reply 'Yes' to Close or 'No' to Reopen for Admin Review.`,
                image: res.data.completion_image,
                sender: 'bot',
                time: new Date().toLocaleTimeString()
             }]);
             setConvState('AWAITING_CLOSURE_CONFIRM');
           }
         } catch(e) {
           console.error("Polling error", e);
         }
      }, 5000);
    }
    return () => clearInterval(intervalId);
  }, [convState, tempData.current_complaint_id]);

  const finalizeSubmission = async (response) => {
    const cid = response.id;
    setTempData({ ...tempData, current_complaint_id: cid });
    setMessages(prev => [...prev, { 
      id: Date.now()+2, 
      text: `Your grievance has been officially registered.\n\n📄 Ref ID: ${cid.slice(-6).toUpperCase()}\n👷 Assigned Operative: ${response.assigned_worker ? response.assigned_worker.name : 'System Allocation Pending'}\n⚠️ Priority Level: ${response.priority}\n\nWait here! We will notify you once the worker updates the status.`, 
      sender: 'bot', 
      time: new Date().toLocaleTimeString() 
    }]);
    setConvState('AWAITING_WORKER_RESOLUTION');
  };

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
    setConvState('AWAITING_AUTH_CHOICE');
    setMessages([{ id: Date.now(), text: "You have been logged out. How can I help you today?", sender: 'bot', time: new Date().toLocaleTimeString() }]);
  };

  const categories = ["Water Supply", "Electricity", "Waste Management", "Roads", "Drainage", "Traffic", "Public Safety"];

  const processResponse = async (text) => {
    if (!text.trim()) return;
    
    setMessages(prev => [...prev, { id: Date.now(), text, sender: 'user', time: new Date().toLocaleTimeString() }]);
    setInputText('');
    setLoading(true);

    try {
      if (convState === 'AWAITING_AUTH_CHOICE') {
        if (text.toLowerCase().includes('log')) {
          setConvState('AWAITING_LOGIN');
          setMessages(prev => [...prev, { id: Date.now()+1, text: "Please enter your registered email.", sender: 'bot', time: new Date().toLocaleTimeString() }]);
        } else {
          setConvState('AWAITING_REGISTER');
          setMessages(prev => [...prev, { id: Date.now()+1, text: "Please enter your name for guest registration.", sender: 'bot', time: new Date().toLocaleTimeString() }]);
        }
      } 
      else if (convState === 'AWAITING_LOGIN') {
        const userData = await login(text, '123');
        setUser(userData);
        setMessages(prev => [...prev, { id: Date.now()+1, text: `Authenticated as ${userData.name}. Please describe the municipal issue.`, sender: 'bot', time: new Date().toLocaleTimeString() }]);
        setConvState('CHAT');
      }
      else if (convState === 'AWAITING_REGISTER') {
          const userData = await register(text, text, '123', 'Mumbai');
          setUser(userData);
          setMessages(prev => [...prev, { id: Date.now()+1, text: `Welcome ${userData.name}. What municipal issue can I help with?`, sender: 'bot', time: new Date().toLocaleTimeString() }]);
          setConvState('CHAT');
      }
      else if (convState === 'CHAT') {
        const pred = await predictCategory(text);
        setTempData({ ...tempData, complaint_text: text, pred_category: pred.category, pred_priority: pred.priority });
        setMessages(prev => [...prev, { 
          id: Date.now()+1, 
          text: `📊 AI Prediction:\nCategory: ${pred.category}\nPriority: ${pred.priority}\n\nIs this correct?`, 
          sender: 'bot', 
          time: new Date().toLocaleTimeString() 
        }]);
        setConvState('AWAITING_PREDICTION_CONFIRM');
      }
      else if (convState === 'AWAITING_PREDICTION_CONFIRM') {
        if (text.toLowerCase() === 'yes') {
            const response = await submitComplaint(tempData.complaint_text, tempData.pred_category, user.name, user.city);
            await finalizeSubmission(response);
        } else {
            setMessages(prev => [...prev, { id: Date.now()+1, text: "Please select the correct category:", sender: 'bot', time: new Date().toLocaleTimeString() }]);
            setConvState('AWAITING_CATEGORY');
        }
      }
      else if (convState === 'AWAITING_CATEGORY') {
        const response = await submitComplaint(tempData.complaint_text, text, user.name, user.city);
        await finalizeSubmission(response);
      }
      else if (convState === 'AWAITING_CLOSURE_CONFIRM') {
          if (text.toLowerCase() === 'yes') {
              setMessages(prev => [...prev, { id: Date.now()+1, text: "Excellent. Please rate your experience (1-5).", sender: 'bot', time: new Date().toLocaleTimeString() }]);
              setConvState('AWAITING_RATING');
          } else {
              setMessages(prev => [...prev, { id: Date.now()+1, text: "Task reopened for Admin Review.", sender: 'bot', time: new Date().toLocaleTimeString() }]);
              setConvState('CHAT');
          }
      }
      else if (convState === 'AWAITING_RATING') {
        await api.post(`/complaints/${tempData.current_complaint_id}/feedback`, { rating: parseInt(text), feedback: "Bot feedback" });
        setMessages(prev => [...prev, { id: Date.now()+2, text: "Thank you! Jai Hind! 🇮🇳", sender: 'bot', time: new Date().toLocaleTimeString() }]);
        setConvState('CHAT');
      }
    } catch (e) {
      setMessages(prev => [...prev, { id: Date.now()+1, text: "Technical error. Try again later.", sender: 'bot', time: new Date().toLocaleTimeString() }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bot-page">
      <header className="bot-header">
        <div className="header-content">
          <img src="/emblem.png" alt="Gov" className="gov-seal-img" />
          <div className="header-text">
            <h1>CivicSevaAI</h1>
            <p>Government of India • Municipal Assistant</p>
          </div>
        </div>
        <div className="header-logos">
           <img src="/swachh_bharat.png" alt="Swachh" className="swachh-logo" />
           {user && <button onClick={handleLogout} className="logout-btn"><FiLogOut /></button>}
        </div>
      </header>

      <div className="chat-container">
        <div className="chat-messages">
          {messages.map((m, i) => (
            <div key={m.id} className={`message-wrapper ${m.sender}`}>
              <div className="avatar">
                {m.sender === 'bot' ? <img src="/civicseva_logo.png" style={{width: '24px'}} /> : <FiUser />}
              </div>
              <div className="message-content">
                <div className="message-bubble">
                  {m.text.split('\n').map((line, idx) => <p key={idx} style={{margin: 0}}>{line}</p>)}
                  {m.image && m.image !== "repair_site.jpg" && (
                    <img src={m.image} alt="Proof" style={{marginTop:'10px', maxWidth:'100%', borderRadius:'8px'}}/>
                  )}
                </div>
                {/* INTERACTIVE BUTTONS */}
                {i === messages.length - 1 && !loading && (
                    <div className="interactive-options">
                        {convState === 'AWAITING_AUTH_CHOICE' && (
                            <div className="btn-group">
                                <button onClick={() => processResponse('Log In')} className="opt-btn">Log In</button>
                                <button onClick={() => processResponse('Register')} className="opt-btn">Register</button>
                            </div>
                        )}
                        {convState === 'AWAITING_PREDICTION_CONFIRM' && (
                            <div className="btn-group">
                                <button onClick={() => processResponse('Yes')} className="opt-btn confirm">Correct</button>
                                <button onClick={() => processResponse('No')} className="opt-btn deny">Change</button>
                            </div>
                        )}
                        {convState === 'AWAITING_CLOSURE_CONFIRM' && (
                            <div className="btn-group">
                                <button onClick={() => processResponse('Yes')} className="opt-btn confirm">Yes, Close</button>
                                <button onClick={() => processResponse('No')} className="opt-btn deny">No, Reopen</button>
                            </div>
                        )}
                        {convState === 'AWAITING_CATEGORY' && (
                            <div className="category-options">
                                {categories.map(c => <button key={c} onClick={() => processResponse(c)} className="cat-btn">{c}</button>)}
                            </div>
                        )}
                        {convState === 'AWAITING_RATING' && (
                            <div className="rating-options">
                                {[1,2,3,4,5].map(n => <button key={n} onClick={() => processResponse(n.toString())} className="rate-btn">{n}★</button>)}
                            </div>
                        )}
                    </div>
                )}
                <span className="message-time">{m.time}</span>
              </div>
            </div>
          ))}
          {loading && <div className="typing-indicator">AI Assistant is thinking...</div>}
          <div ref={scrollRef} />
        </div>

        <div className="chat-input shadow-lg">
          <input 
            type="text" 
            placeholder="Describe your issue..." 
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && processResponse(inputText)}
            disabled={loading}
          />
          <button onClick={() => processResponse(inputText)} disabled={loading}>
            <FiSend />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CitizenBot;
