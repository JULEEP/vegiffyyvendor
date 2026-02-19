import { useState, useEffect, useRef } from "react";
import { 
  RiMenu2Line, 
  RiMenu3Line, 
  RiFullscreenLine, 
  RiFullscreenExitLine,
  RiStore2Line,
  RiBankCardLine,
  RiTimeLine,
  RiWalletLine,
  RiRefreshLine,
  RiNotification3Line,
  RiNotification2Fill
} from "react-icons/ri";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import VeggyfyLogo from "../Images/veggifylogo.jpeg";

const Navbar = ({ setIsCollapsed, isCollapsed }) => {
  const [vendorStatus, setVendorStatus] = useState('active');
  const [isLoading, setIsLoading] = useState(false);
  const [vendorId, setVendorId] = useState('');
  const [vendorName, setVendorName] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const [greeting, setGreeting] = useState('');
  const [notificationCount, setNotificationCount] = useState(0);
  const [prevNotificationCount, setPrevNotificationCount] = useState(0);
  const [isPlayingNotificationSound, setIsPlayingNotificationSound] = useState(false);
  
  const navigate = useNavigate();
  const notificationSoundRef = useRef(null);
  const notificationCheckInterval = useRef(null);

  useEffect(() => {
    const storedVendorId = localStorage.getItem('vendorId');
    const storedVendorData = localStorage.getItem('vendorData');
    
    if (storedVendorId) {
      setVendorId(storedVendorId);
      fetchVendorStatus(storedVendorId);
      fetchNotificationCount(storedVendorId);
    }
    
    if (storedVendorData) {
      const vendorData = JSON.parse(storedVendorData);
      setVendorName(vendorData.restaurantName);
    }

    updateTimeAndGreeting();
    const interval = setInterval(updateTimeAndGreeting, 60000);

    // Setup notification check interval every 2 minutes
    notificationCheckInterval.current = setInterval(() => {
      if (vendorId) {
        fetchNotificationCount(vendorId);
      }
    }, 120000); // Check every 2 minutes

    return () => {
      clearInterval(interval);
      if (notificationCheckInterval.current) {
        clearInterval(notificationCheckInterval.current);
      }
    };
  }, [vendorId]);

  const updateTimeAndGreeting = () => {
    const now = new Date();
    const hours = now.getHours();
    
    if (hours < 12) setGreeting("🌅 Good Morning");
    else if (hours < 17) setGreeting("☀️ Good Afternoon");
    else setGreeting("🌙 Good Evening");

    const timeString = now.toLocaleTimeString('en-IN', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
    setCurrentTime(timeString);
  };

  const fetchVendorStatus = async (id) => {
    try {
      const response = await axios.get(`https://api.vegiffyy.com/api/vendor/vendorstatus/${id}`);
      if (response.data.success) {
        setVendorStatus(response.data.vendor.status);
      }
    } catch (error) {
      console.error("Error fetching vendor status:", error);
    }
  };

  const fetchNotificationCount = async (vendorId) => {
    try {
      const response = await fetch(`https://api.vegiffyy.com/api/vendor/notification/${vendorId}`);
      const result = await response.json();
      
      if (result.success) {
        const unreadCount = result.data?.filter(n => !n.isRead)?.length || 0;
        
        // Check if new notifications arrived
        if (unreadCount > prevNotificationCount) {
          // Play notification sound
          playNotificationSound();
        }
        
        setPrevNotificationCount(unreadCount);
        setNotificationCount(unreadCount);
      }
    } catch (error) {
      console.error('Error fetching notification count:', error);
    }
  };

  // Play notification sound
  const playNotificationSound = () => {
    if (notificationSoundRef.current) {
      notificationSoundRef.current.play().catch(e => {
        console.log("Notification sound play failed:", e);
        // Fallback to beep sound
        playFallbackSound();
      });
      setIsPlayingNotificationSound(true);
      
      // Also speak using Web Speech API
      speakNotificationText();
      
      setTimeout(() => setIsPlayingNotificationSound(false), 2000);
    } else {
      playFallbackSound();
    }
  };

  // Fallback beep sound
  const playFallbackSound = () => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  };

  // Speak notification using Web Speech API
  const speakNotificationText = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance("You have a new notification. Please check!");
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 0.8;
      
      const voices = speechSynthesis.getVoices();
      const femaleVoice = voices.find(voice => 
        voice.name.includes('Female') || 
        voice.name.includes('female') ||
        voice.lang.includes('en-US') || 
        voice.lang.includes('en-IN')
      );
      
      if (femaleVoice) {
        utterance.voice = femaleVoice;
      }
      
      // Stop any ongoing speech
      speechSynthesis.cancel();
      
      // Speak after 500ms delay
      setTimeout(() => {
        speechSynthesis.speak(utterance);
      }, 500);
    }
  };

  const toggleVendorStatus = async () => {
    if (!vendorId) return;
    
    setIsLoading(true);
    const newStatus = vendorStatus === 'active' ? 'inactive' : 'active';
    
    try {
      const response = await axios.put(`https://api.vegiffyy.com/api/vendor/vendorstatus/${vendorId}`, {
        status: newStatus
      });
      
      if (response.data.success) {
        setVendorStatus(newStatus);
      }
    } catch (error) {
      console.error("Error updating vendor status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch(err => {
        console.error("Error attempting to enable fullscreen:", err);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => {
          setIsFullscreen(false);
        });
      }
    }
  };

  const handleNotificationClick = () => {
    // Reset notification count to 0 when clicked
    setNotificationCount(0);
    setPrevNotificationCount(0);
    navigate('/notification');
  };

  return (
    <>
      {/* Hidden audio element for notification sound */}
      <audio 
        ref={notificationSoundRef} 
        preload="auto"
        src="https://assets.mixkit.co/sfx/preview/mixkit-software-interface-start-2574.mp3"
      />
      
      <nav className="bg-gradient-to-r from-green-600 via-green-700 to-emerald-600 border-b border-green-500 sticky top-0 w-full px-5 py-3 flex items-center justify-between shadow-lg z-50">
        {/* Left Side - Perfect Size */}
        <div className="flex items-center gap-4">
          {/* Sidebar Toggle */}
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)} 
            className="p-2 rounded-xl bg-white bg-opacity-20 hover:bg-opacity-30 backdrop-blur-sm transition-all duration-200 text-white hover:scale-105 shadow-md"
          >
            {isCollapsed ? (
              <RiMenu2Line className="text-base" />
            ) : (
              <RiMenu3Line className="text-base" />
            )}
          </button>

          {/* Vendor Info */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-white bg-opacity-20 rounded-lg backdrop-blur-sm">
                <RiStore2Line className="text-white text-sm" />
              </div>
              <div className="text-white">
                <h2 className="font-bold text-sm tracking-wide truncate max-w-[150px]">{vendorName || 'My Restaurant'}</h2>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full animate-pulse ${
                    vendorStatus === 'active' ? 'bg-green-300' : 'bg-red-300'
                  }`}></div>
                  <span className="text-xs font-medium opacity-90">
                    {vendorStatus === 'active' ? 'Online • Active' : 'Offline • Inactive'}
                  </span>
                </div>
              </div>
            </div>

            {/* Toggle Switch */}
            <div className="flex items-center gap-2">
              <button
                onClick={toggleVendorStatus}
                disabled={isLoading}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-200 ${
                  vendorStatus === 'active' 
                    ? 'bg-green-300 hover:bg-green-200' 
                    : 'bg-gray-300 hover:bg-gray-200'
                } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer shadow-inner'}`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-all duration-200 shadow ${
                    vendorStatus === 'active' ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
              {isLoading && (
                <div className="w-3 h-3 border-t border-white border-solid rounded-full animate-spin"></div>
              )}
            </div>
          </div>
        </div>

        {/* Center Section - OPTIMAL SIZE WITHDRAWAL MESSAGE */}
        <div className="flex-1 mx-6 flex justify-center">
          <div className="w-full max-w-2xl">
            {/* PERFECT SIZE WITHDRAWAL MESSAGE */}
            <div className="relative group">
              {/* Main Container */}
              <div className="flex items-center justify-center gap-3 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-purple-500 to-indigo-600 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.01]">
                {/* Left Icon */}
                <div className="relative">
                  <RiBankCardLine className="text-white text-base drop-shadow" />
                  <div className="absolute -inset-1 bg-purple-300 rounded-full blur opacity-30"></div>
                </div>

                {/* Center Text */}
                <div className="text-center flex flex-col items-center px-2">
                  {/* Main Heading */}
                  <div className="flex items-center gap-2 mb-0.5">
                    <RiRefreshLine className="text-white text-sm animate-spin-slow" />
                    <h1 className="text-white font-bold text-sm tracking-wide uppercase">
                      Withdrawal Every
                    </h1>
                    <RiRefreshLine className="text-white text-sm animate-spin-slow reverse" />
                  </div>
                  
                  {/* Sub Heading */}
                  <div className="flex items-center gap-1.5">
                    <RiTimeLine className="text-white text-xs" />
                    <p className="text-white font-semibold text-sm">
                      <span className="text-purple-100 font-bold mx-1 text-sm bg-white bg-opacity-15 px-1.5 py-0.5 rounded">72</span>
                      Hours
                    </p>
                    <RiTimeLine className="text-white text-xs" />
                  </div>
                  
                  {/* Timer Display */}
                  <div className="mt-1 px-2 py-0.5 bg-white bg-opacity-15 rounded-full backdrop-blur-sm">
                    <p className="text-white text-xs font-medium">
                      Next: <span className="font-bold text-purple-100">24h 36m</span>
                    </p>
                  </div>
                </div>

                {/* Right Icon */}
                <div className="relative">
                  <RiWalletLine className="text-white text-base drop-shadow" />
                  <div className="absolute -inset-1 bg-indigo-300 rounded-full blur opacity-30"></div>
                </div>

                {/* Animated Border */}
                <div className="absolute inset-0 rounded-xl border border-purple-300 border-opacity-40"></div>
              </div>

              {/* Hover Info Card */}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-72 px-3 py-2 bg-gray-900 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 shadow-xl">
                <div className="text-center">
                  <h3 className="font-bold text-purple-300 text-sm mb-1">💡 Important Information</h3>
                  <p className="text-xs text-gray-200">
                    You can withdraw your earnings once every 72 hours. This ensures secure transaction processing.
                  </p>
                  <div className="mt-1.5 pt-1.5 border-t border-gray-700">
                    <p className="text-[10px] text-gray-300">
                      Last withdrawal: <span className="font-bold text-green-300">24 hours ago</span>
                    </p>
                    <p className="text-[10px] text-gray-300">
                      Next available: <span className="font-bold text-purple-300">24 hours from now</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Perfect Size */}
        <div className="flex items-center gap-3">
          {/* Notification Icon */}
          <div className="relative">
            <button 
              onClick={handleNotificationClick}
              className="p-2 rounded-xl bg-white bg-opacity-20 hover:bg-opacity-30 backdrop-blur-sm transition-all duration-200 text-white hover:scale-105 shadow-md relative"
              title={notificationCount > 0 ? `${notificationCount} unread notifications` : "No notifications"}
            >
              {notificationCount > 0 ? (
                <>
                  <RiNotification2Fill className="text-sm" />
                  {isPlayingNotificationSound && (
                    <div className="absolute -top-1 -right-1 w-4 h-4">
                      <div className="absolute inset-0 bg-red-500 rounded-full animate-ping"></div>
                    </div>
                  )}
                </>
              ) : (
                <RiNotification3Line className="text-sm" />
              )}
              
              {/* Notification Badge */}
              {notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold animate-pulse">
                  {notificationCount > 9 ? '9+' : notificationCount}
                </span>
              )}
            </button>
          </div>

          {/* Time Display */}
          <div className="flex flex-col items-end bg-white bg-opacity-10 backdrop-blur-sm rounded-lg px-3 py-1.5 border border-white border-opacity-20">
            <div className="text-white text-xs font-medium">{greeting}</div>
            <div className="text-white text-xs font-bold bg-white bg-opacity-15 px-1.5 py-0.5 rounded-full">
              🕒 {currentTime}
            </div>
          </div>

          {/* Fullscreen Toggle */}
          <button 
            onClick={toggleFullscreen}
            className="p-2 rounded-xl bg-white bg-opacity-20 hover:bg-opacity-30 backdrop-blur-sm transition-all duration-200 text-white hover:scale-105 shadow-md"
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          >
            {isFullscreen ? (
              <RiFullscreenExitLine className="text-sm" />
            ) : (
              <RiFullscreenLine className="text-sm" />
            )}
          </button>

          {/* Profile */}
          <div className="flex items-center gap-2.5 bg-white bg-opacity-10 backdrop-blur-sm rounded-lg px-2.5 py-1.5 border border-white border-opacity-20">
            <img
              className="rounded-lg w-7 h-7 object-cover border border-white border-opacity-25"
              src={VeggyfyLogo}
              alt="Vegiffy Logo"
            />
            <div className="text-right">
              <p className="text-xs font-bold text-white tracking-wide">Vegiffy</p>
              <p className="text-[10px] text-white opacity-80">Vendor Panel</p>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

// Custom animation styles
const styles = `
@keyframes spin-slow {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.animate-spin-slow {
  animation: spin-slow 4s linear infinite;
}

.animate-spin-slow.reverse {
  animation: spin-slow 4s linear infinite reverse;
}
`;

// Add styles to document
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.innerText = styles;
  document.head.appendChild(styleSheet);
}

export default Navbar;