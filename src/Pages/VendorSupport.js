import React, { useState } from 'react';
import { FaEnvelope, FaPhone, FaCopy, FaCheck, FaWhatsapp } from 'react-icons/fa';

const VendorSupport = () => {
  const [email, setEmail] = useState('vendor@vegiffy.in');
  const [phone, setPhone] = useState('9391950503');
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);

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

  // Open email client - FIXED VERSION
  const sendEmail = () => {
    try {
      const vendorId = localStorage.getItem('vendorId') || 'Not logged in';
      const restaurantName = localStorage.getItem('restaurantName') || 'Not specified';
      
      const subject = encodeURIComponent("Vendor Support - Vegiffy");
      const body = encodeURIComponent(
        `Hello Vegiffy Vendor Support Team,\n\n` +
        `I need assistance with the following:\n\n` +
        `Vendor ID: ${vendorId}\n` +
        `Restaurant Name: ${restaurantName}\n\n` +
        `Issue Description:\n` +
        `- \n\n` +
        `Please help me resolve this issue.\n\n` +
        `Thank you.`
      );
      
      // Create mailto link
      const mailtoLink = `mailto:${email}?subject=${subject}&body=${body}`;
      
      // Use a temporary iframe to handle mailto without navigation
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = mailtoLink;
      document.body.appendChild(iframe);
      
      // Remove iframe after a delay
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 1000);
      
      // Also try opening in a new window as backup
      window.open(mailtoLink, '_blank');
      
    } catch (error) {
      console.error('Error sending email:', error);
      setShowEmailModal(true);
    }
  };

  // Open WhatsApp - FIXED
  const openWhatsApp = () => {
    try {
      const vendorId = localStorage.getItem('vendorId') || 'Not logged in';
      const restaurantName = localStorage.getItem('restaurantName') || 'Not specified';
      
      const message = `Hello Vegiffy Vendor Support Team,

I need assistance with the following:

Vendor ID: ${vendorId}
Restaurant Name: ${restaurantName}

Issue Description:
- 

Please help me resolve this issue.

Thank you.`;
      
      // Open WhatsApp in new tab
      const whatsappLink = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
      window.open(whatsappLink, '_blank', 'noopener,noreferrer');
      
    } catch (error) {
      console.error('Error opening WhatsApp:', error);
      alert(`Please WhatsApp us at: ${phone}`);
    }
  };

  // Call phone - FIXED
  const callPhone = () => {
    try {
      // Use window.location.href for tel: links (they don't cause blank screens)
      window.location.href = `tel:${phone}`;
    } catch (error) {
      console.error('Error calling:', error);
      alert(`Please call us at: ${phone}`);
    }
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
                
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <span className="text-lg font-bold text-gray-800 truncate">{email}</span>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={copyEmailToClipboard}
                      className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                      title="Copy email"
                    >
                      {copiedEmail ? <FaCheck className="text-sm" /> : <FaCopy className="text-sm" />}
                    </button>
                    <button
                      onClick={sendEmail}
                      className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1"
                    >
                      <FaEnvelope className="text-xs" />
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
                
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <span className="text-lg font-bold text-gray-800">{phone}</span>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={copyPhoneToClipboard}
                      className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                      title="Copy phone number"
                    >
                      {copiedPhone ? <FaCheck className="text-sm" /> : <FaCopy className="text-sm" />}
                    </button>
                    <div className="flex space-x-1">
                      <button
                        onClick={callPhone}
                        className="px-3 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors flex items-center gap-1"
                      >
                        <FaPhone className="text-xs" />
                        Call
                      </button>
                      <button
                        onClick={openWhatsApp}
                        className="px-3 py-2 bg-[#25D366] text-white text-sm font-medium rounded-lg hover:bg-green-600 transition-colors flex items-center space-x-1"
                      >
                        <FaWhatsapp className="text-sm" />
                        <span>Chat</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Email Modal - Shows when email fails */}
            {showEmailModal && (
              <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
                <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowEmailModal(false)} />
                <div className="bg-white rounded-lg max-w-sm w-full p-6 relative z-10">
                  <h3 className="text-lg font-semibold mb-3">📧 Email Support</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Please email us at:
                  </p>
                  <div className="bg-blue-50 p-3 rounded-lg mb-4">
                    <p className="text-blue-800 font-medium break-all">{email}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={copyEmailToClipboard}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Copy Email
                    </button>
                    <button
                      onClick={() => setShowEmailModal(false)}
                      className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Additional Support Options */}
            <div className="mt-6 space-y-3">
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <h4 className="text-xs font-semibold text-gray-700 mb-2">📋 Before contacting support:</h4>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li className="flex items-start gap-2">
                    <span className="text-green-500">•</span>
                    <span>Make sure you're logged in with your vendor account</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500">•</span>
                    <span>Have your Vendor ID ready: <span className="font-mono bg-gray-200 px-1 rounded">{localStorage.getItem('vendorId') || 'Not logged in'}</span></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500">•</span>
                    <span>Describe your issue clearly with screenshots if possible</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Footer Note */}
            <div className="mt-4 pt-4 border-t border-gray-100 text-center">
              <p className="text-gray-500 text-xs">
                ⏰ Response time: Within 2 hours on working days
              </p>
              <p className="text-gray-400 text-xs mt-1">
                © Vegiffy Vendor Program • Partner Success Team
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