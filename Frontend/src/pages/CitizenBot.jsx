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
    if (messages.length > 1) return; // Prevent double greeting in dynamic re-renders
    
    if (savedUser && savedUser !== 'undefined') {
      try {
        const parsed = JSON.parse(savedUser);
        setUser(parsed);
        setConvState('AWAITING_AUTH_CHOICE'); 
        setMessages(prev => [...prev, { 
          id: Date.now(), 
          text: `Welcome back, ${parsed.name}! How would you like to proceed today?`, 
          sender: 'bot', 
          time: new Date().toLocaleTimeString() 
        }]);
      } catch (e) {
        console.error("Error parsing user", e);
      }
    } else {
      setMessages(prev => [...prev, { 
        id: Date.now(), 
        text: "Please select an option to continue:", 
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
        const input = text.toLowerCase();
        if (input.includes('status')) {
          const checkEmail = user ? user.email : null;
          if (checkEmail) {
            const res = await api.get(`/complaints/user-email/${encodeURIComponent(checkEmail.trim().toLowerCase())}`);
            const complaints = res.data;
            if (complaints.length === 0) {
              setMessages(prev => [...prev, { id: Date.now()+1, text: "No active grievances found for your account.", sender: 'bot', time: new Date().toLocaleTimeString() }]);
              setConvState('AWAITING_ISSUE_TYPE');
            } else {
              const c = complaints[0]; // Latest one
              setTempData(prev => ({ ...prev, current_complaint_id: c._id || c.id }));
              let msgText = `📋 Your Latest Grievance:\nRef ID: #${(c._id || c.id).slice(-6).toUpperCase()}\nStatus: ${c.status}\nCategory: ${c.category}\nPriority: ${c.priority}\nWorker: ${c.assigned_worker ? c.assigned_worker.name : 'Pending Assignment'}`;
              
              if (c.status === 'Resolved' && !c.rating) {
                setMessages(prev => [...prev, {
                  id: Date.now()+1,
                  text: msgText + `\n\n✅ Task marked Resolved by ${c.assigned_worker?.name || 'worker'}.\nProof image attached below.\n\nAre you satisfied?\nClick Yes to Close or No to Reopen.`,
                  image: (c.completion_image && c.completion_image !== 'repair_site.jpg') ? c.completion_image : null,
                  sender: 'bot',
                  time: new Date().toLocaleTimeString()
                }]);
                setConvState('AWAITING_CLOSURE_CONFIRM');
              } else {
                setMessages(prev => [...prev, {
                  id: Date.now()+1,
                  text: msgText + (c.rating ? `\n\n⭐ Your Rating: ${c.rating}/5` : "\n\nPlease wait for our worker to arrive at the site."),
                  image: (c.completion_image && c.completion_image !== 'repair_site.jpg') ? c.completion_image : null,
                  sender: 'bot',
                  time: new Date().toLocaleTimeString()
                }]);
                setConvState('AWAITING_ISSUE_TYPE');
              }
            }
          } else {
            setConvState('AWAITING_LOGIN_FOR_STATUS');
            setMessages(prev => [...prev, { id: Date.now()+1, text: "For security, please log in with your registered email to view your grievance history.", sender: 'bot', time: new Date().toLocaleTimeString() }]);
          }
        }
        else if (input.includes('report') || input.includes('issue')) {
          if (user) {
            setConvState('AWAITING_ISSUE_TYPE');
            setMessages(prev => [...prev, { id: Date.now()+1, text: "Please select the type of issue you'd like to report:", sender: 'bot', time: new Date().toLocaleTimeString() }]);
          } else {
            setConvState('AWAITING_REGISTER');
            setMessages(prev => [...prev, { id: Date.now()+1, text: "Please enter your name for guest registration.", sender: 'bot', time: new Date().toLocaleTimeString() }]);
          }
        }
        else if (input.includes('register')) {
          if (!user) {
            setConvState('AWAITING_REGISTER');
            setMessages(prev => [...prev, { id: Date.now()+1, text: "Please enter your full name for registration.", sender: 'bot', time: new Date().toLocaleTimeString() }]);
          }
        }
        else if (input.includes('log')) {
          if (!user) {
            setConvState('AWAITING_LOGIN');
            setMessages(prev => [...prev, { id: Date.now()+1, text: "Please enter your registered email.", sender: 'bot', time: new Date().toLocaleTimeString() }]);
          }
        }
      } 
      else if (convState === 'AWAITING_LOGIN_FOR_STATUS') {
        try {
          const loginResp = await login(text, '123');
          const loggedUser = loginResp.user;
          setUser(loggedUser);

          // Lookup complaints by email for accurate matching
          const res = await api.get(`/complaints/user-email/${encodeURIComponent(text.trim().toLowerCase())}`);
          const complaints = res.data;

          if (complaints.length === 0) {
            setMessages(prev => [...prev, { id: Date.now()+1, text: `Welcome ${loggedUser.name},\nYou have no active grievances recorded. Is there anything you'd like to report?`, sender: 'bot', time: new Date().toLocaleTimeString() }]);
            setConvState('AWAITING_ISSUE_TYPE');
          } else {
            const c = complaints[0];
            setTempData(prev => ({ ...prev, current_complaint_id: c._id || c.id }));

            let msgText = `Welcome back ${loggedUser.name} 👋\n\n📋 Latest Grievance:\nRef ID: #${(c._id || c.id).slice(-6).toUpperCase()}\nStatus: ${c.status}\nCategory: ${c.category}\nPriority: ${c.priority}\nWorker: ${c.assigned_worker ? c.assigned_worker.name : 'Pending Assignment'}`;

            if (c.status === 'Resolved') {
              if (!c.rating) {
                setMessages(prev => [...prev, {
                  id: Date.now()+1,
                  text: msgText + `\n\n✅ Task marked Resolved by ${c.assigned_worker?.name || 'worker'}.\nProof image attached below.\n\nAre you satisfied with the work done?\nClick Yes to Close or No to Reopen.`,
                  image: (c.completion_image && c.completion_image !== 'repair_site.jpg') ? c.completion_image : null,
                  sender: 'bot',
                  time: new Date().toLocaleTimeString()
                }]);
                setConvState('AWAITING_CLOSURE_CONFIRM');
              } else {
                setMessages(prev => [...prev, {
                  id: Date.now()+1,
                  text: msgText + `\n\n⭐ You rated this: ${c.rating}/5\n\nThank you for your feedback! Is there anything else?`,
                  image: (c.completion_image && c.completion_image !== 'repair_site.jpg') ? c.completion_image : null,
                  sender: 'bot',
                  time: new Date().toLocaleTimeString()
                }]);
                setConvState('AWAITING_ISSUE_TYPE');
              }
            } else {
              setMessages(prev => [...prev, {
                id: Date.now()+1,
                text: msgText + `\n\n⏳ Your grievance is currently ${c.status}. Our field operative will resolve it shortly.\n\nWould you like to report another issue?`,
                sender: 'bot',
                time: new Date().toLocaleTimeString()
              }]);
              setConvState('AWAITING_ISSUE_TYPE');
            }
          }
        } catch (e) {
          console.error(e);
          setMessages(prev => [...prev, { id: Date.now()+1, text: `Login failed. Please check your email and try again.`, sender: 'bot', time: new Date().toLocaleTimeString() }]);
        }
      }
      else if (convState === 'AWAITING_LOGIN') {
        const userData = await login(text, '123');
        setUser(userData.user);
        setMessages(prev => [...prev, { id: Date.now()+1, text: `Authenticated as ${userData.user.name}.\n\nPlease select the type of issue you want to report:`, sender: 'bot', time: new Date().toLocaleTimeString() }]);
        setConvState('AWAITING_ISSUE_TYPE');
      }
      else if (convState === 'AWAITING_REGISTER') {
          // Step 1: Got the name, now ask for email
          setTempData(prev => ({ ...prev, reg_name: text }));
          setMessages(prev => [...prev, { id: Date.now()+1, text: `Nice to meet you, ${text}! Please enter your email address to complete registration.`, sender: 'bot', time: new Date().toLocaleTimeString() }]);
          setConvState('AWAITING_REGISTER_EMAIL');
      }
      else if (convState === 'AWAITING_REGISTER_EMAIL') {
          // Step 2: Got the email, register the user then auto-login
          const regEmail = text.trim().toLowerCase();
          const regName = tempData.reg_name || regEmail;
          try {
            await register({ name: regName, email: regEmail, password: '123', city: 'Mumbai', phone: '0000000000' });
          } catch (regErr) {
            // If already registered (400), just proceed to login silently
            const status = regErr?.response?.status;
            if (status !== 400) throw regErr; // re-throw unexpected errors
          }
          // Auto-login after register (or if already existed)
          const loginResp = await login(regEmail, '123');
          const newUser = loginResp.user;
          setUser(newUser);
          localStorage.setItem('user', JSON.stringify(newUser));
          setMessages(prev => [...prev, { id: Date.now()+1, text: `Welcome back ${newUser.name}! 🎉\n\nPlease select the type of issue you want to report:`, sender: 'bot', time: new Date().toLocaleTimeString() }]);
          setConvState('AWAITING_ISSUE_TYPE');
      }
      else if (convState === 'AWAITING_ISSUE_TYPE') {
        // Citizen selected a category from buttons or typed one
        setTempData(prev => ({ ...prev, selected_category: text }));
        setMessages(prev => [...prev, { id: Date.now()+1, text: `You selected: ${text}\n\nPlease describe the issue in detail (location, severity, etc.):`, sender: 'bot', time: new Date().toLocaleTimeString() }]);
        setConvState('CHAT');
      }
      else if (convState === 'CHAT') {
        // Use the pre-selected category if available, otherwise let AI predict
        const selectedCategory = tempData.selected_category || null;
        const pred = await predictCategory(text);
        const finalCategory = selectedCategory || pred.category;
        setTempData(prev => ({ ...prev, complaint_text: text, pred_category: finalCategory, pred_priority: pred.priority }));
        setMessages(prev => [...prev, { 
          id: Date.now()+1, 
          text: `📋 Assessment Overview:\nCategory: ${finalCategory}\nPriority: ${pred.priority}\n\nShall I proceed with submitting this request?`, 
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
      console.error(e);
      let errorMsg = "Technical error. Try again later.";
      
      if (e.response?.status === 422) {
        errorMsg = "Invalid input format. Please check your email or data and try again.";
      } else if (e.response?.data?.detail) {
        errorMsg = e.response.data.detail;
      }
      
      setMessages(prev => [...prev, { id: Date.now()+1, text: errorMsg, sender: 'bot', time: new Date().toLocaleTimeString() }]);
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
                                {user ? (
                                    <>
                                        <button onClick={() => processResponse('Report New Issue')} className="opt-btn">Report New Issue</button>
                                        <button onClick={() => processResponse('Check Status')} className="opt-btn">Check Status</button>
                                        <button onClick={handleLogout} className="opt-btn deny">Log Out</button>
                                    </>
                                ) : (
                                    <>
                                        <button onClick={() => processResponse('Log In')} className="opt-btn">Log In</button>
                                        <button onClick={() => processResponse('Register')} className="opt-btn">Register</button>
                                        <button onClick={() => processResponse('Check Status')} className="opt-btn">Check Status</button>
                                    </>
                                )}
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
                        {(convState === 'AWAITING_ISSUE_TYPE' || convState === 'AWAITING_CATEGORY') && (
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
          {loading && <div className="typing-indicator">Municipal Assistant is searching...</div>}
          <div ref={scrollRef} />
        </div>

        <div className="chat-input shadow-lg">
          <input 
            type="text" 
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
