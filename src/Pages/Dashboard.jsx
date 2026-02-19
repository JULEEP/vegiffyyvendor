import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { 
  FaShoppingCart, 
  FaCheckCircle, 
  FaBox, 
  FaRupeeSign, 
  FaClock, 
  FaArrowUp, 
  FaArrowDown,
  FaEye,
  FaUtensils,
  FaTimes,
  FaCheck,
  FaTimesCircle,
  FaUser,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaReceipt,
  FaCreditCard,
  FaCalendarAlt,
  FaStar,
  FaBell,
  FaExclamationTriangle,
  FaInfoCircle,
  FaTruck,
  FaLock
} from "react-icons/fa";

const Dashboard = () => {
  const [timeframe, setTimeframe] = useState("Today");
  const [stats, setStats] = useState({
    totalOrders: 0,
    completedOrders: 0,
    orderAmount: 0,
    totalProducts: 0,
    pendingOrders: 0,
    revenue: 0
  });
  const [salesData, setSalesData] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [orders, setOrders] = useState([]);
  const [pendingOrders, setPendingOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [productsData, setProductsData] = useState([]);
  
  // 🔥 NEW: Plan Check States
  const [hasActivePlan, setHasActivePlan] = useState(null);
  const [planLoading, setPlanLoading] = useState(true);
  const [showPlanPopup, setShowPlanPopup] = useState(false);
  const [planDetails, setPlanDetails] = useState(null);
  
  // Buffer State
  const [showBuffer, setShowBuffer] = useState(false);
  const [bufferOrders, setBufferOrders] = useState([]);
  const [currentBufferOrder, setCurrentBufferOrder] = useState(null);
  const [isPlayingSound, setIsPlayingSound] = useState(false);
  const [isBufferManuallyClosed, setIsBufferManuallyClosed] = useState(false);
  const [hasNewOrders, setHasNewOrders] = useState(false);

  // Error Popup State
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [errorDetails, setErrorDetails] = useState(null);
  const [isProcessingOrder, setIsProcessingOrder] = useState(false);

  const navigate = useNavigate();
  const vendorId = localStorage.getItem("vendorId");
  const audioRef = useRef(null);
  const bufferIntervalRef = useRef(null);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  // 🔥 NEW: Check Vendor Plan
  useEffect(() => {
    checkVendorPlan();
  }, []);

  const checkVendorPlan = async () => {
    try {
      setPlanLoading(true);
      
      if (!vendorId) {
        setHasActivePlan(false);
        setPlanLoading(false);
        setShowPlanPopup(true); // Show popup if no vendor ID
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
          setShowPlanPopup(true); // Show popup if no active plan
        }
      } else {
        setHasActivePlan(false);
        setShowPlanPopup(true); // Show popup if no plan data
      }
    } catch (error) {
      console.error("Error checking vendor plan:", error);
      setHasActivePlan(false);
      setShowPlanPopup(true); // Show popup on error
    } finally {
      setPlanLoading(false);
    }
  };

  // ✅ Create notification sound with voice
  const playNotificationSound = () => {
    if (audioRef.current) {
      audioRef.current.play().catch(e => console.log("Audio play failed:", e));
      setIsPlayingSound(true);
      setTimeout(() => setIsPlayingSound(false), 2000);
    }
    
    setTimeout(() => {
      speakText("You have a new order. Please check!");
    }, 300);
  };

  // ✅ Text-to-Speech function
  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      
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
      
      speechSynthesis.speak(utterance);
    } else {
      console.warn("Speech synthesis not supported");
      if (audioRef.current) {
        audioRef.current.play().catch(e => console.log("Fallback audio play failed:", e));
      }
    }
  };

  // ✅ Initialize voices
  useEffect(() => {
    if ('speechSynthesis' in window) {
      const loadVoices = () => {
        const voices = speechSynthesis.getVoices();
        if (voices.length > 0) {
          console.log("Voices loaded:", voices.length);
        }
      };
      
      speechSynthesis.onvoiceschanged = loadVoices;
      loadVoices();
    }
  }, []);

  // ✅ Fetch restaurant orders for buffer
  const fetchRestaurantOrders = async () => {
    try {
      const response = await axios.get(
        `https://api.vegiffyy.com/api/vendor/restaurantorders/${vendorId}`
      );
      
      const allOrders = response.data.data || response.data || [];
      const pendingOrders = allOrders.filter(order => 
        order.orderStatus === "Pending" || order.orderStatus === "pending"
      );

      if (pendingOrders.length > 0) {
        const newOrderCount = pendingOrders.length - bufferOrders.length;
        
        if (!isBufferManuallyClosed && newOrderCount > 0) {
          setShowBuffer(true);
          playNotificationSound();
        }
        
        setBufferOrders(pendingOrders);
        setHasNewOrders(true);
        
        if (!currentBufferOrder && pendingOrders.length > 0) {
          setCurrentBufferOrder(pendingOrders[0]);
        }
      } else {
        setHasNewOrders(false);
      }
      
      return pendingOrders;
    } catch (error) {
      console.error("Error fetching restaurant orders:", error);
      return [];
    }
  };

  // ✅ Fetch dashboard data
  useEffect(() => {
    if (!vendorId) return;

    const fetchDashboard = async () => {
      try {
        setLoading(true);
        
        const dashboardRes = await axios.get(
          `https://api.vegiffyy.com/api/vendor/dashboard/${vendorId}`
        );

        const { stats, salesData, orders, pendingOrders } = dashboardRes.data;

        const productsRes = await axios.get(
          `https://api.vegiffyy.com/api/restaurant-products/${vendorId}`
        );

        const productsData = productsRes.data.recommendedProducts || productsRes.data.data || [];
        
        setStats({
          ...stats,
          totalProducts: productsData.length,
          pendingOrders: pendingOrders.length
        });
        
        setSalesData(salesData[timeframe] || []);
        setOrders(orders.slice(0, 5));
        setPendingOrders(pendingOrders.slice(0, 5));
        setProducts(productsData.slice(0, 5));
        setProductsData(productsData);

        setRevenueData([
          { name: 'Jan', revenue: 40000 },
          { name: 'Feb', revenue: 30000 },
          { name: 'Mar', revenue: 50000 },
          { name: 'Apr', revenue: 27800 },
          { name: 'May', revenue: 38900 },
          { name: 'Jun', revenue: 43900 },
        ]);

        setCategoryData([
          { name: 'Main Course', value: 35 },
          { name: 'Appetizers', value: 25 },
          { name: 'Desserts', value: 20 },
          { name: 'Beverages', value: 15 },
          { name: 'Salads', value: 5 },
        ]);

      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [vendorId, timeframe]);

  // ✅ Setup buffer interval
  useEffect(() => {
    if (!vendorId) return;

    fetchRestaurantOrders();

    bufferIntervalRef.current = setInterval(() => {
      fetchRestaurantOrders();
    }, 60000);

    return () => {
      if (bufferIntervalRef.current) {
        clearInterval(bufferIntervalRef.current);
      }
    };
  }, [vendorId, isBufferManuallyClosed]);

  // Separate useEffect for products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productsRes = await axios.get(
          `https://api.vegiffyy.com/api/restaurant-products/${vendorId}`
        );
        const productsData = productsRes.data.recommendedProducts || productsRes.data.data || [];
        setProductsData(productsData);
        setProducts(productsData.slice(0, 5));
      } catch (err) {
        console.error("Error fetching products:", err);
      }
    };

    if (vendorId) {
      fetchProducts();
    }
  }, [vendorId]);

  // 🔥 FIXED: Accept Order with Proper Error Handling
  const handleAcceptOrder = async (orderId) => {
    try {
      setIsProcessingOrder(true);
      
      const response = await axios.put(
        `https://api.vegiffyy.com/api/acceptorder/${orderId}/${vendorId}`,
        { orderStatus: "Accepted" }
      );
      
      if (response.data.success) {
        // Success - Remove from buffer
        const updatedBufferOrders = bufferOrders.filter(order => order._id !== orderId);
        setBufferOrders(updatedBufferOrders);
        
        if (updatedBufferOrders.length > 0) {
          setCurrentBufferOrder(updatedBufferOrders[0]);
        } else {
          setShowBuffer(false);
          setCurrentBufferOrder(null);
          setHasNewOrders(false);
        }
        
        // Refresh dashboard data
        fetchRestaurantOrders();
        
        // Show success message (optional)
        speakText("Order accepted successfully!");
        
      } else {
        // Show error popup with backend message
        const errorMsg = response.data.message || "Failed to accept order";
        const errorDetail = response.data;
        
        setErrorMessage(errorMsg);
        setErrorDetails(errorDetail);
        setShowErrorPopup(true);
        
        // Also speak the error
        speakText(errorMsg);
        
        // Don't remove from buffer - keep order visible
        console.error("Order acceptance failed:", errorMsg);
      }
    } catch (error) {
      console.error("Error accepting order:", error);
      
      // Handle network errors
      let errorMsg = "Network error. Please check your connection.";
      let errorDetail = null;
      
      if (error.response) {
        // Server responded with error
        errorMsg = error.response.data?.message || "Server error occurred";
        errorDetail = error.response.data;
      } else if (error.request) {
        // Request made but no response
        errorMsg = "No response from server. Please try again.";
      }
      
      setErrorMessage(errorMsg);
      setErrorDetails(errorDetail);
      setShowErrorPopup(true);
      
      speakText(errorMsg);
    } finally {
      setIsProcessingOrder(false);
    }
  };

  // ✅ Reject Order
  const handleRejectOrder = async (orderId) => {
    try {
      setIsProcessingOrder(true);
      
      const response = await axios.put(
        `https://api.vegiffyy.com/api/acceptorder/${orderId}/${vendorId}`,
        { orderStatus: "Rejected" }
      );
      
      if (response.data.success) {
        // Remove from buffer
        const updatedBufferOrders = bufferOrders.filter(order => order._id !== orderId);
        setBufferOrders(updatedBufferOrders);
        
        if (updatedBufferOrders.length > 0) {
          setCurrentBufferOrder(updatedBufferOrders[0]);
        } else {
          setShowBuffer(false);
          setCurrentBufferOrder(null);
          setHasNewOrders(false);
        }
        
        fetchRestaurantOrders();
        speakText("Order rejected");
      } else {
        // Show error popup for reject as well
        const errorMsg = response.data.message || "Failed to reject order";
        setErrorMessage(errorMsg);
        setErrorDetails(response.data);
        setShowErrorPopup(true);
        speakText(errorMsg);
      }
    } catch (error) {
      console.error("Error rejecting order:", error);
      
      let errorMsg = "Network error. Please check your connection.";
      if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
      }
      
      setErrorMessage(errorMsg);
      setShowErrorPopup(true);
      speakText(errorMsg);
    } finally {
      setIsProcessingOrder(false);
    }
  };

  // ✅ Close Buffer
  const handleCloseBuffer = () => {
    setShowBuffer(false);
    setIsBufferManuallyClosed(true);
  };

  // ✅ Open Buffer
  const handleOpenBuffer = () => {
    // 🔥 Check plan before opening buffer
    if (hasActivePlan === false) {
      setShowPlanPopup(true);
      return;
    }
    
    if (bufferOrders.length > 0) {
      setShowBuffer(true);
      setIsBufferManuallyClosed(false);
      if (!currentBufferOrder) {
        setCurrentBufferOrder(bufferOrders[0]);
      }
    }
  };

  // ✅ Next Order in Buffer
  const handleNextOrder = () => {
    if (bufferOrders.length === 0) return;
    
    const currentIndex = bufferOrders.findIndex(order => order._id === currentBufferOrder._id);
    const nextIndex = (currentIndex + 1) % bufferOrders.length;
    setCurrentBufferOrder(bufferOrders[nextIndex]);
  };

  // 🔥 NEW: Navigation handlers with plan check
  const navigateToOrders = () => {
    if (hasActivePlan === false) {
      setShowPlanPopup(true);
      return;
    }
    navigate('/allorders');
  };

  const navigateToPendingOrders = () => {
    if (hasActivePlan === false) {
      setShowPlanPopup(true);
      return;
    }
    navigate('/pendingorders');
  };

  const navigateToProducts = () => {
    if (hasActivePlan === false) {
      setShowPlanPopup(true);
      return;
    }
    navigate('/productlist');
  };

  const navigateToOrderDetails = (orderId) => {
    if (hasActivePlan === false) {
      setShowPlanPopup(true);
      return;
    }
    navigate(`/order/${orderId}`);
  };

  // 🔥 NEW: Plan Required Popup Component
  const PlanRequiredPopup = () => {
    if (!showPlanPopup) return null;

    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[200] p-4">
        <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full animate-popupIn">
          {/* Header */}
          <div className="p-6 bg-gradient-to-r from-red-500 to-pink-600 rounded-t-3xl">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <FaLock className="text-white text-xl" />
              </div>
              <div>
                <h3 className="text-white font-bold text-xl">Plan Required</h3>
                <p className="text-white/90 text-sm">Active plan needed</p>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="p-6">
            <div className="mb-6">
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
                <p className="text-red-700 text-sm">
                  You don't have an active plan. Please purchase a plan to access all features.
                </p>
              </div>
              
              {/* Benefits */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center p-3 bg-green-50 rounded-xl">
                  <i className="ri-store-line text-green-500 mr-2"></i>
                  <span className="text-gray-700 text-xs">Manage Restaurant</span>
                </div>
                <div className="flex items-center p-3 bg-green-50 rounded-xl">
                  <i className="ri-shopping-bag-line text-green-500 mr-2"></i>
                  <span className="text-gray-700 text-xs">Add Products</span>
                </div>
                <div className="flex items-center p-3 bg-green-50 rounded-xl">
                  <i className="ri-money-rupee-circle-line text-green-500 mr-2"></i>
                  <span className="text-gray-700 text-xs">Receive Payments</span>
                </div>
                <div className="flex items-center p-3 bg-green-50 rounded-xl">
                  <i className="ri-bar-chart-line text-green-500 mr-2"></i>
                  <span className="text-gray-700 text-xs">View Analytics</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowPlanPopup(false);
                  navigate("/vendorpay");
                }}
                className="flex-1 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium rounded-xl hover:opacity-90 transition-all text-sm"
              >
                Buy Plan
              </button>
              <button
                onClick={() => {
                  setShowPlanPopup(false);
                  navigate("/myplans");
                }}
                className="flex-1 py-3 border border-gray-300 text-gray-600 font-medium rounded-xl hover:bg-gray-50 transition-all text-sm"
              >
                View Plans
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Error Popup Component
  const ErrorPopup = () => {
    if (!showErrorPopup) return null;

    // Check if it's the specific delivery boy error
    const isDeliveryBoyError = errorMessage.includes("No delivery boys found") || 
                               errorMessage.includes("all are busy");

    return (
      <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[100] p-4">
        <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full transform animate-slideIn">
          {/* Header based on error type */}
          <div className={`rounded-t-3xl p-6 ${
            isDeliveryBoyError 
              ? 'bg-gradient-to-r from-orange-500 to-red-500' 
              : 'bg-gradient-to-r from-red-500 to-pink-500'
          }`}>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                {isDeliveryBoyError ? (
                  <FaTruck className="text-white text-2xl" />
                ) : (
                  <FaExclamationTriangle className="text-white text-2xl" />
                )}
              </div>
              <div>
                <h3 className="text-white font-bold text-xl">
                  {isDeliveryBoyError ? 'Delivery Issue' : 'Order Failed'}
                </h3>
                <p className="text-white text-sm opacity-90">
                  {isDeliveryBoyError ? 'No delivery boy available' : 'Unable to process order'}
                </p>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="p-6">
            <div className="mb-4">
              <p className="text-gray-700 font-medium mb-2">Error Message:</p>
              <div className={`p-4 rounded-xl ${
                isDeliveryBoyError 
                  ? 'bg-orange-50 border border-orange-200' 
                  : 'bg-red-50 border border-red-200'
              }`}>
                <p className={`${
                  isDeliveryBoyError ? 'text-orange-800' : 'text-red-800'
                }`}>
                  {errorMessage}
                </p>
              </div>
            </div>

            {/* Specific help for delivery boy error */}
            {isDeliveryBoyError && (
              <div className="mb-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
                <div className="flex items-start space-x-2">
                  <FaInfoCircle className="text-blue-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-blue-800 font-medium mb-1">What you can do:</p>
                    <ul className="text-sm text-blue-700 space-y-1 list-disc pl-4">
                      <li>Order will stay pending until a delivery boy is available</li>
                      <li>You can try again in a few minutes</li>
                      <li>Customer will be notified about the delay</li>
                      <li>System automatically retries every minute</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button
                onClick={() => setShowErrorPopup(false)}
                className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium rounded-xl transition-colors"
              >
                Dismiss
              </button>
              
              {isDeliveryBoyError && (
                <button
                  onClick={() => {
                    setShowErrorPopup(false);
                    // Keep buffer open to show the order
                  }}
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors"
                >
                  View Order
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Enhanced Buffer Order Modal Component with Error Handling
  const BufferOrderModal = () => {
    if (!showBuffer || !currentBufferOrder) return null;

    const order = currentBufferOrder;
    const user = order.userId || {};
    const address = order.deliveryAddress || {};
    const orderTime = new Date(order.createdAt || new Date()).toLocaleString();

    return (
      <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
        <div className="bg-gradient-to-br from-white to-blue-50 rounded-3xl shadow-2xl max-w-2xl w-full transform animate-bounce-in">
          {/* Header */}
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-t-3xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white bg-opacity-20 rounded-full -mr-12 -mt-12"></div>
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-white bg-opacity-20 rounded-full -ml-8 -mb-8"></div>
            
            <div className="flex justify-between items-center relative z-10">
              <div className="flex items-center space-x-3">
                <div className={`w-4 h-4 rounded-full ${isPlayingSound ? 'bg-red-500 animate-ping' : 'bg-green-500'}`}></div>
                <div>
                  <h3 className="text-white font-bold text-2xl">🎊 New Order Alert!</h3>
                  <p className="text-yellow-100 text-sm mt-1">Time to cook something delicious!</p>
                </div>
              </div>
              <button 
                onClick={handleCloseBuffer}
                className="text-white hover:text-yellow-200 transition-colors bg-white bg-opacity-20 p-2 rounded-full"
                disabled={isProcessingOrder}
              >
                <FaTimes size={20} />
              </button>
            </div>

            {/* Processing Indicator */}
            {isProcessingOrder && (
              <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-30 flex items-center justify-center rounded-t-3xl">
                <div className="bg-white rounded-lg px-4 py-2 shadow-lg flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span className="text-sm font-medium text-gray-700">Processing...</span>
                </div>
              </div>
            )}
          </div>

          {/* Order Content */}
          <div className="p-6 max-h-[70vh] overflow-y-auto">
            {/* Order Summary Card */}
            <div className="bg-white rounded-2xl shadow-lg p-5 mb-6 border border-gray-100">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="text-xl font-bold text-gray-800 flex items-center">
                    <FaReceipt className="mr-2 text-blue-500" />
                    Order #{order._id?.slice(-8).toUpperCase() || 'N/A'}
                  </h4>
                  <p className="text-gray-500 text-sm flex items-center mt-1">
                    <FaCalendarAlt className="mr-1" />
                    {orderTime}
                  </p>
                </div>
                <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-semibold animate-pulse">
                  ⏰ Pending
                </span>
              </div>

              {/* Payment Info */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-600">Payment Method</p>
                  <p className="font-semibold text-gray-800 flex items-center">
                    <FaCreditCard className="mr-2 text-green-500" />
                    {order.paymentMethod || 'Online'}
                  </p>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-600">Payment Status</p>
                  <p className="font-semibold text-green-600">
                    {order.paymentStatus === 'Paid' ? '✅ Paid' : 'Pending'}
                  </p>
                </div>
              </div>
            </div>

            {/* Customer Information */}
            <div className="bg-white rounded-2xl shadow-lg p-5 mb-6 border border-gray-100">
              <h5 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <FaUser className="mr-2 text-purple-500" />
                Customer Details
              </h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <FaUser className="text-purple-500" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Customer Name</p>
                    <p className="font-semibold text-gray-800">
                      {user.firstName} {user.lastName}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <FaPhone className="text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Phone Number</p>
                    <p className="font-semibold text-gray-800">{user.phoneNumber || 'N/A'}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg md:col-span-2">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <FaEnvelope className="text-green-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">Email Address</p>
                    <p className="font-semibold text-gray-800 truncate">{user.email || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Delivery Address */}
            <div className="bg-white rounded-2xl shadow-lg p-5 mb-6 border border-gray-100">
              <h5 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <FaMapMarkerAlt className="mr-2 text-red-500" />
                Delivery Address
              </h5>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="font-medium text-gray-800">{address.street || 'N/A'}</p>
                <p className="text-gray-600 mt-1">
                  {address.city}, {address.state} - {address.postalCode}
                </p>
                <p className="text-gray-600">{address.country}</p>
                <span className="inline-block mt-2 bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                  {address.addressType || 'Home'}
                </span>
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-2xl shadow-lg p-5 mb-6 border border-gray-100">
              <h5 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <FaShoppingCart className="mr-2 text-orange-500" />
                Order Items ({order.products?.length || 0})
              </h5>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {order.products?.map((item, index) => (
                  <div key={index} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors">
                    <img 
                      src={item.image} 
                      alt={item.name}
                      className="w-16 h-16 rounded-lg object-cover border border-gray-200"
                      onError={(e) => {
                        e.target.src = 'https://static.vecteezy.com/system/resources/previews/000/273/542/original/online-food-order-concept-vector.jpg';
                      }}
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">{item.name}</p>
                      <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium">
                        ₹{item.price}
                      </span>
                    </div>
                  </div>
                )) || (
                  <div className="text-center py-4 text-gray-500">
                    <FaBox className="text-3xl text-gray-300 mx-auto mb-2" />
                    <p>No items details available</p>
                  </div>
                )}
              </div>
            </div>

            {/* Order Summary */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-5 text-white">
              <h5 className="text-lg font-semibold mb-4 flex items-center">
                <FaReceipt className="mr-2" />
                Order Summary
              </h5>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal ({order.totalItems || 0} items):</span>
                  <span className="font-semibold">₹{order.subTotal || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Charge:</span>
                  <span className="font-semibold">₹{order.deliveryCharge || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>GST Amount:</span>
                  <span className="font-semibold">₹{order.gstAmount || 0}</span>
                </div>
                {order.couponDiscount > 0 && (
                  <div className="flex justify-between text-green-300">
                    <span>Coupon Discount:</span>
                    <span className="font-semibold">-₹{order.couponDiscount || 0}</span>
                  </div>
                )}
                <div className="border-t border-white border-opacity-30 pt-2 mt-2">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total Amount:</span>
                    <span className="text-yellow-300">₹{order.totalPayable || 0}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4 mt-6">
              <button
                onClick={() => handleRejectOrder(order._id)}
                disabled={isProcessingOrder}
                className={`flex-1 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center space-x-3 ${
                  isProcessingOrder ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <FaTimesCircle size={18} />
                <span>Reject Order</span>
              </button>
              
              <button
                onClick={() => handleAcceptOrder(order._id)}
                disabled={isProcessingOrder}
                className={`flex-1 bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center space-x-3 ${
                  isProcessingOrder ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <FaCheck size={18} />
                <span>Accept Order</span>
              </button>
            </div>

            {/* Buffer Navigation */}
            {bufferOrders.length > 1 && (
              <div className="text-center mt-4">
                <button
                  onClick={handleNextOrder}
                  disabled={isProcessingOrder}
                  className={`text-blue-600 hover:text-blue-800 font-medium text-sm bg-blue-50 px-4 py-2 rounded-full transition-colors ${
                    isProcessingOrder ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  ↪ Next Order ({bufferOrders.length - 1} more waiting)
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const handleTimeframeChange = (e) => setTimeframe(e.target.value);

  const StatCard = ({ title, value, icon, color, change, onClick }) => (
    <div 
      className={`bg-white rounded-2xl shadow-lg p-6 cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl border-l-4 ${color} border ${
        hasActivePlan === false ? 'opacity-75 hover:opacity-100' : ''
      }`}
      onClick={() => {
        if (hasActivePlan === false) {
          setShowPlanPopup(true);
        } else if (onClick) {
          onClick();
        }
      }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-800 mt-2">{value}</p>
          {change && (
            <div className={`flex items-center mt-2 text-sm ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {change > 0 ? <FaArrowUp className="mr-1" /> : <FaArrowDown className="mr-1" />}
              {Math.abs(change)}% from last month
            </div>
          )}
        </div>
        <div className={`p-3 rounded-full ${color} bg-opacity-10 relative`}>
          {icon}
          {hasActivePlan === false && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
              <FaLock className="text-white text-[8px]" />
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (loading || planLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 text-lg">
            {planLoading ? 'Checking Plan...' : 'Loading Dashboard...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      {/* Hidden Audio Element */}
      <audio 
        ref={audioRef} 
        preload="auto"
        src="https://assets.mixkit.co/sfx/preview/mixkit-alarm-digital-clock-beep-989.mp3"
      />
      
      {/* Plan Required Popup */}
      <PlanRequiredPopup />
      
      {/* Error Popup */}
      <ErrorPopup />
      
      {/* Buffer Order Modal */}
      <BufferOrderModal />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Dashboard Overview</h1>
              <p className="text-gray-600 mt-2">Welcome back! Here's what's happening with your restaurant today.</p>
            </div>
            
            {/* Manual Buffer Control Button */}
            {bufferOrders.length > 0 && (
              <button
                onClick={handleOpenBuffer}
                className={`flex items-center space-x-2 px-4 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 ${
                  hasActivePlan === false
                    ? 'bg-gray-400 cursor-not-allowed opacity-50'
                    : hasNewOrders && !showBuffer
                      ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white animate-pulse shadow-lg'
                      : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md'
                }`}
                disabled={hasActivePlan === false}
              >
                <FaBell className={hasNewOrders && !showBuffer && hasActivePlan !== false ? "animate-bounce" : ""} />
                <span>
                  {hasNewOrders && !showBuffer ? '📢 New Orders!' : 'View Pending Orders'}
                </span>
                <span className="bg-white text-blue-600 px-2 py-1 rounded-full text-xs font-bold ml-2">
                  {bufferOrders.length}
                </span>
              </button>
            )}
          </div>
          
          {/* Plan Status Warning */}
          {hasActivePlan === false && (
            <div className="mt-4 bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-xl p-4 flex items-center justify-between shadow-sm">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <div>
                  <span className="text-red-800 font-medium">
                    ⚠️ No Active Plan - Features are locked
                  </span>
                  <span className="ml-3 bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-bold">
                    ACTION REQUIRED
                  </span>
                </div>
              </div>
              <div className="flex space-x-2">
                <button 
                  onClick={() => setShowPlanPopup(true)}
                  className="text-red-700 hover:text-red-900 font-medium text-sm bg-red-100 hover:bg-red-200 px-3 py-1 rounded-lg transition-colors"
                >
                  View Plans
                </button>
                <button 
                  onClick={() => navigate("/vendorpay")}
                  className="text-white bg-gradient-to-r from-green-500 to-emerald-600 hover:opacity-90 font-medium text-sm px-4 py-1 rounded-lg transition-colors"
                >
                  Buy Plan
                </button>
              </div>
            </div>
          )}
          
          {/* Buffer Status Indicator */}
          {bufferOrders.length > 0 && !showBuffer && hasActivePlan !== false && (
            <div className="mt-4 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-4 flex items-center justify-between shadow-sm">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
                <div>
                  <span className="text-yellow-800 font-medium">
                    {bufferOrders.length} pending order{bufferOrders.length > 1 ? 's' : ''} waiting
                  </span>
                  {hasNewOrders && (
                    <span className="ml-3 bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-bold">
                      NEW!
                    </span>
                  )}
                </div>
              </div>
              <div className="flex space-x-2">
                <button 
                  onClick={handleOpenBuffer}
                  className="text-yellow-700 hover:text-yellow-900 font-medium text-sm bg-yellow-100 hover:bg-yellow-200 px-3 py-1 rounded-lg transition-colors"
                >
                  View Orders
                </button>
                {hasNewOrders && (
                  <button 
                    onClick={() => {
                      setHasNewOrders(false);
                      setIsBufferManuallyClosed(true);
                    }}
                    className="text-gray-600 hover:text-gray-800 text-sm px-3 py-1 rounded-lg transition-colors"
                  >
                    Mark as seen
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Stat Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Orders"
            value={stats.totalOrders}
            icon={<FaShoppingCart className="text-2xl text-blue-600" />}
            color="border-blue-500"
            change={12}
            onClick={navigateToOrders}
          />
          
          <StatCard
            title="Completed Orders"
            value={stats.completedOrders}
            icon={<FaCheckCircle className="text-2xl text-green-600" />}
            color="border-green-500"
            change={8}
            onClick={navigateToOrders}
          />
          
          <StatCard
            title="Pending Orders"
            value={bufferOrders.length}
            icon={<FaClock className="text-2xl text-yellow-600" />}
            color="border-yellow-500"
            change={-5}
            onClick={handleOpenBuffer}
          />
          
          <StatCard
            title="Total Products"
            value={productsData.length}
            icon={<FaUtensils className="text-2xl text-purple-600" />}
            color="border-purple-500"
            onClick={navigateToProducts}
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Sales Chart */}
          <div className="bg-white rounded-2xl shadow-lg p-6 relative">
            {hasActivePlan === false && (
              <div className="absolute inset-0 bg-white/80 backdrop-blur-[2px] rounded-2xl flex items-center justify-center z-10">
                <button
                  onClick={() => setShowPlanPopup(true)}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:opacity-90 transition-all flex items-center space-x-2"
                >
                  <FaLock />
                  <span>Unlock with Plan</span>
                </button>
              </div>
            )}
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-800">Sales Performance</h3>
              <select
                className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={timeframe}
                onChange={handleTimeframeChange}
                disabled={hasActivePlan === false}
              >
                <option value="Today">Today</option>
                <option value="This Week">This Week</option>
                <option value="Last Week">Last Week</option>
                <option value="Last Month">Last Month</option>
              </select>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: 'none', 
                    borderRadius: '10px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Legend />
                <Bar
                  dataKey="sales"
                  fill="#4F46E5"
                  barSize={30}
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Revenue Chart */}
          <div className="bg-white rounded-2xl shadow-lg p-6 relative">
            {hasActivePlan === false && (
              <div className="absolute inset-0 bg-white/80 backdrop-blur-[2px] rounded-2xl flex items-center justify-center z-10">
                <button
                  onClick={() => setShowPlanPopup(true)}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:opacity-90 transition-all flex items-center space-x-2"
                >
                  <FaLock />
                  <span>Unlock with Plan</span>
                </button>
              </div>
            )}
            <h3 className="text-xl font-semibold text-gray-800 mb-6">Revenue Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: 'none', 
                    borderRadius: '10px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#10B981" 
                  strokeWidth={3}
                  dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Category Distribution */}
          <div className="bg-white rounded-2xl shadow-lg p-6 relative">
            {hasActivePlan === false && (
              <div className="absolute inset-0 bg-white/80 backdrop-blur-[2px] rounded-2xl flex items-center justify-center z-10">
                <button
                  onClick={() => setShowPlanPopup(true)}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:opacity-90 transition-all flex items-center space-x-2"
                >
                  <FaLock />
                  <span>Unlock with Plan</span>
                </button>
              </div>
            )}
            <h3 className="text-xl font-semibold text-gray-800 mb-6">Category Distribution</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Recent Orders */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6 relative">
            {hasActivePlan === false && (
              <div className="absolute inset-0 bg-white/80 backdrop-blur-[2px] rounded-2xl flex items-center justify-center z-10">
                <button
                  onClick={() => setShowPlanPopup(true)}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:opacity-90 transition-all flex items-center space-x-2"
                >
                  <FaLock />
                  <span>Unlock with Plan</span>
                </button>
              </div>
            )}
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-800">Recent Orders</h3>
              <button 
                onClick={navigateToOrders}
                className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                disabled={hasActivePlan === false}
              >
                View All
              </button>
            </div>
            <div className="space-y-4">
              {orders.length > 0 ? (
                orders.map((order) => (
                  <div 
                    key={order._id} 
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-blue-50 cursor-pointer transition-colors"
                    onClick={() => navigateToOrderDetails(order._id)}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <FaShoppingCart className="text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">Order #{order._id?.slice(-8)}</p>
                        <p className="text-sm text-gray-600">{order.paymentMethod}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-800">₹{order.totalPayable}</p>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                        order.orderStatus === "Completed" 
                          ? "bg-green-100 text-green-800" 
                          : "bg-yellow-100 text-yellow-800"
                      }`}>
                        {order.orderStatus}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FaShoppingCart className="text-4xl text-gray-300 mx-auto mb-3" />
                  <p>No recent orders</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Overview Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pending Orders */}
          <div className="bg-white rounded-2xl shadow-lg p-6 relative">
            {hasActivePlan === false && (
              <div className="absolute inset-0 bg-white/80 backdrop-blur-[2px] rounded-2xl flex items-center justify-center z-10">
                <button
                  onClick={() => setShowPlanPopup(true)}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:opacity-90 transition-all flex items-center space-x-2"
                >
                  <FaLock />
                  <span>Unlock with Plan</span>
                </button>
              </div>
            )}
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-800">Pending Orders</h3>
              <button 
                onClick={handleOpenBuffer}
                className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                disabled={hasActivePlan === false}
              >
                View All
              </button>
            </div>
            <div className="space-y-3">
              {bufferOrders.length > 0 ? (
                bufferOrders.slice(0, 5).map((order) => (
                  <div 
                    key={order._id}
                    className="flex items-center justify-between p-3 border border-yellow-200 rounded-lg bg-yellow-50 hover:bg-yellow-100 cursor-pointer transition-colors"
                    onClick={() => {
                      if (hasActivePlan === false) {
                        setShowPlanPopup(true);
                      } else {
                        setCurrentBufferOrder(order);
                        handleOpenBuffer();
                      }
                    }}
                  >
                    <div>
                      <p className="font-medium text-gray-800">#{order._id?.slice(-8)}</p>
                      <p className="text-sm text-gray-600">{order.paymentMethod}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">₹{order.totalAmount || order.totalPayable}</p>
                      <p className="text-xs text-yellow-600 font-medium">Pending</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <FaCheckCircle className="text-3xl text-green-300 mx-auto mb-2" />
                  <p>No pending orders</p>
                </div>
              )}
            </div>
          </div>

          {/* Top Products */}
          <div className="bg-white rounded-2xl shadow-lg p-6 relative">
            {hasActivePlan === false && (
              <div className="absolute inset-0 bg-white/80 backdrop-blur-[2px] rounded-2xl flex items-center justify-center z-10">
                <button
                  onClick={() => setShowPlanPopup(true)}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:opacity-90 transition-all flex items-center space-x-2"
                >
                  <FaLock />
                  <span>Unlock with Plan</span>
                </button>
              </div>
            )}
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-800">Top Products</h3>
              <button 
                onClick={navigateToProducts}
                className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                disabled={hasActivePlan === false}
              >
                View All
              </button>
            </div>
            <div className="space-y-3">
              {products.length > 0 ? (
                products.map((product, index) => (
                  <div key={product._id || product.productId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-sm font-bold text-purple-600">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{product.name || product.productName}</p>
                        <p className="text-sm text-gray-600">₹{product.basePrice || product.price}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-600">{product.category || 'General'}</p>
                      <p className="text-xs text-green-600">In Stock</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <FaBox className="text-3xl text-gray-300 mx-auto mb-2" />
                  <p>No products available</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Custom animations */}
      <style jsx>{`
        @keyframes bounce-in {
          0% {
            opacity: 0;
            transform: scale(0.3);
          }
          50% {
            opacity: 1;
            transform: scale(1.05);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-bounce-in {
          animation: bounce-in 0.6s ease-out;
        }
        
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-50px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
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
      `}</style>
    </div>
  );
};

export default Dashboard;