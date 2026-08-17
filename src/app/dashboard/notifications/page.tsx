'use client';

import React from 'react';
import Link from 'next/link';
import {
  Bell,
  Heart,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  CheckCheck,
  CheckCircle2,
  Trash2,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { formatRelativeTime } from '@/lib/utils';
import { toast } from 'sonner';

export default function NotificationsCenterPage() {
  const { notifications, markNotificationRead, markAllNotificationsRead } = useAuth();

  const getIcon = (type: string) => {
    switch (type) {
      case 'INTEREST':
        return <Heart className="h-5 w-5 text-rose-600" />;
      case 'MESSAGE':
        return <MessageSquare className="h-5 w-5 text-blue-600" />;
      case 'VERIFICATION':
        return <ShieldCheck className="h-5 w-5 text-emerald-600" />;
      case 'MATCH':
        return <Sparkles className="h-5 w-5 text-gold-600" />;
      default:
        return <Bell className="h-5 w-5 text-brand-600" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-2xl font-bold font-serif text-foreground">Notifications Center</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Stay updated with interest responses, verified matches, and direct messages.
          </p>
        </div>

        <button
          onClick={() => {
            markAllNotificationsRead();
            toast.success('All notifications marked as read.');
          }}
          className="inline-flex items-center gap-1.5 rounded-xl border border-border px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted"
        >
          <CheckCheck className="h-4 w-4" /> Mark All as Read
        </button>
      </div>

      {notifications.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border bg-card p-12 text-center">
          <Bell className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <h3 className="text-base font-bold text-foreground">No notifications at this time</h3>
          <p className="text-xs text-muted-foreground mt-1">
            You are completely up to date.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => markNotificationRead(n.id)}
              className={`flex items-start justify-between gap-4 rounded-3xl border p-5 transition cursor-pointer ${
                !n.isRead
                  ? 'border-brand-300 bg-brand-50/40 shadow-sm dark:border-brand-900 dark:bg-brand-950/30'
                  : 'border-border bg-card hover:bg-muted/30'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white shadow-sm dark:bg-muted shrink-0 mt-0.5">
                  {getIcon(n.type)}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-foreground">{n.title}</h4>
                    {!n.isRead && (
                      <span className="h-2 w-2 rounded-full bg-brand-600" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{n.description}</p>
                  <span className="text-[10px] text-muted-foreground block">
                    {formatRelativeTime(n.createdAt)}
                  </span>
                </div>
              </div>

              {n.linkUrl && (
                <Link
                  href={n.linkUrl}
                  className="rounded-xl border border-border bg-white px-3.5 py-1.5 text-xs font-semibold text-brand-700 shadow-sm hover:bg-muted dark:bg-card dark:text-brand-300 shrink-0 self-center"
                >
                  View Details
                </Link>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
