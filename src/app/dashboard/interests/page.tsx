'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Heart,
  CheckCircle2,
  XCircle,
  Clock,
  Send,
  MessageSquare,
  Eye,
  UserX,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';

export default function InterestsHubPage() {
  const {
    currentUser,
    currentProfile,
    interests,
    acceptInterest,
    declineInterest,
    cancelInterest,
    startOrGetConversation,
  } = useAuth();

  const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received');

  const receivedInterests = interests.filter(
    (i) =>
      (currentProfile && (i.receiverProfileId === currentProfile.id || i.receiverId === currentProfile.userId)) ||
      (currentUser && (i.receiverId === currentUser.id || (currentUser.profileId && i.receiverProfileId === currentUser.profileId)))
  );

  const sentInterests = interests.filter(
    (i) =>
      (currentProfile && (i.senderProfileId === currentProfile.id || i.senderId === currentProfile.userId)) ||
      (currentUser && (i.senderId === currentUser.id || (currentUser.profileId && i.senderProfileId === currentUser.profileId)))
  );

  const currentList = activeTab === 'received' ? receivedInterests : sentInterests;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-2xl font-bold font-serif text-foreground">Connection Interests Hub</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage your incoming expressions of interest and track sent matrimonial requests.
          </p>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center gap-2 bg-muted/40 p-1.5 rounded-2xl border border-border">
          <button
            onClick={() => setActiveTab('received')}
            className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold transition ${
              activeTab === 'received'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Heart className="h-3.5 w-3.5" />
            <span>Received ({receivedInterests.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('sent')}
            className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold transition ${
              activeTab === 'sent'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Send className="h-3.5 w-3.5" />
            <span>Sent ({sentInterests.length})</span>
          </button>
        </div>
      </div>

      {/* List of Interests */}
      {currentList.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border bg-card p-12 text-center">
          <Heart className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <h3 className="text-base font-bold text-foreground">No {activeTab} interests yet</h3>
          <p className="text-xs text-muted-foreground mt-1 mb-4">
            {activeTab === 'received'
              ? 'Complete your profile details to increase visibility and receive more connection requests.'
              : 'Browse our verified match directory and send connection interests to prospective partners.'}
          </p>
          <Link
            href="/dashboard/discover"
            className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-brand-700"
          >
            Discover Matches
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {currentList.map((item) => {
            const isReceived = activeTab === 'received';
            const otherName = isReceived ? item.senderName : item.receiverName;
            const otherPhoto = isReceived ? item.senderPhoto : item.receiverPhoto;
            const otherProfileId = isReceived ? item.senderProfileId : item.receiverProfileId;
            const otherUserId = isReceived ? item.senderId : item.receiverId;

            return (
              <div
                key={item.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl border border-border bg-card p-5 shadow-sm transition hover:shadow-md"
              >
                <div className="flex items-start sm:items-center gap-4">
                  <img
                    src={
                      otherPhoto ||
                      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200'
                    }
                    alt={otherName}
                    className="h-14 w-14 rounded-2xl object-cover ring-2 ring-brand-500/20 shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-foreground">{otherName}</h4>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                          item.status === 'ACCEPTED'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : item.status === 'PENDING'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>

                    {item.message && (
                      <p className="text-xs text-muted-foreground mt-1 italic line-clamp-2">
                        "{item.message}"
                      </p>
                    )}
                    <span className="text-[10px] text-muted-foreground mt-1 block">
                      Sent {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <Link
                    href={`/profile/${otherProfileId}`}
                    className="rounded-xl border border-border bg-muted/30 px-3.5 py-2 text-xs font-semibold text-foreground hover:bg-muted"
                  >
                    <Eye className="h-3.5 w-3.5 inline mr-1" /> View Dossier
                  </Link>

                  {isReceived && item.status === 'PENDING' && (
                    <>
                      <button
                        onClick={() => {
                          declineInterest(item.id);
                          toast.info('Interest declined politely.');
                        }}
                        className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-300"
                      >
                        Decline
                      </button>
                      <button
                        onClick={() => {
                          acceptInterest(item.id);
                          toast.success('Connection interest accepted! You can now message each other.');
                        }}
                        className="rounded-xl bg-gradient-to-r from-brand-600 to-rose-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-brand-600/20 hover:from-brand-700"
                      >
                        Accept Interest
                      </button>
                    </>
                  )}

                  {item.status === 'ACCEPTED' && (
                    <Link
                      href="/dashboard/messages"
                      className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-emerald-700 flex items-center gap-1.5"
                    >
                      <MessageSquare className="h-3.5 w-3.5" /> Open Chat
                    </Link>
                  )}

                  {!isReceived && item.status === 'PENDING' && (
                    <button
                      onClick={() => {
                        cancelInterest(item.id);
                        toast.info('Interest cancelled.');
                      }}
                      className="rounded-xl border border-border px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-muted"
                    >
                      Cancel Request
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
