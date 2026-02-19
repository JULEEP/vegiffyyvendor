import React, { useEffect, useState, useCallback } from "react";
import { FaEdit, FaTrashAlt, FaEye, FaStar, FaRupeeSign, FaMapMarkerAlt, FaTag, FaSearch, FaTimes, FaSave, FaToggleOn, FaToggleOff } from "react-icons/fa";
import axios from "axios";

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [restaurantStatus, setRestaurantStatus] = useState("");
  const [totalRatings, setTotalRatings] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [updatingStatus, setUpdatingStatus] = useState({});

  const vendorId = localStorage.getItem("vendorId");

  // Fetch data on mount
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await axios.get(`https://api.vegiffyy.com/api/restaurant-products/${vendorId}`);
        if (res.data.success) {
          const productsData = res.data.recommendedProducts || [];
          setProducts(productsData);
          setFilteredProducts(productsData);
          setRestaurantStatus(res.data.restaurantStatus || "");
          setTotalRatings(res.data.totalRatings || 0);
          setTotalReviews(res.data.totalReviews || 0);
        } else {
          setError(res.data.message || "Failed to fetch products");
        }
      } catch (err) {
        console.error("Error fetching products:", err);
        setError(err.response?.data?.message || "Server error occurred");
      } finally {
        setLoading(false);
      }
    };

    if (vendorId) {
      fetchProducts();
      fetchCategories();
    } else {
      setError("Vendor ID not found. Please login again.");
      setLoading(false);
    }
  }, [vendorId]);

  const fetchCategories = async () => {
    try {
      setCategoriesLoading(true);
      const response = await axios.get("https://api.vegiffyy.com/api/category");
      if (response.data.success) {
        setCategories(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setCategoriesLoading(false);
    }
  };

  // Filter products based on search term
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter(product =>
        product.recommendedItem?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.recommendedItem?.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.locationName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.type?.some(t => t?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        product.recommendedItem?.addons?.productName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProducts(filtered);
    }
  }, [searchTerm, products]);

  const handleView = (product) => {
    setSelectedProduct(product);
  };

  const handleEdit = (product) => {
    const productCopy = JSON.parse(JSON.stringify(product));
    
    // Ensure type is always an array
    if (!productCopy.type) {
      productCopy.type = [];
    } else if (!Array.isArray(productCopy.type)) {
      productCopy.type = [productCopy.type];
    }
    
    // Ensure nested objects exist
    if (!productCopy.recommendedItem) {
      productCopy.recommendedItem = {};
    }
    
    setEditingProduct(productCopy);
  };

  const handleDelete = async (product) => {
    if (!window.confirm("Are you sure you want to delete this product?")) {
      return;
    }

    const productId = product.productId;
    const recommendedId = product.recommendedItem?._id;

    if (!productId || !recommendedId) {
      alert("Product ID or Recommended ID not found");
      return;
    }

    setDeleteLoading(productId);
    try {
      const response = await axios.delete(
        `https://api.vegiffyy.com/api/restaurant-products/${productId}/${recommendedId}`
      );
      if (response.data.success) {
        setProducts(products.filter(p => p.productId !== productId));
        setFilteredProducts(filteredProducts.filter(p => p.productId !== productId));
        alert("Product deleted successfully!");
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("Failed to delete product: " + (error.response?.data?.message || error.message));
    } finally {
      setDeleteLoading(null);
    }
  };

  // Status toggle slider handler
  const handleStatusToggle = async (product) => {
    const productId = product.productId;
    const recommendedId = product.recommendedItem?._id;
    const currentStatus = product.recommendedItem?.status || "inactive";
    const newStatus = currentStatus === "active" ? "inactive" : "active";

    if (!productId || !recommendedId) {
      alert("Product ID or Recommended ID not found");
      return;
    }

    // Optimistically update UI
    const updatedProducts = products.map(p => {
      if (p.productId === productId) {
        return {
          ...p,
          recommendedItem: {
            ...p.recommendedItem,
            status: newStatus
          }
        };
      }
      return p;
    });

    setProducts(updatedProducts);
    setFilteredProducts(updatedProducts.filter(p => 
      filteredProducts.some(fp => fp.productId === p.productId)
    ));

    setUpdatingStatus(productId);

    try {
      const formData = new FormData();
      
      // Create recommended object
      const recommendedData = {
        name: product.recommendedItem?.name,
        price: product.recommendedItem?.price,
        halfPlatePrice: product.recommendedItem?.halfPlatePrice,
        fullPlatePrice: product.recommendedItem?.fullPlatePrice,
        discount: product.recommendedItem?.discount,
        content: product.recommendedItem?.content,
        preparationTime: product.recommendedItem?.preparationTime,
        status: newStatus,
      };

      // Add tags if they exist
      if (product.recommendedItem?.tags) {
        recommendedData.tags = Array.isArray(product.recommendedItem.tags) 
          ? product.recommendedItem.tags 
          : [product.recommendedItem.tags];
      }

      // Add category if it exists
      if (product.recommendedItem?.category) {
        recommendedData.category = typeof product.recommendedItem.category === 'object'
          ? product.recommendedItem.category._id
          : product.recommendedItem.category;
      }

      formData.append("recommended", JSON.stringify(recommendedData));

      const response = await axios.put(
        `https://api.vegiffyy.com/api/restaurant-product/${productId}/${recommendedId}`,
        formData,
        { 
          headers: { 
            "Content-Type": "multipart/form-data" 
          } 
        }
      );

      if (!response.data.success) {
        // Revert if failed
        const revertedProducts = products.map(p => {
          if (p.productId === productId) {
            return {
              ...p,
              recommendedItem: {
                ...p.recommendedItem,
                status: currentStatus
              }
            };
          }
          return p;
        });
        setProducts(revertedProducts);
        setFilteredProducts(revertedProducts.filter(p => 
          filteredProducts.some(fp => fp.productId === p.productId)
        ));
        alert("Failed to update status");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      // Revert on error
      const revertedProducts = products.map(p => {
        if (p.productId === productId) {
          return {
            ...p,
            recommendedItem: {
              ...p.recommendedItem,
              status: currentStatus
            }
          };
        }
        return p;
      });
      setProducts(revertedProducts);
      setFilteredProducts(revertedProducts.filter(p => 
        filteredProducts.some(fp => fp.productId === p.productId)
      ));
      alert("Failed to update status: " + (error.response?.data?.message || error.message));
    } finally {
      setUpdatingStatus(prev => ({ ...prev, [productId]: false }));
    }
  };

const handleUpdate = async (e) => {
  e.preventDefault();
  if (!editingProduct) return;

  setUpdateLoading(true);
  try {
    const formData = new FormData();
    
    const productId = editingProduct.productId;
    const recommendedId = editingProduct.recommendedItem?._id;
    
    if (!productId || !recommendedId) {
      alert("Product ID or Recommended ID not found");
      setUpdateLoading(false);
      return;
    }

    // Find original product for comparison
    const originalProduct = products.find(p => p.productId === productId);
    if (!originalProduct) {
      alert("Product not found");
      setUpdateLoading(false);
      return;
    }

    const originalRecommended = originalProduct.recommendedItem || {};

    // Create recommended object EXACTLY like your working code
    const recommendedData = {
      name: editingProduct.recommendedItem?.name || originalRecommended.name,
      price: editingProduct.recommendedItem?.price || originalRecommended.price,
      halfPlatePrice: editingProduct.recommendedItem?.halfPlatePrice || originalRecommended.halfPlatePrice,
      fullPlatePrice: editingProduct.recommendedItem?.fullPlatePrice || originalRecommended.fullPlatePrice,
      discount: editingProduct.recommendedItem?.discount || originalRecommended.discount,
      content: editingProduct.recommendedItem?.content || originalRecommended.content,
      preparationTime: editingProduct.recommendedItem?.preparationTime || originalRecommended.preparationTime,
      status: editingProduct.recommendedItem?.status || originalRecommended.status,
    };

    // Add tags if they exist
    if (editingProduct.recommendedItem?.tags) {
      recommendedData.tags = Array.isArray(editingProduct.recommendedItem.tags) 
        ? editingProduct.recommendedItem.tags 
        : [editingProduct.recommendedItem.tags];
    }

    // Add category if it exists
    if (editingProduct.recommendedItem?.category) {
      recommendedData.category = typeof editingProduct.recommendedItem.category === 'object'
        ? editingProduct.recommendedItem.category._id
        : editingProduct.recommendedItem.category;
    }

    console.log("📤 Recommended Data to send:", recommendedData);
    console.log("📤 Status being sent:", recommendedData.status);

    // Append recommended data as JSON string (IMPORTANT: NOT in array)
    formData.append("recommended", JSON.stringify(recommendedData));
    
    // Append type if changed
    if (JSON.stringify(editingProduct.type) !== JSON.stringify(originalProduct.type)) {
      formData.append('type', JSON.stringify(editingProduct.type));
    }

    // Append image file
    if (editingProduct.recommendedItem?.newImage) {
      formData.append("recommendedImage", editingProduct.recommendedItem.newImage);
    }

    // Debug: Show what's being sent
    for (let pair of formData.entries()) {
      console.log(`📤 FormData: ${pair[0]} = ${pair[1]}`);
    }

    // Send request
    const response = await axios.put(
      `https://api.vegiffyy.com/api/restaurant-product/${productId}/${recommendedId}`,
      formData,
      { 
        headers: { 
          "Content-Type": "multipart/form-data" 
        } 
      }
    );

    console.log("✅ Response:", response.data);

    if (response.data.success) {
      // Update local state
      const updatedProduct = response.data.data;
      
      // Find the updated recommended item
      const updatedRecommendedItem = updatedProduct.recommended?.find(
        item => item._id === recommendedId
      );

      if (updatedRecommendedItem) {
        // Create updated product object
        const updatedProductData = {
          ...originalProduct,
          type: updatedProduct.type || originalProduct.type,
          recommendedItem: {
            ...originalRecommended,
            ...updatedRecommendedItem,
            // Ensure category object is preserved
            category: typeof updatedRecommendedItem.category === 'string' && typeof originalRecommended.category === 'object'
              ? originalRecommended.category
              : updatedRecommendedItem.category
          }
        };

        // Update states
        setProducts(products.map(p => 
          p.productId === productId ? updatedProductData : p
        ));
        setFilteredProducts(filteredProducts.map(p => 
          p.productId === productId ? updatedProductData : p
        ));
      }

      setEditingProduct(null);
      alert("Product updated successfully!");
    }
  } catch (error) {
    console.error("❌ Error updating product:", error);
    console.error("❌ Error response:", error.response?.data);
    alert("Failed to update product: " + (error.response?.data?.message || error.message));
  } finally {
    setUpdateLoading(false);
  }
};
  const handleEditChange = (field, value) => {
    setEditingProduct(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleRecommendedItemChange = (field, value) => {
    setEditingProduct(prev => ({
      ...prev,
      recommendedItem: {
        ...prev.recommendedItem,
        [field]: value
      }
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditingProduct(prev => ({
        ...prev,
        recommendedItem: {
          ...prev.recommendedItem,
          newImage: file
        }
      }));
    }
  };

  const closeModal = () => {
    setSelectedProduct(null);
    setEditingProduct(null);
  };

  const clearSearch = () => {
    setSearchTerm("");
  };

  const getCategoryName = (category) => {
    if (!category) return "";
    if (typeof category === 'string') {
      const foundCategory = categories.find(c => c._id === category);
      return foundCategory?.categoryName || category;
    }
    return category.categoryName || "";
  };

  // Status Slider Component
  const StatusSlider = ({ product }) => {
    const isActive = product.recommendedItem?.status === "active";
    const isUpdating = updatingStatus[product.productId];

    return (
      <div className="flex flex-col items-center gap-2">
        <div className="flex items-center justify-between w-full">
          <span className={`text-xs font-medium ${!isActive ? 'text-red-600' : 'text-gray-400'}`}>
            Inactive
          </span>
          <div className="relative">
            <button
              onClick={() => !isUpdating && handleStatusToggle(product)}
              disabled={isUpdating}
              className={`w-12 h-6 flex items-center rounded-full p-1 transition-all duration-300 ${isActive ? 'bg-green-500' : 'bg-gray-300'} ${isUpdating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${isActive ? 'translate-x-6' : 'translate-x-0'}`}
              />
            </button>
            {isUpdating && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              </div>
            )}
          </div>
          <span className={`text-xs font-medium ${isActive ? 'text-green-600' : 'text-gray-400'}`}>
            Active
          </span>
        </div>
        <span className={`text-xs px-2 py-0.5 rounded-full ${isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {isActive ? "Active" : "Inactive"}
        </span>
      </div>
    );
  };

  // Get Type Badge
  const getTypeBadge = (type) => {
    const typeArray = Array.isArray(type) ? type : (type ? [type] : []);
    
    const typeConfig = {
      veg: { color: "bg-green-100 text-green-800", icon: "🌱" },
      nonveg: { color: "bg-red-100 text-red-800", icon: "🍗" },
      vegan: { color: "bg-emerald-100 text-emerald-800", icon: "🥬" }
    };

    const firstType = typeArray[0]?.toLowerCase();
    const config = typeConfig[firstType] || { color: "bg-gray-100 text-gray-800", icon: "🍽️" };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color} flex items-center gap-1`}>
        <span>{config.icon}</span>
        {typeArray.join(", ")}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-96 bg-white rounded-lg shadow-sm border border-gray-200 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-3 text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-96 bg-white rounded-lg shadow-sm border border-gray-200 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <FaTag className="text-red-500 text-xl" />
          </div>
          <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Products</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header with Restaurant Info */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <span className="text-green-600">🥗</span>
            Restaurant Products
          </h2>
          <p className="text-gray-600 mt-1">
            Manage your menu items and recommendations
          </p>
          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <span className="font-medium">Restaurant Status:</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                restaurantStatus === 'active' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {restaurantStatus || 'Unknown'}
              </span>
            </span>
            <span className="flex items-center gap-1">
              <FaStar className="text-yellow-400" />
              <span>{totalRatings} Ratings</span>
            </span>
            <span className="flex items-center gap-1">
              <FaEye className="text-blue-400" />
              <span>{totalReviews} Reviews</span>
            </span>
          </div>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center gap-2 text-sm text-gray-500">
          <FaTag className="text-green-500" />
          <span>{filteredProducts.length} product(s) found</span>
        </div>
      </div>

      {/* Search Filter */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaSearch className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search products by name, description, location, type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-12 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
          />
          {searchTerm && (
            <button
              onClick={clearSearch}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
            >
              ×
            </button>
          )}
        </div>
        {searchTerm && (
          <p className="text-sm text-gray-500 mt-2">
            Showing {filteredProducts.length} of {products.length} products
            {filteredProducts.length === 0 && " - No matching products found"}
          </p>
        )}
      </div>

      {/* Products Table */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaTag className="text-gray-400 text-2xl" />
          </div>
          <h3 className="text-lg font-semibold text-gray-600 mb-2">
            {searchTerm ? "No Products Found" : "No Products Available"}
          </h3>
          <p className="text-gray-500">
            {searchTerm
              ? "Try adjusting your search terms"
              : "Start by adding some products to your menu."
            }
          </p>
          {searchTerm && (
            <button
              onClick={clearSearch}
              className="mt-4 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Clear Search
            </button>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rating
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.map((product) => (
                <tr key={product.recommendedItem?._id || product._id} className="hover:bg-gray-50 transition-colors">
                  {/* Product Info */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img
                        className="h-12 w-12 rounded-lg object-cover border border-gray-200"
                        src={product.recommendedItem?.image}
                        alt={product.recommendedItem?.name}
                        onError={(e) => {
                          e.target.src = "https://via.placeholder.com/48x48/f3f4f6/9ca3af?text=🍽️";
                        }}
                      />
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {product.recommendedItem?.name || "Unnamed Product"}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                          <FaMapMarkerAlt className="text-gray-400 text-xs" />
                          {product.locationName || "Unknown Location"}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          ID: {product.recommendedItem?._id?.slice(-6)}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Type */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getTypeBadge(product.type)}
                  </td>

                  {/* Price */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1 text-sm font-medium text-gray-900">
                      <FaRupeeSign className="text-gray-500 text-xs" />
                      {product.recommendedItem?.price || "0"}
                    </div>
                    {product.recommendedItem?.discount > 0 && (
                      <div className="text-xs text-red-600 line-through">
                        <FaRupeeSign className="inline" />
                        {Math.round(product.recommendedItem?.price / (1 - product.recommendedItem?.discount / 100))}
                      </div>
                    )}
                  </td>

                  {/* Rating */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      <FaStar className="text-yellow-400 text-sm" />
                      <span className="text-sm font-medium text-gray-900">
                        {product.recommendedItem?.rating || "0"}
                      </span>
                      <span className="text-xs text-gray-500">
                        ({product.recommendedItem?.reviews?.length || 0} reviews)
                      </span>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusSlider product={product} />
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleView(product)}
                        className="text-blue-600 hover:text-blue-900 transition-colors p-2 rounded-lg hover:bg-blue-50"
                        title="View Details"
                      >
                        <FaEye />
                      </button>
                      <button
                        onClick={() => handleEdit(product)}
                        className="text-yellow-600 hover:text-yellow-900 transition-colors p-2 rounded-lg hover:bg-yellow-50"
                        title="Edit Product"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(product)}
                        disabled={deleteLoading === product.productId}
                        className="text-red-600 hover:text-red-900 transition-colors p-2 rounded-lg hover:bg-red-50 disabled:opacity-50"
                        title="Delete Product"
                      >
                        {deleteLoading === product.productId ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                        ) : (
                          <FaTrashAlt />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* View Product Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="absolute inset-0 bg-black bg-opacity-50 transition-opacity" onClick={closeModal} />
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto z-10 relative shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-xl">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                    <img
                      className="h-12 w-12 rounded-lg object-cover border border-gray-200"
                      src={selectedProduct.recommendedItem?.image}
                      alt={selectedProduct.recommendedItem?.name}
                      onError={(e) => {
                        e.target.src = "https://via.placeholder.com/48x48/f3f4f6/9ca3af?text=🍽️";
                      }}
                    />
                    {selectedProduct.recommendedItem?.name || "Unnamed Product"}
                  </h2>
                  <div className="flex items-center gap-4 mt-2 flex-wrap">
                    <div className="flex items-center gap-2 text-gray-600">
                      <FaMapMarkerAlt className="text-gray-400" />
                      <span>{selectedProduct.locationName || "Unknown Location"}</span>
                    </div>
                    {getTypeBadge(selectedProduct.type)}
                    <div className="flex items-center gap-2">
                      <StatusSlider product={selectedProduct} />
                    </div>
                  </div>
                </div>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 text-2xl p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Restaurant & Location Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Restaurant Details</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Restaurant Name:</span>
                      <span className="font-semibold">{selectedProduct.restaurantName || "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Location:</span>
                      <span className="font-semibold">{selectedProduct.locationName || "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Product ID:</span>
                      <span className="font-semibold text-sm font-mono">{selectedProduct.productId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Recommended ID:</span>
                      <span className="font-semibold text-sm font-mono">{selectedProduct.recommendedItem?._id}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Product Status</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Status:</span>
                      <StatusSlider product={selectedProduct} />
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Types:</span>
                      {getTypeBadge(selectedProduct.type)}
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Preparation Time:</span>
                      <span className="font-semibold">{selectedProduct.recommendedItem?.preparationTime || "0"} mins</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Product Pricing */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Pricing Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Price:</span>
                    <span className="font-semibold text-green-600 flex items-center gap-1">
                      <FaRupeeSign />{selectedProduct.recommendedItem?.price || "0"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Half Plate:</span>
                    <span className="font-semibold flex items-center gap-1">
                      <FaRupeeSign />{selectedProduct.recommendedItem?.halfPlatePrice || "0"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Full Plate:</span>
                    <span className="font-semibold flex items-center gap-1">
                      <FaRupeeSign />{selectedProduct.recommendedItem?.fullPlatePrice || "0"}
                    </span>
                  </div>
                </div>
                {selectedProduct.recommendedItem?.discount > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Discount:</span>
                    <span className="font-semibold text-red-600">
                      {selectedProduct.recommendedItem?.discount || "0"}%
                    </span>
                  </div>
                )}
              </div>

              {/* Category Information */}
              {selectedProduct.recommendedItem?.category && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Category Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Category Name:</span>
                        <span className="font-semibold">
                          {getCategoryName(selectedProduct.recommendedItem.category)}
                        </span>
                      </div>
                      {selectedProduct.recommendedItem.category.status && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Category Status:</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            selectedProduct.recommendedItem.category.status === 'active' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {selectedProduct.recommendedItem.category.status}
                          </span>
                        </div>
                      )}
                    </div>
                    {selectedProduct.recommendedItem.category.subcategories?.length > 0 && (
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Subcategories:</span>
                          <div className="text-right">
                            {selectedProduct.recommendedItem.category.subcategories.map((subcat, index) => (
                              <div key={index} className="text-sm font-medium">
                                {subcat.subcategoryName}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Reviews & Ratings */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Reviews & Ratings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center gap-2">
                    <FaStar className="text-yellow-400 text-xl" />
                    <span className="text-lg font-bold text-gray-900">
                      {selectedProduct.recommendedItem?.rating || "No rating"}
                    </span>
                  </div>
                </div>
                <div>
                  <span className="text-gray-600 block mb-2">Reviews ({selectedProduct.recommendedItem?.reviews?.length || 0}):</span>
                  <div className="space-y-2">
                    {selectedProduct.recommendedItem?.reviews?.length > 0 ? (
                      selectedProduct.recommendedItem.reviews.map((review, index) => (
                        <div key={index} className="bg-gray-50 p-3 rounded-lg">
                          <div className="flex justify-between items-start">
                            <span className="font-medium">
                              {review.firstName || review.userName || "Anonymous"}
                              {review.lastName && ` ${review.lastName}`}
                            </span>
                            <div className="flex items-center gap-1">
                              <FaStar className="text-yellow-400 text-sm" />
                              <span className="text-sm">{review.stars || review.rating}</span>
                            </div>
                          </div>
                          {review.comment && (
                            <p className="text-gray-600 text-sm mt-1">{review.comment}</p>
                          )}
                          {review.createdAt && (
                            <p className="text-xs text-gray-400 mt-1">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 italic">No reviews yet</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Tags */}
              {selectedProduct.recommendedItem?.tags && selectedProduct.recommendedItem.tags.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedProduct.recommendedItem.tags.map((tag, index) => (
                      <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Description</h3>
                <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg">
                  {selectedProduct.recommendedItem?.content || "No description available."}
                </p>
              </div>

              {/* Product Image */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Product Image</h3>
                <div className="flex justify-center">
                  <img
                    src={selectedProduct.recommendedItem?.image}
                    alt={selectedProduct.recommendedItem?.name}
                    className="max-w-full h-64 object-cover rounded-lg border border-gray-200"
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/400x256/f3f4f6/9ca3af?text=Product+Image";
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-4 rounded-b-xl">
              <div className="flex justify-end gap-3">
                <button
                  onClick={closeModal}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => handleEdit(selectedProduct)}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                  <FaEdit />
                  Edit Product
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {editingProduct && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="absolute inset-0 bg-black bg-opacity-50 transition-opacity" onClick={closeModal} />
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto z-10 relative shadow-2xl">
            <form onSubmit={handleUpdate}>
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-xl">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Edit Product</h2>
                    <p className="text-gray-600 mt-1">Update product details</p>
                    <div className="text-xs text-gray-500 mt-1">
                      Product ID: {editingProduct.productId} | 
                      Recommended ID: {editingProduct.recommendedItem?._id}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={closeModal}
                    className="text-gray-400 hover:text-gray-600 text-2xl p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <FaTimes />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Basic Information</h3>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
                      <input
                        type="text"
                        value={editingProduct.recommendedItem?.name || ""}
                        onChange={(e) => handleRecommendedItemChange("name", e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹) *</label>
                      <input
                        type="number"
                        value={editingProduct.recommendedItem?.price || ""}
                        onChange={(e) => handleRecommendedItemChange("price", e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Half Plate Price (₹)</label>
                      <input
                        type="number"
                        value={editingProduct.recommendedItem?.halfPlatePrice || ""}
                        onChange={(e) => handleRecommendedItemChange("halfPlatePrice", e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Plate Price (₹)</label>
                      <input
                        type="number"
                        value={editingProduct.recommendedItem?.fullPlatePrice || ""}
                        onChange={(e) => handleRecommendedItemChange("fullPlatePrice", e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Discount (%)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={editingProduct.recommendedItem?.discount || ""}
                        onChange={(e) => handleRecommendedItemChange("discount", e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <textarea
                        value={editingProduct.recommendedItem?.content || ""}
                        onChange={(e) => handleRecommendedItemChange("content", e.target.value)}
                        rows="3"
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Preparation Time (minutes)</label>
                      <input
                        type="number"
                        value={editingProduct.recommendedItem?.preparationTime || ""}
                        onChange={(e) => handleRecommendedItemChange("preparationTime", e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  {/* Product Details */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Product Details</h3>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                      <select
                        value={typeof editingProduct.recommendedItem?.category === 'object' 
                          ? editingProduct.recommendedItem.category._id 
                          : editingProduct.recommendedItem?.category || ""}
                        onChange={(e) => handleRecommendedItemChange("category", e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select Category</option>
                        {categories.map((category) => (
                          <option key={category._id} value={category._id}>
                            {category.categoryName}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Product Status *</label>
                      <div className="flex items-center justify-between">
                        <span className={`text-sm ${editingProduct.recommendedItem?.status === 'active' ? 'text-green-600' : 'text-gray-400'}`}>
                          Active
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRecommendedItemChange("status", editingProduct.recommendedItem?.status === "active" ? "inactive" : "active")}
                          className={`w-12 h-6 flex items-center rounded-full p-1 transition-all duration-300 ${editingProduct.recommendedItem?.status === 'active' ? 'bg-green-500' : 'bg-gray-300'} cursor-pointer`}
                        >
                          <div
                            className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${editingProduct.recommendedItem?.status === 'active' ? 'translate-x-6' : 'translate-x-0'}`}
                          />
                        </button>
                        <span className={`text-sm ${editingProduct.recommendedItem?.status === 'inactive' ? 'text-red-600' : 'text-gray-400'}`}>
                          Inactive
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Slide to change status</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Product Types *</label>
                      <input
                        type="text"
                        value={editingProduct.type ? editingProduct.type.join(", ") : ""}
                        onChange={(e) => handleEditChange("type", e.target.value.split(",").map(t => t.trim()))}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g. Veg, Non-Veg"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                      <input
                        type="text"
                        value={Array.isArray(editingProduct.recommendedItem?.tags) 
                          ? editingProduct.recommendedItem.tags.join(", ") 
                          : editingProduct.recommendedItem?.tags || ""}
                        onChange={(e) => handleRecommendedItemChange("tags", e.target.value.split(",").map(t => t.trim()))}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g. Spicy, Healthy, Popular"
                      />
                      <p className="text-xs text-gray-500 mt-1">Separate tags with commas</p>
                    </div>
                  </div>
                </div>

                {/* Image Upload */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Product Image</h3>

                  <div className="flex items-center gap-6">
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Current Image</p>
                      <img
                        src={editingProduct.recommendedItem?.image}
                        alt="Current"
                        className="h-24 w-24 object-cover rounded-lg border border-gray-200"
                        onError={(e) => {
                          e.target.src = "https://via.placeholder.com/96x96/f3f4f6/9ca3af?text=Image";
                        }}
                      />
                    </div>

                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Update Image</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                      <p className="text-xs text-gray-500 mt-1">Leave empty to keep current image</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-4 rounded-b-xl">
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updateLoading}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    {updateLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Updating...
                      </>
                    ) : (
                      <>
                        <FaSave />
                        Update Product
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductList;