import React, { useState, useEffect } from "react";
import { FaChevronDown } from "react-icons/fa";
import { Link, useLocation } from "react-router-dom";

const Sidebar = ({ isCollapsed, isMobile }) => {
  const [openDropdown, setOpenDropdown] = useState(null);
  const [vendorData, setVendorData] = useState({
    restaurantName: "",
    email: "",
    mobile: ""
  });

  // ✅ Load vendor data from localStorage
  useEffect(() => {
    const loadVendorData = () => {
      try {
        // Try to get from vendorData first
        const storedVendorData = localStorage.getItem('vendorData');
        if (storedVendorData) {
          const vendor = JSON.parse(storedVendorData);
          setVendorData({
            restaurantName: vendor.restaurantName || "Restaurant",
            email: vendor.email || "",
            mobile: vendor.mobile || ""
          });
          return;
        }

        // Fallback to userInfo for compatibility
        const userInfo = localStorage.getItem('userInfo');
        if (userInfo) {
          const user = JSON.parse(userInfo);
          setVendorData({
            restaurantName: user.fullName || "Restaurant",
            email: user.email || "",
            mobile: user.mobile || ""
          });
        }
      } catch (error) {
        console.error("Error loading vendor data:", error);
        setVendorData({
          restaurantName: "Restaurant",
          email: "",
          mobile: ""
        });
      }
    };

    loadVendorData();
  }, []);

  const location = useLocation();

  const toggleDropdown = (name) => {
    setOpenDropdown(openDropdown === name ? null : name);
  };

  // ✅ Logout function
  const handleLogout = () => {
    localStorage.removeItem("vendorId");
    localStorage.removeItem("vendorData");
    localStorage.removeItem("userInfo");
    localStorage.removeItem("authToken");
    alert("Logout successful");
    window.location.href = "/";
  };

  // ✅ Vendor specific menu structure
  const vendorElements = [
    {
      icon: <i className="ri-home-fill text-white"></i>,
      name: "Dashboard",
      path: "/dashboard",
    },
    {
      icon: <i className="ri-folder-fill text-white"></i>,
      name: "Categories",
      dropdown: [
        { name: "Add Categories", path: "/categoryform" },
        { name: "All Categories", path: "/categorylist" },
      ],
    },
    {
      icon: <i className="ri-shopping-bag-fill text-white"></i>,
      name: "Products",
      dropdown: [
        { name: "Add Product", path: "/add-product" },
        { name: "All Products", path: "/productlist" },
      ],
    },
    {
      icon: <i className="ri-calendar-check-fill text-white"></i>,
      name: "Orders",
      dropdown: [
        { name: "All Orders", path: "/allorders" },
        { name: "Pending Orders", path: "/pendingorders" },
        { name: "Completed Orders", path: "/completedorders" },
      ],
    },
    {
      icon: <i className="ri-wallet-3-fill text-white"></i>,
      name: "My Wallet",
      path: "/mywallet",
    },
    {
      icon: <i className="ri-wallet-3-fill text-white"></i>, // Payment/wallet icon
      name: "Pay Joining Fee",
      dropdown: [
        { name: "Pay", path: "/vendorpay" }, // Shows payment history or wallet transactions
        { name: "My Paid Plan", path: "/myplans" }, // Shows payment history or wallet transactions
      ],
    },
    {
      icon: <i className="ri-user-3-fill text-white"></i>,
      name: "My Profile",
      path: "/myprofile",
    },
    {
      icon: <i className="ri-user-line text-white"></i>,  // You can choose another icon from the Remix icon library
      name: "Users",  // Name of the section
      path: "/users",  // The route or path for this section
    },
    {
      icon: <i className="ri-chat-3-fill text-white"></i>, // You can change the icon based on your preference
      name: "Support",
      path: "/support", // This path should lead to your Support page
    },
    {
      icon: <i className="ri-information-fill text-white"></i>,
      name: "About Us",
      path: "/aboutus",
    },
    {
      icon: <i className="ri-logout-box-fill text-white"></i>,
      name: "Logout",
      action: handleLogout,
    },
  ];

  // ✅ Vendor profile section
  const VendorProfileSection = () => {
    if (isCollapsed && !isMobile) return null;

    return (
      <div className="p-4 border-b border-green-300/30 bg-white/80 backdrop-blur-sm sticky top-0 z-20">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
            <i className="ri-store-fill text-white text-lg"></i>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-gray-800 font-semibold text-sm truncate">
              {vendorData.restaurantName}
            </p>
            <p className="text-green-600 text-xs truncate font-medium">
              {vendorData.email}
            </p>
            {vendorData.mobile && (
              <p className="text-gray-500 text-xs truncate">
                📱 {vendorData.mobile}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      className={`transition-all duration-300 relative ${isMobile
        ? isCollapsed
          ? "w-0"
          : "w-64"
        : isCollapsed
          ? "w-16"
          : "w-64"
        } h-screen flex flex-col bg-gradient-to-b from-green-50 to-emerald-50 text-gray-800 border-r border-green-200 overflow-hidden`}
    >
      {/* Floating Emojis */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-float"
            style={{
              left: `${Math.random() * 90 + 5}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${15 + Math.random() * 10}s`,
              fontSize: `${16 + Math.random() * 12}px`,
            }}
          >
            {['🥦', '🍎', '🥑', '🍓', '🥬', '🍋', '🍇', '🌽'][i]}
          </div>
        ))}
      </div>

      {/* Header - Fixed */}
      <div className="sticky top-0 p-4 font-bold text-gray-800 flex justify-center text-xl border-b border-green-300/30 bg-white/80 backdrop-blur-sm z-30 shrink-0">
        {isCollapsed && !isMobile ? (
          <i className="ri-store-line text-2xl text-green-600"></i>
        ) : (
          <div className="flex items-center gap-2">
            <i className="ri-store-line text-green-600"></i>
            <span>Vendor Dashboard</span>
          </div>
        )}
      </div>

      {/* Vendor Profile Section - Fixed */}
      <VendorProfileSection />

      {/* Navigation - Scrollable */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
        <nav
          className={`flex flex-col ${isCollapsed && !isMobile ? "items-center" : "px-3"
            } py-4 space-y-2`}
        >
          {vendorElements.map((item, idx) => (
            <div key={idx} className="w-full">
              {item.dropdown ? (
                <>
                  <div
                    onClick={() => toggleDropdown(item.name)}
                    className={`flex items-center py-3 px-3 rounded-lg text-sm font-semibold cursor-pointer transition-all duration-200 ${location.pathname === item.path
                      ? "bg-green-500 text-white shadow-md"
                      : "bg-white/70 hover:bg-white text-gray-700 hover:text-green-600 border border-green-200/50 hover:border-green-300"
                      }`}
                  >
                    <span className="text-lg">{item.icon}</span>
                    <span
                      className={`ml-3 ${isCollapsed && !isMobile ? "hidden" : "block"
                        }`}
                    >
                      {item.name}
                    </span>
                    {!isCollapsed && (
                      <FaChevronDown
                        className={`ml-auto transition-transform duration-200 text-xs ${openDropdown === item.name ? "rotate-180" : "rotate-0"
                          }`}
                      />
                    )}
                  </div>
                  {!isCollapsed && openDropdown === item.name && (
                    <ul className="ml-4 mt-2 text-sm space-y-1 bg-white/80 rounded-lg p-2 border border-green-200/50">
                      {item.dropdown.map((subItem, subIdx) => (
                        <li key={subIdx}>
                          <Link
                            to={subItem.path}
                            onClick={() => setOpenDropdown(null)}
                            className={`flex items-center space-x-2 py-2 px-3 rounded-md transition-all duration-200 ${location.pathname === subItem.path
                              ? "bg-green-100 text-green-700 font-medium"
                              : "text-gray-600 hover:text-green-600 hover:bg-green-50"
                              }`}
                          >
                            <span className="text-green-500">•</span>
                            <span>{subItem.name}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              ) : item.action ? (
                // ✅ For logout (with action)
                <div
                  onClick={item.action}
                  className={`flex items-center py-3 px-3 rounded-lg text-sm font-semibold cursor-pointer transition-all duration-200 bg-white/70 hover:bg-white text-gray-700 hover:text-red-600 border border-green-200/50 hover:border-red-300`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span
                    className={`ml-3 ${isCollapsed && !isMobile ? "hidden" : "block"
                      }`}
                  >
                    {item.name}
                  </span>
                </div>
              ) : (
                // ✅ For normal links (with path)
                <Link
                  to={item.path}
                  className={`flex items-center py-3 px-3 rounded-lg text-sm font-semibold cursor-pointer transition-all duration-200 ${location.pathname === item.path
                    ? "bg-green-500 text-white shadow-md"
                    : "bg-white/70 hover:bg-white text-gray-700 hover:text-green-600 border border-green-200/50 hover:border-green-300"
                    }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span
                    className={`ml-3 ${isCollapsed && !isMobile ? "hidden" : "block"
                      }`}
                  >
                    {item.name}
                  </span>
                </Link>
              )}
            </div>
          ))}
        </nav>
      </div>

      {/* Footer - Fixed */}
      {!isCollapsed && (
        <div className="sticky bottom-0 p-4 border-t border-green-300/30 bg-white/80 backdrop-blur-sm shrink-0">
          <div className="text-center">
            <p className="text-green-600 text-sm font-semibold">
              Need Help?
            </p>
            <p className="text-gray-600 text-xs mt-1">
              Contact Support: vendor@vegiffyy.com
            </p>
            <div className="flex justify-center space-x-3 mt-2">
              <button className="text-gray-500 hover:text-green-600 transition-all duration-200 hover:scale-110">
                <i className="ri-question-line"></i>
              </button>
              <button className="text-gray-500 hover:text-green-600 transition-all duration-200 hover:scale-110">
                <i className="ri-customer-service-2-line"></i>
              </button>
              <button className="text-gray-500 hover:text-green-600 transition-all duration-200 hover:scale-110">
                <i className="ri-information-line"></i>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom CSS for scrolling and animations */}
      <style jsx>{`
        @keyframes float {
          0% {
            transform: translateY(100vh) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 0.7;
          }
          90% {
            opacity: 0.7;
          }
          100% {
            transform: translateY(-100px) rotate(360deg);
            opacity: 0;
          }
        }
        .animate-float {
          animation: float linear infinite;
        }
        
        /* Custom scrollbar styles */
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(34, 197, 94, 0.3) transparent;
        }
        
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(34, 197, 94, 0.3);
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(34, 197, 94, 0.5);
        }
      `}</style>
    </div>
  );
};

export default Sidebar;