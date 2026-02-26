import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../AuthContext';
import { messageAPI } from '../api';

export default function MessagesPage() {
  const { user } = useAuth();
  const [threads, setThreads] = useState([]);
  const [activeThread, setActiveThread] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const [msgLoading, setMsgLoading] = useState(false);
  const [error, setError] = useState('');
  const [showNewThread, setShowNewThread] = useState(false);
  const [newThread, setNewThread] = useState({ participantId: '', bookingId: '' });
  const messagesEndRef = useRef(null);

  useEffect(() => { loadThreads(); }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadThreads = async () => {
    setLoading(true);
    try {
      const res = await messageAPI.getMyThreads();
      setThreads(res.data.data || []);
    } catch { /* non-critical */ }
    finally { setLoading(false); }
  };

  const loadMessages = async (threadId) => {
    setMsgLoading(true);
    try {
      const res = await messageAPI.getMessages(threadId);
      setMessages(res.data.data || []);
    } catch { setMessages([]); }
    finally { setMsgLoading(false); }
  };

  const handleSelectThread = (thread) => {
    setActiveThread(thread);
    loadMessages(thread.threadId || thread.id);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMsg.trim() || !activeThread) return;
    try {
      await messageAPI.sendMessage({
        threadId: activeThread.threadId || activeThread.id,
        messageText: newMsg,
      });
      setNewMsg('');
      loadMessages(activeThread.threadId || activeThread.id);
    } catch (err) { setError(err.response?.data?.message || 'Failed to send.'); }
  };

  const handleCreateThread = async (e) => {
    e.preventDefault(); setError('');
    try {
      await messageAPI.createThread({
        participant2Id: newThread.participantId,
        bookingId: newThread.bookingId || null,
      });
      setShowNewThread(false);
      setNewThread({ participantId: '', bookingId: '' });
      loadThreads();
    } catch (err) { setError(err.response?.data?.message || 'Failed to create thread.'); }
  };

  const getOtherParticipant = (thread) => {
    const myId = user?.userId || user?.id;
    if (thread.participant1Id === myId) return thread.participant2Email || `User #${thread.participant2Id}`;
    return thread.participant1Email || `User #${thread.participant1Id}`;
  };

  return (
    <div className="fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Messages</h1>
          <p className="text-sm text-slate-500">Chat with workers, customers, and suppliers</p>
        </div>
        <button onClick={() => setShowNewThread(true)}
          className="h-10 px-5 rounded-xl bg-[#13ecec] text-slate-900 font-bold text-sm hover:bg-[#0ea5a5] transition-colors flex items-center gap-2">
          <span className="material-symbols-outlined text-lg">edit</span> New Chat
        </button>
      </div>

      {error && <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>}

      {/* New Thread Modal */}
      {showNewThread && (
        <div className="fixed inset-0 bg-black/40 z-[1000] flex items-center justify-center p-4" onClick={() => setShowNewThread(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-900">Start New Chat</h3>
              <button onClick={() => setShowNewThread(false)} className="p-1 rounded-lg hover:bg-slate-100">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleCreateThread} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">User ID</label>
                <input type="number" required value={newThread.participantId} onChange={e => setNewThread({ ...newThread, participantId: e.target.value })}
                  placeholder="Enter user ID"
                  className="w-full h-11 px-4 rounded-xl border border-slate-200 text-sm focus:border-[#13ecec] outline-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Booking ID (optional)</label>
                <input type="number" value={newThread.bookingId} onChange={e => setNewThread({ ...newThread, bookingId: e.target.value })}
                  className="w-full h-11 px-4 rounded-xl border border-slate-200 text-sm focus:border-[#13ecec] outline-none" />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowNewThread(false)} className="flex-1 h-11 rounded-xl border border-slate-200 text-slate-700 font-semibold text-sm">Cancel</button>
                <button type="submit" className="flex-1 h-11 rounded-xl bg-[#13ecec] text-slate-900 font-bold text-sm hover:bg-[#0ea5a5]">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Chat Layout */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden" style={{ height: 'calc(100vh - 240px)', minHeight: 400 }}>
        <div className="flex h-full">
          {/* Thread List */}
          <div className="w-72 flex-shrink-0 border-r border-slate-200 flex flex-col">
            <div className="p-3 border-b border-slate-100">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
                <input placeholder="Search conversations..." className="w-full h-9 pl-10 pr-3 rounded-lg border border-slate-200 text-sm focus:border-[#13ecec] outline-none" />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex justify-center py-8"><span className="spinner" /></div>
              ) : threads.length === 0 ? (
                <div className="p-6 text-center text-sm text-slate-500">No conversations yet</div>
              ) : (
                threads.map(thread => {
                  const isActive = (activeThread?.threadId || activeThread?.id) === (thread.threadId || thread.id);
                  return (
                    <button
                      key={thread.threadId || thread.id}
                      onClick={() => handleSelectThread(thread)}
                      className={`w-full text-left px-4 py-3 border-b border-slate-50 hover:bg-slate-50 transition-colors ${isActive ? 'bg-[#13ecec]/5 border-l-2 border-l-[#13ecec]' : ''
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#13ecec] to-[#0ea5a5] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {getOtherParticipant(thread)[0]?.toUpperCase() || '?'}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-slate-900 truncate">{getOtherParticipant(thread)}</p>
                          <p className="text-xs text-slate-400 truncate">
                            {thread.lastMessageAt ? new Date(thread.lastMessageAt).toLocaleDateString() : 'No messages'}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            {!activeThread ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <span className="material-symbols-outlined text-6xl text-slate-200 mb-3">chat</span>
                  <p className="text-slate-500 text-sm">Select a conversation to start chatting</p>
                </div>
              </div>
            ) : (
              <>
                {/* Chat Header */}
                <div className="px-5 py-3 border-b border-slate-100 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#13ecec] to-[#0ea5a5] flex items-center justify-center text-white text-xs font-bold">
                    {getOtherParticipant(activeThread)[0]?.toUpperCase() || '?'}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{getOtherParticipant(activeThread)}</p>
                    {activeThread.bookingId && <p className="text-xs text-slate-400">Booking #{activeThread.bookingId}</p>}
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-5 space-y-3">
                  {msgLoading ? (
                    <div className="flex justify-center py-8"><span className="spinner" /></div>
                  ) : messages.length === 0 ? (
                    <div className="text-center text-sm text-slate-400 py-8">No messages yet. Start the conversation!</div>
                  ) : (
                    messages.map(msg => {
                      const isMe = msg.senderId === (user?.userId || user?.id);
                      return (
                        <div key={msg.messageId || msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm ${isMe
                              ? 'bg-[#13ecec] text-slate-900 rounded-br-md'
                              : 'bg-slate-100 text-slate-700 rounded-bl-md'
                            }`}>
                            <p>{msg.messageText}</p>
                            <p className={`text-[10px] mt-1 ${isMe ? 'text-slate-700/60' : 'text-slate-400'}`}>
                              {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <form onSubmit={handleSend} className="p-3 border-t border-slate-100 flex gap-2">
                  <input
                    value={newMsg} onChange={e => setNewMsg(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 h-10 px-4 rounded-xl border border-slate-200 text-sm focus:border-[#13ecec] outline-none"
                  />
                  <button type="submit" disabled={!newMsg.trim()}
                    className="h-10 px-4 rounded-xl bg-[#13ecec] text-slate-900 font-bold text-sm hover:bg-[#0ea5a5] transition-colors disabled:opacity-50 flex items-center gap-1">
                    <span className="material-symbols-outlined text-lg">send</span>
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
