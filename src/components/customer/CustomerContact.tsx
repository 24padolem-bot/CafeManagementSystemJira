import React, { useState } from 'react';
import { useCafe } from '../../context/CafeContext';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle2 } from 'lucide-react';

export const CustomerContact: React.FC = () => {
  const { showToast } = useCafe();
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState<'feedback' | 'reservation' | 'catering'>('feedback');
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !mobile.trim() || !message.trim()) return;

    setIsSent(true);
    showToast('Message Sent', 'Thank you! The cafe manager will contact you shortly.', 'success');
    setTimeout(() => {
      setName('');
      setMobile('');
      setMessage('');
      setIsSent(false);
    }, 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      
      {/* Title */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#8C6D58]">
          Brew & Bean Roastery
        </span>
        <h1 className="text-3xl sm:text-4xl font-display font-bold text-[#2C1810]">
          Visit Us & Get in Touch
        </h1>
        <p className="text-xs sm:text-sm text-[#7A675B]">
          Have questions about our single-origin beans, want to reserve a banquet table, or share dining feedback? We would love to hear from you.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Info Cards (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white border border-[#EAE2D5] rounded-2xl p-6 shadow-xs space-y-6">
            <h2 className="text-base font-bold text-[#2C1810] border-b border-[#F2ECE2] pb-3">
              Cafe Information
            </h2>

            <div className="flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-[#F5EFE6] text-[#3D2314] flex items-center justify-center shrink-0 mt-0.5">
                <MapPin className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <p className="font-bold text-[#2C1810]">Location</p>
                <p className="text-[#6B5749] mt-0.5 leading-relaxed">
                  Shop 12, Heritage Boulevard, Civil Lines, Nagpur, Maharashtra - 440001
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-[#F5EFE6] text-[#3D2314] flex items-center justify-center shrink-0 mt-0.5">
                <Clock className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <p className="font-bold text-[#2C1810]">Cafe Hours</p>
                <p className="text-[#6B5749] mt-0.5">Monday – Sunday: 7:30 AM – 11:00 PM</p>
                <p className="text-[#8C7A6E] text-[11px]">Breakfast service starts at 7:30 AM</p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-[#F5EFE6] text-[#3D2314] flex items-center justify-center shrink-0 mt-0.5">
                <Phone className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <p className="font-bold text-[#2C1810]">Phone & WhatsApp</p>
                <p className="text-[#6B5749] mt-0.5">+91 (0712) 289-4455 / +91 98765 43210</p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-[#F5EFE6] text-[#3D2314] flex items-center justify-center shrink-0 mt-0.5">
                <Mail className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <p className="font-bold text-[#2C1810]">Email Concierge</p>
                <p className="text-[#6B5749] mt-0.5">orders@brewandbean.in</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact / Reservation Form (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-[#EAE2D5] rounded-2xl p-6 sm:p-8 shadow-xs">
          <h2 className="text-base font-bold text-[#2C1810] mb-1">
            Send Us a Note
          </h2>
          <p className="text-xs text-[#7A675B] mb-6">
            Table reservations, catering queries, or customer experience feedback.
          </p>

          {isSent ? (
            <div className="py-12 text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
              <h3 className="text-base font-bold text-[#2C1810]">Message Received</h3>
              <p className="text-xs text-[#6B5749]">Our cafe host has received your note and will be in touch soon.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#4A3B32] mb-1">Query Type</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setType('feedback')}
                    className={`py-2 text-xs font-semibold rounded-lg border transition-all ${
                      type === 'feedback'
                        ? 'bg-[#3D2314] text-white border-[#3D2314]'
                        : 'bg-white text-[#6B5749] border-[#DDD0C2]'
                    }`}
                  >
                    Feedback
                  </button>
                  <button
                    type="button"
                    onClick={() => setType('reservation')}
                    className={`py-2 text-xs font-semibold rounded-lg border transition-all ${
                      type === 'reservation'
                        ? 'bg-[#3D2314] text-white border-[#3D2314]'
                        : 'bg-white text-[#6B5749] border-[#DDD0C2]'
                    }`}
                  >
                    Table Booking
                  </button>
                  <button
                    type="button"
                    onClick={() => setType('catering')}
                    className={`py-2 text-xs font-semibold rounded-lg border transition-all ${
                      type === 'catering'
                        ? 'bg-[#3D2314] text-white border-[#3D2314]'
                        : 'bg-white text-[#6B5749] border-[#DDD0C2]'
                    }`}
                  >
                    Bulk Catering
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#4A3B32] mb-1">Your Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Aarav Sharma"
                    className="w-full px-3 py-2 text-xs bg-[#FBF9F5] border border-[#DDD0C2] rounded-lg text-[#2C1810] focus:outline-none focus:ring-1 focus:ring-[#8C6D58]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#4A3B32] mb-1">Mobile Number *</label>
                  <input
                    type="tel"
                    required
                    pattern="[0-9]{10}"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    placeholder="10-digit mobile"
                    className="w-full px-3 py-2 text-xs bg-[#FBF9F5] border border-[#DDD0C2] rounded-lg text-[#2C1810] focus:outline-none focus:ring-1 focus:ring-[#8C6D58]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#4A3B32] mb-1">Message / Details *</label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us date, time, number of guests, or your dining thoughts..."
                  className="w-full px-3 py-2 text-xs bg-[#FBF9F5] border border-[#DDD0C2] rounded-lg text-[#2C1810] focus:outline-none focus:ring-1 focus:ring-[#8C6D58]"
                />
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-white bg-[#3D2314] hover:bg-[#2A170C] rounded-lg shadow-sm transition-all flex items-center justify-center gap-2"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Note</span>
              </button>
            </form>
          )}
        </div>

      </div>

    </div>
  );
};
