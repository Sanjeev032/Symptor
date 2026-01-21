import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useVisualization } from '../../context/VisualizationContext';
import { MessageCircle, Send, Bot, Minimize2 } from 'lucide-react';

const SYMPTOM_MAP = {
    'head': ['head'],
    'brain': ['brain'],
    'headache': ['head'],
    'migraine': ['head'],
    'dizzy': ['head'],
    'chest': ['chest'],
    'heart': ['heart'],
    'palpitations': ['heart'],
    'lung': ['l_lung', 'r_lung'],
    'breath': ['l_lung', 'r_lung'],
    'cough': ['l_lung', 'r_lung'],
    'stomach': ['stomach'],
    'tummy': ['stomach'],
    'belly': ['stomach'],
    'abdomen': ['abdomen'],
    'gut': ['intestines'],
    'bowel': ['intestines'],
    'liver': ['liver'],
    'back': ['spine'],
    'spine': ['spine'],
    'arm': ['arm'],
    'hand': ['arm'],
    'shoulder': ['arm'],
    'leg': ['leg'],
    'foot': ['leg'],
    'knee': ['leg'],
    'toes': ['leg'],
    'skin': ['skin'],
    'rash': ['skin'],
    'itch': ['skin'],
    'burn': ['skin']
};

const ChatWidget = () => {
    const { token, user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    // Load History
    useEffect(() => {
        if (isOpen && token && messages.length === 0) {
            fetch(`${import.meta.env.VITE_API_URL}/api/chat/history`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
                .then(res => res.json())
                .then(data => {
                    if (Array.isArray(data)) setMessages(data);
                })
                .catch(err => console.error("Chat Error:", err));
        }
    }, [isOpen, token, messages.length]);

    // Auto Scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const { highlightOrgans } = useVisualization();

    // ... (rest of state)

    const handleSend = async (e) => {
        e.preventDefault();
        if (!inputText.trim()) return;

        const text = inputText.toLowerCase();
        setInputText('');

        // Symptom/Body Part Detection Logic
        // Symptom/Body Part Detection Logic
        const foundOrgans = new Set();
        Object.keys(SYMPTOM_MAP).forEach(key => {
            if (text.includes(key)) {
                SYMPTOM_MAP[key].forEach(id => foundOrgans.add(id));
            }
        });

        if (foundOrgans.size > 0) {
            highlightOrgans(Array.from(foundOrgans));
        }

        // Optimistic UI Update
        const tempMsg = { sender: 'user', text: inputText, timestamp: new Date() };
        setMessages(prev => [...prev, tempMsg]);
        setLoading(true);

        try {
            console.log("ChatWidget: Sending message...", inputText);
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/chat/message`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ message: inputText })
            });
            const data = await res.json();
            console.log("ChatWidget: Server response:", data);

            // Limit message list or just replace with server state
            // For smoother UX, we just append the BOT's response from the server state
            if (data.messages) {
                console.log("ChatWidget: Updating messages from server:", data.messages);
                setMessages(data.messages);
            } else {
                console.warn("ChatWidget: No messages in server response!", data);
            }
        } catch (err) {
            console.error(err);
            setMessages(prev => [...prev, { sender: 'bot', text: 'Error connecting to server. Please try again.', timestamp: new Date() }]);
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null; // Don't show for unauthenticated users

    return (
        <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 1000, fontFamily: 'sans-serif' }}>

            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    style={{
                        background: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '50%',
                        width: '60px',
                        height: '60px',
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'transform 0.2s'
                    }}
                    onMouseOver={e => e.currentTarget.style.transform = 'scale(1.1)'}
                    onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                >
                    <MessageCircle size={32} />
                </button>
            )}

            {isOpen && (
                <div style={{
                    width: '350px',
                    height: '500px',
                    background: '#1e293b',
                    borderRadius: '16px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    border: '1px solid #334155'
                }}>
                    {/* Header */}
                    <div style={{
                        padding: '16px',
                        background: '#0f172a',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        borderBottom: '1px solid #334155'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'white' }}>
                            <Bot size={20} color="#38bdf8" />
                            <h3 style={{ margin: 0, fontSize: '1rem' }}>Medical Assistant</h3>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                        >
                            <Minimize2 size={20} />
                        </button>
                    </div>

                    {/* Chat Area */}
                    <div style={{
                        flex: 1,
                        padding: '16px',
                        overflowY: 'auto',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px'
                    }}>
                        {messages.length === 0 && (
                            <div style={{ textAlign: 'center', color: '#64748b', marginTop: '50px', fontSize: '0.9rem' }}>
                                <Bot size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                                <p>Hello! I can help you understand your symptoms.</p>
                                <p style={{ fontSize: '0.8rem' }}>Try saying: "I have a headache"</p>
                            </div>
                        )}

                        {messages.map((msg, idx) => (
                            <div key={idx} style={{
                                alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                                maxWidth: '80%',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start'
                            }}>
                                <div style={{
                                    background: msg.sender === 'user' ? '#3b82f6' : '#334155',
                                    color: 'white',
                                    padding: '10px 14px',
                                    borderRadius: '12px',
                                    borderBottomRightRadius: msg.sender === 'user' ? '2px' : '12px',
                                    borderBottomLeftRadius: msg.sender === 'bot' ? '2px' : '12px',
                                    fontSize: '0.9rem',
                                    lineHeight: '1.4'
                                }}>
                                    {msg.text.split('\n').map((line, i) => (
                                        <p key={i} style={{ margin: 0 }}>{line}</p>
                                    ))}
                                </div>
                                <span style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '4px' }}>
                                    {msg.sender === 'bot' ? 'Assistant' : 'You'}
                                </span>
                            </div>
                        ))}
                        {loading && (
                            <div style={{ alignSelf: 'flex-start', background: '#334155', padding: '10px', borderRadius: '12px', color: '#94a3b8', fontSize: '0.8rem' }}>
                                Typing...
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <form onSubmit={handleSend} style={{
                        padding: '12px',
                        background: '#0f172a',
                        borderTop: '1px solid #334155',
                        display: 'flex',
                        gap: '8px'
                    }}>
                        <input
                            type="text"
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            placeholder="Type a message..."
                            style={{
                                flex: 1,
                                background: '#1e293b',
                                border: '1px solid #334155',
                                borderRadius: '8px',
                                padding: '10px',
                                color: 'white',
                                outline: 'none'
                            }}
                        />
                        <button
                            type="submit"
                            disabled={!inputText.trim() || loading}
                            style={{
                                background: '#38bdf8',
                                border: 'none',
                                borderRadius: '8px',
                                width: '40px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#0f172a',
                                opacity: (!inputText.trim() || loading) ? 0.5 : 1
                            }}
                        >
                            <Send size={18} />
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default ChatWidget;
