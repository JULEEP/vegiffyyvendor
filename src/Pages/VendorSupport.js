import React, { useState } from 'react';
import { FaEnvelope, FaPhone, FaCopy, FaCheck, FaWhatsapp } from 'react-icons/fa';

const VendorSupport = () => {
  const [email, setEmail] = useState('vendor@vegiffyy.com');
  const [phone, setPhone] = useState('9391950503');
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);

  // Copy to clipboard functions
  const copyEmailToClipboard = () => {
    navigator.clipboard.writeText(email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const copyPhoneToClipboard = () => {
    navigator.clipboard.writeText(phone);
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2000);
  };

  // Open email client
  const sendEmail = () => {
    window.location.href = `mailto:${email}?subject=Vendor Support&body=Hello Vegiffyy Vendor Support Team,`;
  };

  // Open WhatsApp
  const openWhatsApp = () => {
    const message = "Hello Vegiffyy Vendor Support Team,";
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  // Call phone
  const callPhone = () => {
    window.location.href = `tel:${phone}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        
        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden transform transition-all duration-300 hover:shadow-2xl">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-center relative">
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-16 h-16 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-12 h-12 bg-white/10 rounded-full translate-x-1/3 translate-y-1/3"></div>
            
            <div className="relative z-10">
              <div className="w-16 h-16 mx-auto mb-3 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <FaEnvelope className="text-white text-2xl" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">Vendor Support</h1>
              <p className="text-emerald-100 text-sm">
                24/7 Support for Vendor Partners
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            
            {/* Intro Text */}
            <div className="text-center mb-6">
              <p className="text-gray-700 font-medium">
                Need help? Contact our vendor support team
              </p>
              <div className="mt-2 inline-flex items-center space-x-1 bg-green-50 border border-green-200 rounded-full px-3 py-1">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <span className="text-green-700 text-sm font-medium">Quick Response Guaranteed</span>
              </div>
            </div>

            {/* Contact Cards */}
            <div className="space-y-4">
              
              {/* Email Card */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200 shadow-sm">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FaEnvelope className="text-blue-600 text-lg" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 text-sm">Email Support</h3>
                      <p className="text-xs text-gray-500">For detailed queries</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-gray-800 truncate">{email}</span>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={copyEmailToClipboard}
                      className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                      title="Copy email"
                    >
                      {copiedEmail ? <FaCheck /> : <FaCopy className="text-sm" />}
                    </button>
                    <button
                      onClick={sendEmail}
                      className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Email
                    </button>
                  </div>
                </div>
              </div>

              {/* Phone Card */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200 shadow-sm">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <FaPhone className="text-green-600 text-lg" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 text-sm">Phone Support</h3>
                      <p className="text-xs text-gray-500">Call for immediate assistance</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-gray-800">{phone}</span>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={copyPhoneToClipboard}
                      className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                      title="Copy phone number"
                    >
                      {copiedPhone ? <FaCheck /> : <FaCopy className="text-sm" />}
                    </button>
                    <div className="flex space-x-1">
                      <button
                        onClick={callPhone}
                        className="px-3 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Call
                      </button>
                      <button
                        onClick={openWhatsApp}
                        className="px-3 py-2 bg-[#25D366] text-white text-sm font-medium rounded-lg hover:bg-green-600 transition-colors flex items-center space-x-1"
                      >
                        <FaWhatsapp />
                        <span>Chat</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Note */}
            <div className="mt-6 pt-4 border-t border-gray-100 text-center">
              <p className="text-gray-500 text-xs">
                ⏰ Response time: Within 2 hours on working days
              </p>
              <p className="text-gray-400 text-xs mt-1">
                © Vegiffyy Vendor Program • Partner Success Team
              </p>
            </div>
          </div>
        </div>

        {/* Quick Tips */}
        <div className="mt-4 text-center">
          <div className="inline-flex flex-wrap justify-center gap-2">
            <span className="px-3 py-1 bg-white text-gray-700 text-xs font-medium rounded-full shadow-sm border border-gray-200">
              📞 Call for urgent issues
            </span>
            <span className="px-3 py-1 bg-white text-gray-700 text-xs font-medium rounded-full shadow-sm border border-gray-200">
              ✉️ Email for documentation
            </span>
            <span className="px-3 py-1 bg-white text-gray-700 text-xs font-medium rounded-full shadow-sm border border-gray-200">
              💬 WhatsApp for quick chat
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorSupport;