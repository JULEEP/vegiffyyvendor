import React, { useState, useEffect } from "react";
import { FaChevronDown } from "react-icons/fa";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

const Sidebar = ({ isCollapsed, isMobile }) => {
  const [openDropdown, setOpenDropdown] = useState(null);
  const [vendorData, setVendorData] = useState({
    restaurantName: "",
    email: "",
    mobile: ""
  });
  const [showPlanPopup, setShowPlanPopup] = useState(false);
  const [hasActivePlan, setHasActivePlan] = useState(null);
  const [planLoading, setPlanLoading] = useState(true);
  const [planDetails, setPlanDetails] = useState(null);
  const [notificationCount, setNotificationCount] = useState(0); // ✅ Notification count state
  
  const location = useLocation();
  const navigate = useNavigate();

  // ✅ Load vendor data from localStorage
  useEffect(() => {
    const loadVendorData = () => {
      try {
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

  // ✅ Check vendor plan
  useEffect(() => {
    checkVendorPlan();
    fetchNotificationCount(); // ✅ Fetch notification count
  }, [location.pathname]);

  // ✅ Fetch notification count
  const fetchNotificationCount = async () => {
    try {
      const vendorId = localStorage.getItem("vendorId");
      if (!vendorId) return;

      const response = await fetch(`https://api.vegiffyy.com/api/vendor/notification/${vendorId}`);
      const result = await response.json();
      
      if (result.success) {
        const unreadCount = result.data?.filter(n => !n.isRead)?.length || 0;
        setNotificationCount(unreadCount);
      }
    } catch (error) {
      console.error('Error fetching notification count:', error);
    }
  };

  const checkVendorPlan = async () => {
    try {
      setPlanLoading(true);
      const vendorId = localStorage.getItem("vendorId");
      
      if (!vendorId) {
        setHasActivePlan(false);
        setPlanLoading(false);
        return;
      }

      // ✅ Paths that don't need plan check
      const exemptPaths = [
        "/dashboard",
        "/vendorpay", 
        "/myplans",
        "/vendor-login",
        "/vendor-register",
        "/notification" // ✅ Notification page exempt
      ];

      // Check if current path is exempt
      const isExemptPath = exemptPaths.some(path => location.pathname.startsWith(path));
      
      if (isExemptPath) {
        setPlanLoading(false);
        return;
      }

      // Make API call to check vendor plan
      const response = await axios.get(
        `https://api.vegiffyy.com/api/vendor/myplan/${vendorId}`
      );

      console.log("Plan check response:", response.data);

      if (response.data.success && response.data.data) {
        const planData = response.data.data;
        
        // Check if plan is purchased and not expired
        const isPurchased = planData.isPurchased === true;
        const isNotExpired = new Date(planData.expiryDate) > new Date();
        
        if (isPurchased && isNotExpired) {
          setHasActivePlan(true);
          setPlanDetails(planData);
          setShowPlanPopup(false);
        } else {
          setHasActivePlan(false);
          // Show popup only if not on payment page
          if (location.pathname !== "/vendorpay") {
            setShowPlanPopup(true);
          }
        }
      } else {
        setHasActivePlan(false);
        if (location.pathname !== "/vendorpay") {
          setShowPlanPopup(true);
        }
      }
    } catch (error) {
      console.error("Error checking vendor plan:", error);
      setHasActivePlan(false);
    } finally {
      setPlanLoading(false);
    }
  };

  const toggleDropdown = (name) => {
    setOpenDropdown(openDropdown === name ? null : name);
  };

  // ✅ Handle menu clicks with plan check
  const handleMenuClick = (itemPath, itemAction) => {
    if (itemAction) {
      itemAction();
      return;
    }

    // ✅ Paths that don't need plan
    const exemptPaths = [
      "/dashboard",
      "/vendorpay", 
      "/myplans",
      "/vendor-login",
      "/vendor-register",
      "/notification" // ✅ Notification page exempt
    ];

    // Check if path is exempt
    const isExemptPath = exemptPaths.some(path => itemPath.startsWith(path));
    
    if (isExemptPath) {
      navigate(itemPath);
      return;
    }

    // ✅ Protected paths that require active plan
    const protectedPaths = [
      "/categoryform",
      "/categorylist",
      "/add-product",
      "/productlist",
      "/allorders",
      "/pendingorders",
      "/completedorders",
      "/mywallet",
      "/myprofile",
      "/comission",
      "/account",
      "/users",
      "/support",
      "/aboutus"
    ];

    // Check if path is protected
    const isProtectedPath = protectedPaths.some(path => itemPath.startsWith(path));
    
    if (isProtectedPath && hasActivePlan === false) {
      setShowPlanPopup(true);
      return;
    }

    navigate(itemPath);
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

  // ✅ Plan Required Popup
  const PlanRequiredPopup = () => {
    if (!showPlanPopup) return null;

    return (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-2xl max-w-sm w-full animate-popupIn">
          {/* Header */}
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-emerald-500 rounded-lg flex items-center justify-center">
                  <i className="ri-lock-line text-white"></i>
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-800">
                    Plan Required
                  </h3>
                  <p className="text-gray-500 text-xs">
                    Unlock restaurant features
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowPlanPopup(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <i className="ri-close-line text-lg"></i>
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="p-4">
            <p className="text-gray-600 text-sm mb-3">
              You need to purchase a restaurant plan to access this section.
            </p>
            
            {/* Benefits */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              <div className="flex items-center p-2 bg-green-50 rounded-lg">
                <i className="ri-store-line text-green-500 mr-2"></i>
                <span className="text-gray-700 text-xs">Manage Restaurant</span>
              </div>
              <div className="flex items-center p-2 bg-green-50 rounded-lg">
                <i className="ri-shopping-bag-line text-green-500 mr-2"></i>
                <span className="text-gray-700 text-xs">Add Products</span>
              </div>
              <div className="flex items-center p-2 bg-green-50 rounded-lg">
                <i className="ri-money-rupee-circle-line text-green-500 mr-2"></i>
                <span className="text-gray-700 text-xs">Receive Payments</span>
              </div>
              <div className="flex items-center p-2 bg-green-50 rounded-lg">
                <i className="ri-bar-chart-line text-green-500 mr-2"></i>
                <span className="text-gray-700 text-xs">View Analytics</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-100">
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowPlanPopup(false);
                  navigate("/vendorpay");
                }}
                className="flex-1 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium rounded-lg hover:opacity-90 transition-all duration-200 text-sm"
              >
                Buy Plan
              </button>
              <button
                onClick={() => {
                  setShowPlanPopup(false);
                  navigate("/myplans");
                }}
                className="flex-1 py-2.5 border border-gray-300 text-gray-600 font-medium rounded-lg hover:bg-gray-50 transition-all duration-200 text-sm"
              >
                View Plans
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ✅ Plan Status Indicator
  const PlanStatusIndicator = () => {
    if (isCollapsed && !isMobile) return null;

    if (planLoading) {
      return (
        <div className="px-3 py-1.5 mb-3 mx-3 bg-blue-50 border border-blue-100 rounded-lg">
          <div className="flex items-center justify-center">
            <div className="w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mr-2"></div>
            <span className="text-blue-500 text-xs">Checking Plan...</span>
          </div>
        </div>
      );
    }

    if (hasActivePlan && planDetails) {
      const daysRemaining = Math.ceil(
        (new Date(planDetails.expiryDate) - new Date()) / (1000 * 60 * 60 * 24)
      );

      return (
        <div className="px-3 py-1.5 mb-3 mx-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <i className="ri-check-line text-green-500 mr-2"></i>
              <div>
                <p className="text-green-700 text-xs font-medium">Active Plan</p>
                <p className="text-green-600 text-xs">{daysRemaining} days left</p>
              </div>
            </div>
            <button
              onClick={() => navigate("/myplans")}
              className="text-green-600 hover:text-green-800 text-xs"
            >
              View
            </button>
          </div>
        </div>
      );
    }

    if (hasActivePlan === false) {
      return (
        <div className="px-3 py-1.5 mb-3 mx-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <i className="ri-alert-line text-yellow-500 mr-2"></i>
              <div>
                <p className="text-yellow-700 text-xs font-medium">Plan Required</p>
                <p className="text-yellow-600 text-xs">Purchase to unlock features</p>
              </div>
            </div>
            <button
              onClick={() => navigate("/vendorpay")}
              className="text-yellow-600 hover:text-yellow-800 text-xs"
            >
              Buy
            </button>
          </div>
        </div>
      );
    }

    return null;
  };

  // ✅ Vendor menu structure - Notification section added
  const vendorElements = [
    {
      icon: <i className="ri-home-fill text-white"></i>,
      name: "Dashboard",
      path: "/dashboard",
    },
    // ✅ NEW NOTIFICATION MENU ITEM
    {
      icon: (
        <div className="relative">
          <i className="ri-notification-3-fill text-white"></i>
          {notificationCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-3 w-3 items-center justify-center rounded-full bg-red-500 text-white text-[8px] font-bold animate-pulse"></span>
          )}
        </div>
      ),
      name: "Notifications",
      path: "/notification",
      badge: notificationCount > 0 ? notificationCount : null
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
      icon: <i className="ri-wallet-3-fill text-white"></i>,
      name: "Pay Joining Fee",
      dropdown: [
        { name: "Pay", path: "/vendorpay" },
        { name: "My Paid Plan", path: "/myplans" },
      ],
    },
    {
      icon: <i className="ri-user-3-fill text-white"></i>,
      name: "My Profile",
      path: "/myprofile",
    },
    {
      icon: <i className="ri-money-dollar-circle-fill text-white"></i>,
      name: "My Commission",
      path: "/comission",
    },
    {
      icon: <i className="ri-bank-fill text-white"></i>,
      name: "My Account",
      path: "/account",
    },
    {
      icon: <i className="ri-user-line text-white"></i>,
      name: "Users",
      path: "/users",
    },
    {
      icon: <i className="ri-chat-3-fill text-white"></i>,
      name: "Support",
      path: "/support",
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
    <>
      <PlanRequiredPopup />

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
              <span>Vegiffyy Green Partner</span>
            </div>
          )}
        </div>

        {/* Vendor Profile Section - Fixed */}
        <VendorProfileSection />

        {/* Plan Status Indicator */}
        {!isCollapsed && <PlanStatusIndicator />}

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
                            <button
                              onClick={() => handleMenuClick(subItem.path)}
                              className={`w-full text-left flex items-center space-x-2 py-2 px-3 rounded-md transition-all duration-200 ${location.pathname === subItem.path
                                  ? "bg-green-100 text-green-700 font-medium"
                                  : "text-gray-600 hover:text-green-600 hover:bg-green-50"
                                }`}
                            >
                              <span className="text-green-500">•</span>
                              <span>{subItem.name}</span>
                            </button>
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
                  <button
                    onClick={() => handleMenuClick(item.path)}
                    className={`w-full text-left flex items-center py-3 px-3 rounded-lg text-sm font-semibold cursor-pointer transition-all duration-200 ${location.pathname === item.path
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
                      {/* Show notification badge if exists */}
                      {item.badge && item.badge > 0 && (
                        <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white text-xs font-bold animate-pulse">
                          {item.badge > 9 ? '9+' : item.badge}
                        </span>
                      )}
                    </span>
                  </button>
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
          
          @keyframes popupIn {
            from {
              opacity: 0;
              transform: scale(0.95);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }
          .animate-popupIn {
            animation: popupIn 0.2s ease-out;
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
    </>
  );
};

export default Sidebar;