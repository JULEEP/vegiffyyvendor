import React, { useState } from 'react';
import { FaEnvelope, FaCopy, FaCheck, FaHeadset, FaStore } from 'react-icons/fa';

const VendorSupport = () => {
  const [email, setEmail] = useState('vendor@vegiffyy.com');
  const [copied, setCopied] = useState(false);

  // Copy email to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Open email client
  const sendEmail = () => {
    window.location.href = `mailto:${email}?subject=Vendor Support&body=Hello Vegiffyy Vendor Support Team,`;
  };

  // Store icon component
  const StoreIcon = ({ className }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
    </svg>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        
        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden transform transition-all duration-500 hover:scale-105">
          
          {/* Header Section with Gradient */}
          <div className="bg-gradient-to-r from-green-600 to-blue-600 p-8 text-center relative overflow-hidden">
            {/* Floating Elements */}
            <div className="absolute top-4 left-4 w-8 h-8 bg-white/20 rounded-full"></div>
            <div className="absolute bottom-4 right-4 w-6 h-6 bg-white/30 rounded-full"></div>
            <div className="absolute top-1/2 left-1/4 w-4 h-4 bg-white/10 rounded-full"></div>
            
            <div className="relative z-10">
              <div className="w-20 h-20 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <FaStore className="text-white text-3xl" />
              </div>
              <h1 className="text-4xl font-bold text-white mb-3">Vendor Support</h1>
              <p className="text-blue-100 text-lg opacity-90">
                Your partnership success is our priority!
              </p>
            </div>
          </div>

          {/* Content Section */}
          <div className="p-8">
            
            {/* Support Message */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                <StoreIcon className="text-white text-2xl" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-3">
                Vendor Support Center
              </h2>
              <p className="text-gray-600 text-lg leading-relaxed">
                Need assistance with your vendor account or services? 
                <span className="block text-green-600 font-semibold mt-1">
                  Our vendor support team is here to help you grow!
                </span>
              </p>
            </div>

            {/* Email Display Card */}
            <div className="bg-gradient-to-r from-gray-50 to-green-50 rounded-2xl p-6 border-2 border-green-200 shadow-lg mb-6">
              <div className="text-center mb-4">
                <div className="w-12 h-12 mx-auto mb-3 bg-green-100 rounded-full flex items-center justify-center">
                  <FaEnvelope className="text-green-600 text-xl" />
                </div>
                <h3 className="text-lg font-semibold text-gray-700 mb-1">
                  Contact Vendor Support
                </h3>
                <p className="text-gray-500 text-sm">
                  Send us your queries and we'll assist you promptly
                </p>
              </div>

              {/* Email with Actions */}
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <FaHeadset className="text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-500 font-medium">Vendor Support Email</p>
                      <p className="text-lg font-bold text-gray-800 truncate">{email}</p>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={copyToClipboard}
                      className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 active:scale-95"
                    >
                      {copied ? (
                        <>
                          <FaCheck className="text-green-300" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <FaCopy />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                    
                    <button
                      onClick={sendEmail}
                      className="bg-white border-2 border-green-600 text-green-600 hover:bg-green-600 hover:text-white px-4 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 active:scale-95 font-medium"
                    >
                      Send Email
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Info */}
            <div className="text-center">
              <div className="inline-flex items-center space-x-2 bg-blue-50 border border-blue-200 rounded-full px-4 py-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                <span className="text-blue-700 font-medium text-sm">
                  Dedicated vendor support with quick response times
                </span>
              </div>
            </div>

          </div>

          {/* Footer */}
          <div className="bg-gray-50 p-6 text-center border-t border-gray-200">
            <p className="text-gray-500 text-sm">
              © {new Date().getFullYear()} Vegiffyy Vendor Program • Partnering for success
            </p>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="text-center mt-6">
          <div className="inline-flex space-x-4 text-gray-400">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-xs">Business Support</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              <span className="text-xs">Account Management</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
              <span className="text-xs">Growth Assistance</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorSupport;