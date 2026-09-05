import React, { useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { Enquiry, EnquiryStatus, UserRole } from '../types';
import { enquiryService } from '../services/enquiryService';
import {
  MessageSquare,
  Send,
  CheckCircle2,
  Clock,
  ArrowRight,
  Filter,
  User,
  ShoppingBag,
  Sparkles,
} from 'lucide-react';

interface EnquiriesViewProps {
  enquiries: Enquiry[];
  currentRole: UserRole;
  currentUserId: string;
  currentUserName: string;
  selectedEnquiryId?: string;
  onEnquiriesUpdated: () => void;
}

export const EnquiriesView: React.FC<EnquiriesViewProps> = ({
  enquiries,
  currentRole,
  currentUserId,
  currentUserName,
  selectedEnquiryId,
  onEnquiriesUpdated,
}) => {
  const { t } = useLanguage();

  const [activeTab, setActiveTab] = useState<string>('All');
  const [activeEnquiryId, setActiveEnquiryId] = useState<string>(
    selectedEnquiryId || (enquiries.length > 0 ? enquiries[0].id : '')
  );
  const [messageInput, setMessageInput] = useState('');

  const activeEnquiry = enquiries.find((e) => e.id === activeEnquiryId) || enquiries[0];

  const statusList: (EnquiryStatus | 'All')[] = [
    'All',
    'Sent',
    'Viewed',
    'Responded',
    'Negotiating',
    'Completed',
  ];

  const filteredEnquiries = enquiries.filter((enq) => {
    if (activeTab === 'All') return true;
    return enq.status === activeTab;
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !activeEnquiry) return;

    enquiryService.addMessage(
      activeEnquiry.id,
      currentUserId,
      currentUserName,
      currentRole,
      messageInput.trim()
    );

    setMessageInput('');
    onEnquiriesUpdated();
  };

  const handleStatusChange = (newStatus: EnquiryStatus) => {
    if (!activeEnquiry) return;
    enquiryService.updateStatus(activeEnquiry.id, newStatus);
    onEnquiriesUpdated();
  };

  const quickReplies =
    currentRole === 'artisan'
      ? [
          'Yes, we can craft this batch within 14 days.',
          'Can you confirm if protective palm-leaf packaging is needed?',
          'We can accept this order if MOQ is 30 units.',
        ]
      : [
          'Agreed! Please proceed with the production schedule.',
          'Could you share a sample photograph before final kiln firing?',
          'Can you deliver to our Mumbai warehouse directly?',
        ];

  const getStatusBadge = (status: EnquiryStatus) => {
    switch (status) {
      case 'Sent':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'Viewed':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'Responded':
        return 'bg-purple-50 text-purple-800 border-purple-200';
      case 'Negotiating':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'Completed':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header Bar */}
      <div className="bg-white rounded-2xl p-6 border border-[#E6DFD5] shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-[#1F2421]">
            {t.enquiries.title}
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            {t.enquiries.subtitle}
          </p>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1">
          {statusList.map((status) => (
            <button
              key={status}
              onClick={() => setActiveTab(status)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                activeTab === status
                  ? 'bg-[#C85A32] text-white shadow-xs'
                  : 'bg-[#FAF7F2] border border-[#D9CFBF] text-gray-700 hover:bg-[#F3ECE0]'
              }`}
            >
              {status === 'All'
                ? t.common.all
                : status === 'Sent'
                ? t.enquiries.statusSent
                : status === 'Viewed'
                ? t.enquiries.statusViewed
                : status === 'Responded'
                ? t.enquiries.statusResponded
                : status === 'Negotiating'
                ? t.enquiries.statusNegotiating
                : t.enquiries.statusCompleted}
            </button>
          ))}
        </div>
      </div>

      {/* Main Two-Pane Chat Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-white rounded-2xl border border-[#E6DFD5] shadow-xs overflow-hidden min-h-[600px]">
        {/* Left Pane: Enquiries List (5 cols) */}
        <div className="lg:col-span-5 border-b lg:border-b-0 lg:border-r border-[#E6DFD5] flex flex-col">
          <div className="p-4 bg-[#FAF7F2] border-b border-[#E6DFD5] text-xs font-bold text-gray-600 uppercase tracking-wider">
            Conversations ({filteredEnquiries.length})
          </div>

          <div className="divide-y divide-gray-100 overflow-y-auto max-h-[620px]">
            {filteredEnquiries.map((enq) => {
              const isSelected = enq.id === activeEnquiry?.id;
              const lastMsg = enq.messages[enq.messages.length - 1];
              return (
                <div
                  key={enq.id}
                  onClick={() => setActiveEnquiryId(enq.id)}
                  className={`p-4 transition cursor-pointer ${
                    isSelected ? 'bg-amber-50/70 border-l-4 border-[#C85A32]' : 'hover:bg-[#FAF7F2]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <img
                        src={enq.productImage}
                        alt={enq.productTitle}
                        className="w-12 h-12 rounded-lg object-cover bg-stone-100 flex-shrink-0"
                      />
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-gray-900 truncate">
                          {currentRole === 'artisan' ? enq.buyerOrg : enq.artisanName}
                        </h4>
                        <p className="text-[11px] text-gray-500 truncate">{enq.productTitle}</p>
                        <p className="text-[10px] text-[#C85A32] font-semibold mt-0.5">
                          {enq.targetQuantity} units • ₹{enq.offeredPricePerUnit || 1200}/unit
                        </p>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border whitespace-nowrap ${getStatusBadge(
                        enq.status
                      )}`}
                    >
                      {enq.status}
                    </span>
                  </div>

                  {lastMsg && (
                    <p className="text-xs text-gray-600 mt-2 line-clamp-1 italic">
                      <span className="font-semibold text-gray-700 not-italic">
                        {lastMsg.senderName.split(' ')[0]}:{' '}
                      </span>
                      {lastMsg.content}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Pane: Active Thread & Interactive Chat (7 cols) */}
        {activeEnquiry ? (
          <div className="lg:col-span-7 flex flex-col justify-between h-full bg-[#FAF7F2]/30">
            {/* Thread Header with Commercial Summary & Status Switcher */}
            <div className="p-4 sm:p-5 bg-[#FAF7F2] border-b border-[#E6DFD5] space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src={activeEnquiry.productImage}
                    alt={activeEnquiry.productTitle}
                    className="w-11 h-11 rounded-lg object-cover border border-amber-200"
                  />
                  <div>
                    <h3 className="font-serif font-bold text-sm text-[#1F2421]">
                      {activeEnquiry.productTitle}
                    </h3>
                    <p className="text-xs text-gray-500">
                      Artisan: <strong className="text-gray-800">{activeEnquiry.artisanName}</strong> • Buyer:{' '}
                      <strong className="text-gray-800">{activeEnquiry.buyerOrg}</strong>
                    </p>
                  </div>
                </div>

                {/* Status Toggle Dropdown / Pills */}
                <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-[#D9CFBF] text-xs">
                  <span className="text-[10px] font-bold text-gray-400 px-2 uppercase">Status:</span>
                  {(['Sent', 'Viewed', 'Responded', 'Negotiating', 'Completed'] as EnquiryStatus[]).map(
                    (st) => (
                      <button
                        key={st}
                        onClick={() => handleStatusChange(st)}
                        className={`px-2 py-0.5 rounded-lg font-semibold text-[10px] transition cursor-pointer ${
                          activeEnquiry.status === st
                            ? 'bg-[#C85A32] text-white shadow-xs'
                            : 'text-gray-600 hover:text-black'
                        }`}
                      >
                        {st}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Quick commercial order specs */}
              <div className="flex items-center gap-4 text-xs font-medium text-gray-700 bg-white/80 p-2.5 rounded-xl border border-gray-200">
                <span>
                  Target Volume: <strong className="text-gray-900">{activeEnquiry.targetQuantity} units</strong>
                </span>
                <span>•</span>
                <span>
                  Offered Price:{' '}
                  <strong className="text-[#C85A32]">
                    ₹{(activeEnquiry.offeredPricePerUnit || 1200).toLocaleString('en-IN')} / unit
                  </strong>
                </span>
                <span>•</span>
                <span>
                  Estimated Order Value:{' '}
                  <strong className="text-emerald-700 font-bold">
                    ₹{(activeEnquiry.targetQuantity * (activeEnquiry.offeredPricePerUnit || 1200)).toLocaleString('en-IN')}
                  </strong>
                </span>
              </div>
            </div>

            {/* Chat Messages Stream */}
            <div className="p-4 sm:p-6 space-y-4 overflow-y-auto max-h-[420px] flex-1">
              {activeEnquiry.messages.map((msg) => {
                const isMe = msg.senderId === currentUserId || (currentRole === msg.senderRole);
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[11px] font-bold text-gray-700">
                        {msg.senderName}
                      </span>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                          msg.senderRole === 'artisan'
                            ? 'bg-amber-100 text-[#C85A32]'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {msg.senderRole === 'artisan' ? 'Artisan' : 'Buyer'}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div
                      className={`max-w-md p-3.5 rounded-2xl text-xs leading-relaxed shadow-xs ${
                        isMe
                          ? 'bg-[#C85A32] text-white rounded-tr-xs'
                          : 'bg-white text-gray-800 border border-[#E6DFD5] rounded-tl-xs'
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick Suggestion Chips */}
            <div className="px-4 py-2 bg-[#FAF7F2] border-t border-[#E6DFD5] flex items-center gap-2 overflow-x-auto">
              <span className="text-[10px] font-bold uppercase text-gray-400 whitespace-nowrap">Quick replies:</span>
              {quickReplies.map((reply, qIdx) => (
                <button
                  key={qIdx}
                  type="button"
                  onClick={() => setMessageInput(reply)}
                  className="px-2.5 py-1 text-[11px] rounded-lg bg-white border border-gray-200 hover:border-[#C85A32] text-gray-700 whitespace-nowrap transition cursor-pointer"
                >
                  {reply}
                </button>
              ))}
            </div>

            {/* Message Input Box */}
            <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-[#E6DFD5] flex items-center gap-2">
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder={t.enquiries.typePlaceholder}
                className="flex-1 px-4 py-2.5 rounded-xl border border-[#D9CFBF] text-xs bg-[#FAF7F2] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#C85A32]/30"
              />
              <button
                type="submit"
                disabled={!messageInput.trim()}
                className="px-4 py-2.5 rounded-xl bg-[#C85A32] hover:bg-[#B84A22] disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{t.enquiries.sendReply}</span>
              </button>
            </form>
          </div>
        ) : (
          <div className="lg:col-span-7 flex items-center justify-center p-12 text-center text-gray-500">
            {t.enquiries.noEnquiries}
          </div>
        )}
      </div>
    </div>
  );
};
