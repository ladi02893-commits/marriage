'use client';

import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageSquare, Clock, CheckCircle2 } from 'lucide-react';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { toast } from 'sonner';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('Matchmaking Inquiry');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) {
      toast.error('Please fill in all required fields.');
      return;
    }

    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      toast.success('Thank you! Your message has been routed to our matrimonial advisory team.');
      setName('');
      setEmail('');
      setMessage('');
    }, 500);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />

      <div className="border-b border-border bg-brand-50/40 py-16 text-center dark:bg-brand-950/20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-600">Get In Touch</span>
          <h1 className="text-3xl sm:text-5xl font-bold font-serif text-foreground">
            Contact the Matrimonial Bureau
          </h1>
          <p className="text-xs sm:text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Our experienced relationship advisors and support consultants are available to assist you and your family.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          {/* Contact Details Left */}
          <div className="lg:col-span-5 space-y-8">
            <div>
              <h3 className="text-xl font-bold text-foreground font-serif mb-2">Dedicated Concierge & Advisory</h3>
              <p className="text-xs leading-relaxed text-muted-foreground">
                Whether you have questions about membership plans, identity verification, or personalized matchmaking dossiers, our team is at your service.
              </p>
            </div>

            <div className="space-y-4 text-xs">
              <div className="flex items-start gap-3.5 rounded-2xl border border-border bg-card p-4 shadow-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100 text-brand-700 dark:bg-brand-900/50 dark:text-brand-300 shrink-0">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-foreground">London Executive Office</h4>
                  <p className="text-muted-foreground mt-0.5">42 Berkeley Square, Mayfair, London W1J 5AW, United Kingdom</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 rounded-2xl border border-border bg-card p-4 shadow-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100 text-brand-700 dark:bg-brand-900/50 dark:text-brand-300 shrink-0">
                  <Phone className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-foreground">Phone & WhatsApp Concierge</h4>
                  <p className="text-muted-foreground mt-0.5">+44 (0) 20 7946 0912 (Mon - Fri: 9am - 7pm GMT)</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 rounded-2xl border border-border bg-card p-4 shadow-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100 text-brand-700 dark:bg-brand-900/50 dark:text-brand-300 shrink-0">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-foreground">Email Support Desk</h4>
                  <p className="text-muted-foreground mt-0.5">concierge@truepair.com / support@truepair.com</p>
                </div>
              </div>
            </div>
          </div>

          {/* Form Right */}
          <div className="lg:col-span-7">
            <div className="rounded-3xl border border-border bg-card p-8 shadow-xl">
              <h3 className="text-xl font-bold text-foreground font-serif mb-1">Send a Message to Our Bureau</h3>
              <p className="text-xs text-muted-foreground mb-6">
                All inquiries are treated with the strictest confidentiality.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-foreground block mb-1">Your Full Name *</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Tariq Khan"
                      className="w-full rounded-xl border border-border bg-muted/30 p-2.5 text-xs text-foreground focus:border-brand-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-foreground block mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="tariq@example.com"
                      className="w-full rounded-xl border border-border bg-muted/30 p-2.5 text-xs text-foreground focus:border-brand-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">Subject</label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full rounded-xl border border-border bg-muted/30 p-2.5 text-xs text-foreground focus:border-brand-500 focus:outline-none"
                  >
                    <option value="Matchmaking Inquiry">General Matchmaking Inquiry</option>
                    <option value="VIP Consultation">VIP Platinum Matchmaker Consultation</option>
                    <option value="ID Verification Assistance">ID Verification Assistance</option>
                    <option value="Billing & Plans">Membership & Billing Support</option>
                    <option value="Partnership">Bureau Partnership / Media</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">Your Message *</label>
                  <textarea
                    rows={5}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Describe your inquiry or matchmaking requirements in detail..."
                    className="w-full rounded-xl border border-border bg-muted/30 p-3 text-xs text-foreground focus:border-brand-500 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSending}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-brand-600 to-rose-600 py-3.5 text-xs font-bold text-white shadow-lg shadow-brand-600/20 transition hover:from-brand-700 hover:to-rose-700 disabled:opacity-50"
                >
                  {isSending ? 'Sending...' : <><Send className="h-4 w-4" /> Submit Inquiry</>}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
