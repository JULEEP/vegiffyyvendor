import { useState, useEffect } from "react";
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
  RiNotification3Line, // ✅ New notification icon
  RiNotification2Fill // ✅ New filled notification icon
} from "react-icons/ri";
import { useNavigate } from "react-router-dom"; // ✅ Add navigation
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
  const [notificationCount, setNotificationCount] = useState(0); // ✅ Notification count state
  const navigate = useNavigate(); // ✅ For navigation

  useEffect(() => {
    const storedVendorId = localStorage.getItem('vendorId');
    const storedVendorData = localStorage.getItem('vendorData');
    
    if (storedVendorId) {
      setVendorId(storedVendorId);
      fetchVendorStatus(storedVendorId);
      fetchNotificationCount(storedVendorId); // ✅ Fetch notification count
    }
    
    if (storedVendorData) {
      const vendorData = JSON.parse(storedVendorData);
      setVendorName(vendorData.restaurantName);
    }

    updateTimeAndGreeting();
    const interval = setInterval(updateTimeAndGreeting, 60000);

    return () => clearInterval(interval);
  }, []);

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

  // ✅ Fetch notification count function
  const fetchNotificationCount = async (vendorId) => {
    try {
      const response = await fetch(`https://api.vegiffyy.com/api/vendor/notification/${vendorId}`);
      const result = await response.json();
      
      if (result.success) {
        // Count unread notifications or total count
        const unreadCount = result.data?.filter(n => !n.isRead)?.length || 0;
        const totalCount = result.data?.length || 0;
        setNotificationCount(unreadCount); // You can change to totalCount if you want total count
      }
    } catch (error) {
      console.error('Error fetching notification count:', error);
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

  // ✅ Navigate to notifications page
  const handleNotificationClick = () => {
    navigate('/notification'); // Adjust the route according to your setup
  };

  return (
    <nav className="bg-gradient-to-r from-green-600 via-green-700 to-emerald-600 border-b border-green-500 sticky top-0 w-full px-6 py-3 flex items-center justify-between shadow-2xl z-50">
      {/* Left Side */}
      <div className="flex items-center gap-4">
        {/* Sidebar Toggle */}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)} 
          className="p-2 rounded-xl bg-white bg-opacity-20 hover:bg-opacity-30 backdrop-blur-sm transition-all duration-300 text-white hover:scale-105 shadow-lg"
        >
          {isCollapsed ? (
            <RiMenu2Line className="text-xl" />
          ) : (
            <RiMenu3Line className="text-xl" />
          )}
        </button>

        {/* Vendor Info */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-white bg-opacity-20 rounded-xl backdrop-blur-sm">
              <RiStore2Line className="text-white text-lg" />
            </div>
            <div className="text-white">
              <h2 className="font-bold text-sm tracking-wide">{vendorName || 'My Restaurant'}</h2>
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
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 ${
                vendorStatus === 'active' 
                  ? 'bg-green-300 hover:bg-green-200' 
                  : 'bg-gray-300 hover:bg-gray-200'
              } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer shadow-inner'}`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-all duration-300 shadow-lg ${
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

      {/* Center Section - ONLY WITHDRAWAL MESSAGE */}
      <div className="flex-1 mx-8 flex justify-center">
        <div className="w-full max-w-2xl">
          {/* MEGA WITHDRAWAL MESSAGE */}
          <div className="relative group">
            {/* Main Container - PURPLE THEME */}
            <div className="flex items-center justify-center gap-4 px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-600 via-purple-500 to-indigo-600 shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:scale-[1.01] animate-pulse-glow">
              {/* Left Decorative Element */}
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                <div className="relative">
                  <RiBankCardLine className="text-white text-3xl drop-shadow-lg" />
                  <div className="absolute -inset-2 bg-purple-300 rounded-full blur opacity-30"></div>
                </div>
              </div>

              {/* Center Text - BIG and BOLD */}
              <div className="text-center flex flex-col items-center">
                {/* Main Heading */}
                <div className="flex items-center gap-3 mb-1">
                  <RiRefreshLine className="text-white text-2xl animate-spin-slow" />
                  <h1 className="text-white font-extrabold text-2xl tracking-wider uppercase font-montserrat">
                    Withdrawal Policy
                  </h1>
                  <RiRefreshLine className="text-white text-2xl animate-spin-slow reverse" />
                </div>
                
                {/* Sub Heading */}
                <div className="flex items-center gap-2">
                  <RiTimeLine className="text-white text-lg" />
                  <p className="text-white font-bold text-xl tracking-wide font-poppins">
                    Withdrawals can be done every
                    <span className="text-purple-100 font-black mx-2 text-2xl bg-white bg-opacity-20 px-2 py-1 rounded-lg">48</span>
                    hours
                  </p>
                  <RiTimeLine className="text-white text-lg" />
                </div>
                
                {/* Timer Display */}
                <div className="mt-2 px-4 py-1 bg-white bg-opacity-20 rounded-full backdrop-blur-sm">
                  <p className="text-white text-sm font-medium">
                    ⏰ Time remaining for next withdrawal: <span className="font-bold text-purple-100">24:36:15</span>
                  </p>
                </div>
              </div>

              {/* Right Decorative Element */}
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                <div className="relative">
                  <RiWalletLine className="text-white text-3xl drop-shadow-lg" />
                  <div className="absolute -inset-2 bg-indigo-300 rounded-full blur opacity-30"></div>
                </div>
              </div>

              {/* Animated Border */}
              <div className="absolute inset-0 rounded-2xl border-2 border-purple-300 border-opacity-50 animate-border-pulse"></div>
              
              {/* Glow Effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-2xl blur-xl opacity-30 -z-10"></div>
            </div>

            {/* Hover Info Card */}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-4 w-80 px-4 py-3 bg-gray-900 text-white rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10 shadow-2xl">
              <div className="text-center">
                <h3 className="font-bold text-purple-300 mb-1">💡 Important Information</h3>
                <p className="text-sm text-gray-200">
                  You can withdraw your earnings once every 48 hours. This ensures secure transaction processing and helps maintain platform stability.
                </p>
                <div className="mt-2 pt-2 border-t border-gray-700">
                  <p className="text-xs text-gray-300">
                    Last withdrawal: <span className="font-bold text-green-300">24 hours ago</span>
                  </p>
                  <p className="text-xs text-gray-300">
                    Next available: <span className="font-bold text-purple-300">24 hours from now</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-3">
        {/* ✅ Notification Icon with Badge */}
        <div className="relative">
          <button 
            onClick={handleNotificationClick}
            className="p-2 rounded-xl bg-white bg-opacity-20 hover:bg-opacity-30 backdrop-blur-sm transition-all duration-300 text-white hover:scale-105 shadow-lg relative"
            title={notificationCount > 0 ? `${notificationCount} unread notifications` : "No notifications"}
          >
            {notificationCount > 0 ? (
              <RiNotification2Fill className="text-lg" />
            ) : (
              <RiNotification3Line className="text-lg" />
            )}
            
            {/* Notification Badge */}
            {notificationCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white text-xs font-bold animate-pulse">
                {notificationCount > 9 ? '9+' : notificationCount}
              </span>
            )}
          </button>
        </div>

        {/* Time Display */}
        <div className="flex flex-col items-end bg-white bg-opacity-10 backdrop-blur-sm rounded-xl px-4 py-2 border border-white border-opacity-20">
          <div className="text-white text-sm font-medium">{greeting}</div>
          <div className="text-white text-xs font-bold bg-white bg-opacity-20 px-2 py-1 rounded-full">
            🕒 {currentTime}
          </div>
        </div>

        {/* Fullscreen Toggle */}
        <button 
          onClick={toggleFullscreen}
          className="p-2 rounded-xl bg-white bg-opacity-20 hover:bg-opacity-30 backdrop-blur-sm transition-all duration-300 text-white hover:scale-105 shadow-lg"
          title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
        >
          {isFullscreen ? (
            <RiFullscreenExitLine className="text-lg" />
          ) : (
            <RiFullscreenLine className="text-lg" />
          )}
        </button>

        {/* Profile */}
        <div className="flex items-center gap-3 bg-white bg-opacity-20 backdrop-blur-sm rounded-xl px-3 py-2 border border-white border-opacity-20">
          <img
            className="rounded-lg w-8 h-8 object-cover border-2 border-white border-opacity-30"
            src={VeggyfyLogo}
            alt="Vegiffy Logo"
          />
          <div className="text-right">
            <p className="text-sm font-bold text-white tracking-wide">Vegiffyy</p>
            <p className="text-xs text-white opacity-80">Vendor Panel</p>
          </div>
        </div>
      </div>
    </nav>
  );
};

// Custom animation styles for purple theme
const styles = `
@keyframes pulse-glow {
  0%, 100% { 
    opacity: 1;
    box-shadow: 0 0 30px rgba(168, 85, 247, 0.5),
                0 0 60px rgba(168, 85, 247, 0.3),
                0 0 90px rgba(168, 85, 247, 0.1);
  }
  50% { 
    opacity: 0.9;
    box-shadow: 0 0 40px rgba(168, 85, 247, 0.6),
                0 0 80px rgba(168, 85, 247, 0.4),
                0 0 120px rgba(168, 85, 247, 0.2);
  }
}

@keyframes spin-slow {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes border-pulse {
  0%, 100% { 
    border-color: rgba(216, 180, 254, 0.5);
    box-shadow: 0 0 0 0 rgba(216, 180, 254, 0.7);
  }
  50% { 
    border-color: rgba(192, 132, 252, 0.8);
    box-shadow: 0 0 0 10px rgba(192, 132, 252, 0);
  }
}

.animate-pulse-glow {
  animation: pulse-glow 3s infinite ease-in-out;
}

.animate-spin-slow {
  animation: spin-slow 4s linear infinite;
}

.animate-spin-slow.reverse {
  animation: spin-slow 4s linear infinite reverse;
}

.animate-border-pulse {
  animation: border-pulse 2s infinite;
}

.font-montserrat {
  font-family: 'Montserrat', sans-serif;
}

.font-poppins {
  font-family: 'Poppins', sans-serif;
}
`;

// Add styles to document
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.innerText = styles;
  document.head.appendChild(styleSheet);
}

export default Navbar;