import { useState, useEffect } from "react";
import { 
  RiMenu2Line, 
  RiMenu3Line, 
  RiFullscreenLine, 
  RiFullscreenExitLine,
  RiStore2Line,
  RiSunLine,
  RiMoonLine 
} from "react-icons/ri";
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

  useEffect(() => {
    const storedVendorId = localStorage.getItem('vendorId');
    const storedVendorData = localStorage.getItem('vendorData');
    
    if (storedVendorId) {
      setVendorId(storedVendorId);
      fetchVendorStatus(storedVendorId);
    }
    
    if (storedVendorData) {
      const vendorData = JSON.parse(storedVendorData);
      setVendorName(vendorData.restaurantName);
    }

    // Update time and greeting every minute
    updateTimeAndGreeting();
    const interval = setInterval(updateTimeAndGreeting, 60000);

    return () => clearInterval(interval);
  }, []);

  const updateTimeAndGreeting = () => {
    const now = new Date();
    const hours = now.getHours();
    
    // Set greeting based on time
    if (hours < 12) setGreeting("🌅 Good Morning");
    else if (hours < 17) setGreeting("☀️ Good Afternoon");
    else setGreeting("🌙 Good Evening");

    // Format time
    const timeString = now.toLocaleTimeString('en-IN', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
    setCurrentTime(timeString);
  };

  const fetchVendorStatus = async (id) => {
    try {
      const response = await axios.get(`http://31.97.206.144:5051/api/vendor/vendorstatus/${id}`);
      if (response.data.success) {
        setVendorStatus(response.data.vendor.status);
      }
    } catch (error) {
      console.error("Error fetching vendor status:", error);
    }
  };

  const toggleVendorStatus = async () => {
    if (!vendorId) return;
    
    setIsLoading(true);
    const newStatus = vendorStatus === 'active' ? 'inactive' : 'active';
    
    try {
      const response = await axios.put(`http://31.97.206.144:5051/api/vendor/vendorstatus/${vendorId}`, {
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

  const getStatusMessage = () => {
    const messages = {
      active: [
        "🍽️ Ready to serve delicious food!",
        "🚀 Taking orders and growing business!",
        "⭐ Delivering happiness to customers!",
        "🔥 Hot orders coming through!",
        "🎯 Ready for today's challenges!"
      ],
      inactive: [
        "💤 Taking a quick break",
        "⚡ Will be back soon with more energy!",
        "🕒 Planning something special for you!",
        "🌟 Preparing for a grand reopening!",
        "🍃 Restaurant is currently resting"
      ]
    };
    
    const statusMessages = messages[vendorStatus] || messages.inactive;
    return statusMessages[Math.floor(Math.random() * statusMessages.length)];
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

        {/* Vendor Info & Status */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-white bg-opacity-20 rounded-xl backdrop-blur-sm">
              <RiStore2Line className="text-white text-lg" />
            </div>
            <div className="text-white">
              <h2 className="font-bold text-sm">{vendorName || 'My Restaurant'}</h2>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full animate-pulse ${
                  vendorStatus === 'active' ? 'bg-green-300' : 'bg-red-300'
                }`}></div>
                <span className="text-xs font-medium opacity-90">
                  {vendorStatus === 'active' ? 'Online' : 'Offline'}
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

      {/* Center Section */}
      <div className="flex flex-col items-center justify-center flex-1 mx-8">
        <div className="text-center space-y-1">
          <div className="flex items-center justify-center gap-3">
            <span className="text-white text-sm font-medium opacity-90">{greeting}</span>
            <span className="text-white text-xs bg-white bg-opacity-20 px-2 py-1 rounded-full">
              {currentTime}
            </span>
          </div>
          
          {/* Withdrawal Message Line - Added Here */}
          <p className="text-white text-xs font-medium bg-yellow-500 bg-opacity-30 px-3 py-1 rounded-full backdrop-blur-sm">
            ⏳ Withdrawals can be done every 48 hours
          </p>
          
          <p className="text-white text-xs font-semibold bg-white bg-opacity-10 px-4 py-2 rounded-full backdrop-blur-sm border border-white border-opacity-20">
            {getStatusMessage()}
          </p>
        </div>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-3">
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
            <p className="text-sm font-bold text-white">Vegiffyy</p>
            <p className="text-xs text-white opacity-80">Vendor Panel</p>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;