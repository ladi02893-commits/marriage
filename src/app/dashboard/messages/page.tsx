'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  MessageSquare,
  Send,
  ShieldCheck,
  Phone,
  Video,
  Info,
  Sparkles,
  Lock,
  MoreVertical,
  Check,
  CheckCheck,
  Smile,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';

export default function MessagesChatPage() {
  const { conversations, messages, currentUser, currentProfile, sendMessage } = useAuth();

  const userConversations = conversations.filter(
    (c) =>
      c.participantAId === currentUser?.id ||
      c.participantBId === currentUser?.id ||
      (currentProfile && (c.participantAId === currentProfile.id || c.participantBId === currentProfile.id)) ||
      (currentProfile && (c.participantAId === currentProfile.userId || c.participantBId === currentProfile.userId))
  );

  const [selectedConvId, setSelectedConvId] = useState<string>('');
  const [inputText, setInputText] = useState('');

  const activeConv = userConversations.find((c) => c.id === (selectedConvId || userConversations[0]?.id)) || userConversations[0];
  const activeConvId = activeConv?.id || '';
  const activeMessages = activeConvId ? messages[activeConvId] || [] : [];

  const otherPersonName =
    activeConv?.participantAId === currentUser?.id || (currentProfile && activeConv?.participantAId === currentProfile.userId)
      ? activeConv?.participantBName
      : activeConv?.participantAName;

  const otherPersonPhoto =
    activeConv?.participantAId === currentUser?.id || (currentProfile && activeConv?.participantAId === currentProfile.userId)
      ? activeConv?.participantBPhoto
      : activeConv?.participantAPhoto;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeConvId) return;

    sendMessage(activeConvId, inputText);
    setInputText('');
  };

  const QUICK_REPLIES = [
    'Walaikum Assalam! Thank you for your warm message.',
    'I would be happy to coordinate a family introduction call.',
    'Could you share a bit more about your career goals and location preference?',
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold font-serif text-foreground">Secure Matrimonial Messages</h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Respectful, private communication between verified matches with mutual connection approval.
        </p>
      </div>

      {/* Main Chat Container */}
      <div className="h-[650px] rounded-3xl border border-border bg-card shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-12">
        {/* Left Sidebar: Conversations List */}
        <div className="md:col-span-4 border-r border-border flex flex-col h-full bg-muted/20">
          <div className="p-4 border-b border-border">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Direct Conversations ({userConversations.length})
            </h3>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-border/60">
            {userConversations.length === 0 ? (
              <div className="p-6 text-center text-xs text-muted-foreground">
                No active conversations. Accept a connection interest to begin chatting.
              </div>
            ) : (
              userConversations.map((conv) => {
                const name =
                  conv.participantAId === currentUser?.id || (currentProfile && conv.participantAId === currentProfile.userId)
                    ? conv.participantBName
                    : conv.participantAName;
                const photo =
                  conv.participantAId === currentUser?.id || (currentProfile && conv.participantAId === currentProfile.userId)
                    ? conv.participantBPhoto
                    : conv.participantAPhoto;
                const isSelected = conv.id === activeConvId;

                return (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedConvId(conv.id)}
                    className={`flex w-full items-center gap-3 p-4 text-left transition ${
                      isSelected
                        ? 'bg-white font-semibold text-foreground shadow-sm dark:bg-card'
                        : 'hover:bg-muted/60 text-muted-foreground'
                    }`}
                  >
                    <img
                      src={
                        photo ||
                        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200'
                      }
                      alt={name}
                      className="h-12 w-12 rounded-2xl object-cover ring-2 ring-brand-500/20 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-foreground truncate">{name}</span>
                        <span className="text-[10px] text-muted-foreground">{conv.lastMessageTime}</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                        {conv.lastMessageText}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Pane: Active Chat Window */}
        <div className="md:col-span-8 flex flex-col h-full bg-card">
          {activeConv ? (
            <>
              {/* Chat Header */}
              <div className="flex items-center justify-between border-b border-border p-4 bg-muted/10">
                <div className="flex items-center gap-3">
                  <img
                    src={
                      otherPersonPhoto ||
                      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200'
                    }
                    alt={otherPersonName}
                    className="h-10 w-10 rounded-2xl object-cover ring-1 ring-brand-500/20"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-sm font-bold text-foreground">{otherPersonName}</h3>
                      <ShieldCheck className="h-4 w-4 text-blue-600" />
                    </div>
                    <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Online for Matrimonial Inquiry
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toast.info('Video introduction sessions are coordinated via Concierge Desk.')}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground hover:text-brand-600"
                  >
                    <Video className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => toast.info('Encrypted Voice Call connecting...')}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground hover:text-brand-600"
                  >
                    <Phone className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Message Feed Area */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-gradient-to-b from-transparent to-muted/10">
                {/* Privacy Banner inside chat */}
                <div className="rounded-2xl border border-brand-100 bg-brand-50/60 p-3 text-center text-[11px] text-brand-900 dark:border-brand-950 dark:bg-brand-950/30 dark:text-brand-200">
                  🔒 <strong>TRUEPAIR Family Shield:</strong> For your personal safety, never disclose sensitive financial passwords or bank transfer coordinates in private chat.
                </div>

                {activeMessages.map((msg) => {
                  const isMe = msg.senderId === currentUser?.id;
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-[75%] rounded-3xl px-4 py-3 text-xs leading-relaxed shadow-sm ${
                          isMe
                            ? 'bg-gradient-to-r from-brand-600 to-rose-600 text-white rounded-br-none'
                            : 'bg-muted text-foreground rounded-bl-none border border-border'
                        }`}
                      >
                        {msg.text}
                      </div>
                      <div className="flex items-center gap-1 mt-1 text-[10px] text-muted-foreground px-1">
                        <span>{msg.timestamp}</span>
                        {isMe && <CheckCheck className="h-3 w-3 text-brand-600" />}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Quick Reply Prompts Strip */}
              <div className="px-4 py-2 border-t border-border bg-muted/20 flex items-center gap-2 overflow-x-auto">
                <span className="text-[10px] font-bold text-muted-foreground shrink-0 uppercase">Quick:</span>
                {QUICK_REPLIES.map((r, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setInputText(r)}
                    className="rounded-full border border-border bg-card px-3 py-1 text-[10px] text-foreground shrink-0 hover:bg-brand-50 hover:border-brand-300 transition"
                  >
                    "{r}"
                  </button>
                ))}
              </div>

              {/* Chat Input Bar */}
              <form onSubmit={handleSend} className="p-3 border-t border-border flex items-center gap-2 bg-card">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={`Write a respectful message to ${otherPersonName}...`}
                  className="flex-1 rounded-2xl border border-border bg-muted/30 px-4 py-3 text-xs text-foreground focus:border-brand-500 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-r from-brand-600 to-rose-600 text-white shadow-md shadow-brand-600/20 transition hover:from-brand-700 disabled:opacity-40"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-xs text-muted-foreground">
              Select a conversation on the left to start messaging.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
