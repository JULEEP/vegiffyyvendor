import React, { useEffect, useState } from "react";
import { 
  FaEdit, 
  FaTrashAlt, 
  FaEye, 
  FaStar, 
  FaRupeeSign, 
  FaMapMarkerAlt, 
  FaTag, 
  FaSearch, 
  FaTimes, 
  FaSave,
  FaSpinner
} from "react-icons/fa";
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
        const res = await axios.get(`https://api.vegiffy.in/api/restaurant-products/${vendorId}`);
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
      const response = await axios.get("https://api.vegiffy.in/api/category");
      if (response.data.success) {
        setCategories(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
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
        product.type?.some(t => t?.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredProducts(filtered);
    }
  }, [searchTerm, products]);

  const handleView = (product) => {
    setSelectedProduct(product);
  };

  const handleEdit = (product) => {
    const productCopy = JSON.parse(JSON.stringify(product));
    
    if (!productCopy.type) {
      productCopy.type = [];
    } else if (!Array.isArray(productCopy.type)) {
      productCopy.type = [productCopy.type];
    }
    
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
        `https://api.vegiffy.in/api/restaurant-products/${productId}/${recommendedId}`
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

  // Status toggle handler
  const handleStatusToggle = async (product) => {
    const productId = product.productId;
    const recommendedId = product.recommendedItem?._id;
    const currentStatus = product.recommendedItem?.status || "inactive";
    const newStatus = currentStatus === "active" ? "inactive" : "active";

    if (!productId || !recommendedId) {
      alert("Product ID or Recommended ID not found");
      return;
    }

    setUpdatingStatus(prev => ({ ...prev, [productId]: true }));

    try {
      const formData = new FormData();
      const recommendedData = { status: newStatus };
      formData.append("recommended", JSON.stringify(recommendedData));

      const response = await axios.put(
        `https://api.vegiffy.in/api/restaurant-product/${productId}/${recommendedId}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (response.data.success) {
        setProducts(prevProducts => 
          prevProducts.map(p => 
            p.productId === productId 
              ? { ...p, recommendedItem: { ...p.recommendedItem, status: newStatus } }
              : p
          )
        );
        setFilteredProducts(prevFiltered => 
          prevFiltered.map(p => 
            p.productId === productId 
              ? { ...p, recommendedItem: { ...p.recommendedItem, status: newStatus } }
              : p
          )
        );
      }
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status");
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

      const originalProduct = products.find(p => p.productId === productId);
      if (!originalProduct) {
        alert("Product not found");
        setUpdateLoading(false);
        return;
      }

      const originalRecommended = originalProduct.recommendedItem || {};

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

      if (editingProduct.recommendedItem?.tags) {
        recommendedData.tags = Array.isArray(editingProduct.recommendedItem.tags) 
          ? editingProduct.recommendedItem.tags 
          : [editingProduct.recommendedItem.tags];
      }

      if (editingProduct.recommendedItem?.category) {
        recommendedData.category = typeof editingProduct.recommendedItem.category === 'object'
          ? editingProduct.recommendedItem.category._id
          : editingProduct.recommendedItem.category;
      }

      formData.append("recommended", JSON.stringify(recommendedData));
      
      if (JSON.stringify(editingProduct.type) !== JSON.stringify(originalProduct.type)) {
        formData.append('type', JSON.stringify(editingProduct.type));
      }

      if (editingProduct.recommendedItem?.newImage) {
        formData.append("recommendedImage", editingProduct.recommendedItem.newImage);
      }

      const response = await axios.put(
        `https://api.vegiffy.in/api/restaurant-product/${productId}/${recommendedId}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (response.data.success) {
        const updatedProduct = response.data.data;
        const updatedRecommendedItem = updatedProduct.recommended?.find(
          item => item._id === recommendedId
        );

        if (updatedRecommendedItem) {
          const updatedProductData = {
            ...originalProduct,
            type: updatedProduct.type || originalProduct.type,
            recommendedItem: {
              ...originalRecommended,
              ...updatedRecommendedItem,
              category: typeof updatedRecommendedItem.category === 'string' && typeof originalRecommended.category === 'object'
                ? originalRecommended.category
                : updatedRecommendedItem.category
            }
          };

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
      console.error("Error updating product:", error);
      alert("Failed to update product: " + (error.response?.data?.message || error.message));
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleEditChange = (field, value) => {
    setEditingProduct(prev => ({ ...prev, [field]: value }));
  };

  const handleRecommendedItemChange = (field, value) => {
    setEditingProduct(prev => ({
      ...prev,
      recommendedItem: { ...prev.recommendedItem, [field]: value }
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditingProduct(prev => ({
        ...prev,
        recommendedItem: { ...prev.recommendedItem, newImage: file }
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
      <div className="flex items-center gap-1">
        <button
          onClick={() => !isUpdating && handleStatusToggle(product)}
          disabled={isUpdating}
          className={`relative inline-flex items-center h-5 rounded-full w-9 transition-colors ${
            isActive ? 'bg-green-500' : 'bg-gray-300'
          } ${isUpdating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <span
            className={`inline-block w-3 h-3 transform transition-transform bg-white rounded-full ${
              isActive ? 'translate-x-5' : 'translate-x-1'
            }`}
          />
        </button>
        {isUpdating && <FaSpinner className="animate-spin text-xs text-gray-500" />}
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
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${config.color} flex items-center gap-1 w-fit`}>
        <span>{config.icon}</span>
        {typeArray.join(", ")}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="w-full bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <FaTag className="text-red-500 text-sm" />
          </div>
          <h3 className="text-base font-semibold text-red-800 mb-1">Error Loading Products</h3>
          <p className="text-sm text-red-600 mb-3">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header with Restaurant Info - Compact */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <span className="text-green-600 text-xl">🥗</span>
              Restaurant Products
            </h2>
            <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 flex-wrap">
              <span className="flex items-center gap-1">
                <span className="font-medium">Status:</span>
                <span className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${
                  restaurantStatus === 'active' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {restaurantStatus || 'Unknown'}
                </span>
              </span>
              <span className="flex items-center gap-1">
                <FaStar className="text-yellow-400 text-xs" />
                <span>{totalRatings}</span>
              </span>
              <span className="flex items-center gap-1">
                <FaEye className="text-blue-400 text-xs" />
                <span>{totalReviews}</span>
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-full">
            <FaTag className="text-green-500" />
            <span>{filteredProducts.length}</span>
          </div>
        </div>
      </div>

      {/* Search Filter - Compact */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
            <FaSearch className="text-gray-400 text-xs" />
          </div>
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-7 pr-7 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-green-500 focus:border-green-500"
          />
          {searchTerm && (
            <button
              onClick={clearSearch}
              className="absolute inset-y-0 right-0 pr-2 flex items-center text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Products Table - Compact */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <FaTag className="text-gray-400 text-lg" />
          </div>
          <h3 className="text-base font-semibold text-gray-600 mb-1">
            {searchTerm ? "No Products Found" : "No Products Available"}
          </h3>
          <p className="text-xs text-gray-500">
            {searchTerm ? "Try adjusting your search" : "Add products to your menu"}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Rating</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProducts.map((product) => (
                  <tr key={product.recommendedItem?._id || product._id} className="hover:bg-gray-50">
                    {/* Product Info - Compact */}
                    <td className="px-3 py-2">
                      <div className="flex items-center">
                        <img
                          className="h-8 w-8 rounded object-cover border border-gray-200"
                          src={product.recommendedItem?.image}
                          alt={product.recommendedItem?.name}
                          onError={(e) => {
                            e.target.src = "https://via.placeholder.com/32x32/f3f4f6/9ca3af?text=🍽️";
                          }}
                        />
                        <div className="ml-2">
                          <div className="text-xs font-medium text-gray-900">
                            {product.recommendedItem?.name?.substring(0, 15) || "Unnamed"}
                            {product.recommendedItem?.name?.length > 15 && "..."}
                          </div>
                          <div className="text-xs text-gray-500 flex items-center gap-1">
                            <FaMapMarkerAlt className="text-gray-400 text-[10px]" />
                            {product.locationName?.substring(0, 10) || "Unknown"}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Type - Compact */}
                    <td className="px-3 py-2">
                      {getTypeBadge(product.type)}
                    </td>

                    {/* Price - Compact */}
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-0.5 text-xs font-medium text-gray-900">
                        <FaRupeeSign className="text-gray-500 text-[10px]" />
                        {product.recommendedItem?.price || "0"}
                      </div>
                    </td>

                    {/* Rating - Compact */}
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-0.5">
                        <FaStar className="text-yellow-400 text-[10px]" />
                        <span className="text-xs font-medium text-gray-900">
                          {product.recommendedItem?.rating || "0"}
                        </span>
                      </div>
                    </td>

                    {/* Status - Compact */}
                    <td className="px-3 py-2">
                      <StatusSlider product={product} />
                    </td>

                    {/* Actions - Compact */}
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleView(product)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                          title="View"
                        >
                          <FaEye className="text-sm" />
                        </button>
                        <button
                          onClick={() => handleEdit(product)}
                          className="text-yellow-600 hover:text-yellow-900 p-1 rounded hover:bg-yellow-50"
                          title="Edit"
                        >
                          <FaEdit className="text-sm" />
                        </button>
                        <button
                          onClick={() => handleDelete(product)}
                          disabled={deleteLoading === product.productId}
                          className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 disabled:opacity-50"
                          title="Delete"
                        >
                          {deleteLoading === product.productId ? (
                            <FaSpinner className="animate-spin text-sm" />
                          ) : (
                            <FaTrashAlt className="text-sm" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* View Product Modal - Compact */}
      {selectedProduct && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={closeModal} />
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto z-10 relative">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-3 flex justify-between items-center">
              <h3 className="text-base font-bold text-gray-900">Product Details</h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <FaTimes />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div className="flex items-center gap-3">
                <img
                  className="h-16 w-16 rounded object-cover border border-gray-200"
                  src={selectedProduct.recommendedItem?.image}
                  alt={selectedProduct.recommendedItem?.name}
                />
                <div>
                  <h4 className="text-base font-semibold">{selectedProduct.recommendedItem?.name}</h4>
                  <p className="text-xs text-gray-500">{selectedProduct.locationName}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-gray-500">Price</p>
                  <p className="font-medium">₹{selectedProduct.recommendedItem?.price}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Status</p>
                  <StatusSlider product={selectedProduct} />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Type</p>
                  {getTypeBadge(selectedProduct.type)}
                </div>
                <div>
                  <p className="text-xs text-gray-500">Prep Time</p>
                  <p className="font-medium">{selectedProduct.recommendedItem?.preparationTime || 0} mins</p>
                </div>
              </div>

              <div>
                <p className="text-xs text-gray-500 mb-1">Description</p>
                <p className="text-sm bg-gray-50 p-2 rounded">
                  {selectedProduct.recommendedItem?.content || "No description"}
                </p>
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-3 flex justify-end">
              <button
                onClick={closeModal}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Product Modal - Compact */}
      {editingProduct && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={closeModal} />
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[80vh] overflow-y-auto z-10 relative">
            <form onSubmit={handleUpdate}>
              <div className="sticky top-0 bg-white border-b border-gray-200 p-3 flex justify-between items-center">
                <h3 className="text-base font-bold text-gray-900">Edit Product</h3>
                <button type="button" onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                  <FaTimes />
                </button>
              </div>

              <div className="p-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Basic Info */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold border-b pb-1">Basic Info</h4>
                    
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Name *</label>
                      <input
                        type="text"
                        value={editingProduct.recommendedItem?.name || ""}
                        onChange={(e) => handleRecommendedItemChange("name", e.target.value)}
                        className="w-full p-1.5 text-sm border rounded focus:ring-1 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Price (₹) *</label>
                      <input
                        type="number"
                        value={editingProduct.recommendedItem?.price || ""}
                        onChange={(e) => handleRecommendedItemChange("price", e.target.value)}
                        className="w-full p-1.5 text-sm border rounded"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Half Plate</label>
                        <input
                          type="number"
                          value={editingProduct.recommendedItem?.halfPlatePrice || ""}
                          onChange={(e) => handleRecommendedItemChange("halfPlatePrice", e.target.value)}
                          className="w-full p-1.5 text-sm border rounded"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Full Plate</label>
                        <input
                          type="number"
                          value={editingProduct.recommendedItem?.fullPlatePrice || ""}
                          onChange={(e) => handleRecommendedItemChange("fullPlatePrice", e.target.value)}
                          className="w-full p-1.5 text-sm border rounded"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Discount (%)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={editingProduct.recommendedItem?.discount || ""}
                        onChange={(e) => handleRecommendedItemChange("discount", e.target.value)}
                        className="w-full p-1.5 text-sm border rounded"
                      />
                    </div>
                  </div>

                  {/* Details */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold border-b pb-1">Details</h4>

                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Category</label>
                      <select
                        value={typeof editingProduct.recommendedItem?.category === 'object' 
                          ? editingProduct.recommendedItem.category._id 
                          : editingProduct.recommendedItem?.category || ""}
                        onChange={(e) => handleRecommendedItemChange("category", e.target.value)}
                        className="w-full p-1.5 text-sm border rounded"
                      >
                        <option value="">Select</option>
                        {categories.map((category) => (
                          <option key={category._id} value={category._id}>
                            {category.categoryName}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Status</label>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => handleRecommendedItemChange("status", 
                            editingProduct.recommendedItem?.status === "active" ? "inactive" : "active"
                          )}
                          className={`relative inline-flex items-center h-5 rounded-full w-9 ${
                            editingProduct.recommendedItem?.status === 'active' ? 'bg-green-500' : 'bg-gray-300'
                          }`}
                        >
                          <span
                            className={`inline-block w-3 h-3 transform transition-transform bg-white rounded-full ${
                              editingProduct.recommendedItem?.status === 'active' ? 'translate-x-5' : 'translate-x-1'
                            }`}
                          />
                        </button>
                        <span className="text-xs">
                          {editingProduct.recommendedItem?.status === 'active' ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Types *</label>
                      <input
                        type="text"
                        value={editingProduct.type ? editingProduct.type.join(", ") : ""}
                        onChange={(e) => handleEditChange("type", e.target.value.split(",").map(t => t.trim()))}
                        className="w-full p-1.5 text-sm border rounded"
                        placeholder="veg, nonveg"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Tags</label>
                      <input
                        type="text"
                        value={Array.isArray(editingProduct.recommendedItem?.tags) 
                          ? editingProduct.recommendedItem.tags.join(", ") 
                          : editingProduct.recommendedItem?.tags || ""}
                        onChange={(e) => handleRecommendedItemChange("tags", e.target.value.split(",").map(t => t.trim()))}
                        className="w-full p-1.5 text-sm border rounded"
                        placeholder="spicy, healthy"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Prep Time (mins)</label>
                      <input
                        type="number"
                        value={editingProduct.recommendedItem?.preparationTime || ""}
                        onChange={(e) => handleRecommendedItemChange("preparationTime", e.target.value)}
                        className="w-full p-1.5 text-sm border rounded"
                      />
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Description</label>
                  <textarea
                    value={editingProduct.recommendedItem?.content || ""}
                    onChange={(e) => handleRecommendedItemChange("content", e.target.value)}
                    rows="2"
                    className="w-full p-1.5 text-sm border rounded"
                  />
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Product Image</label>
                  <div className="flex items-center gap-3">
                    <img
                      src={editingProduct.recommendedItem?.image}
                      alt="Current"
                      className="h-12 w-12 rounded object-cover border"
                    />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-3 py-1.5 text-sm border rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateLoading}
                  className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1"
                >
                  {updateLoading ? <FaSpinner className="animate-spin" /> : <FaSave />}
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductList;