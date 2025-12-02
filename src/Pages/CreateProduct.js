import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const CreateProductForm = () => {
  const navigate = useNavigate();

  const [restaurantId, setRestaurantId] = useState("");
  const [recommended, setRecommended] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  useEffect(() => {
    const vendorId = localStorage.getItem("vendorId");
    if (vendorId) {
      setRestaurantId(vendorId);
    } else {
      console.error("Vendor ID not found in localStorage");
      alert("Vendor ID not found. Please login again.");
    }
    
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setCategoriesLoading(true);
      const response = await axios.get("http://31.97.206.144:5051/api/category");
      if (response.data.success) {
        setCategories(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      alert("Failed to load categories.");
    } finally {
      setCategoriesLoading(false);
    }
  };

  // Recommended Products Functions
  const handleAddRecommended = () => {
    setRecommended([
      ...recommended,
      {
        name: "",
        price: "",
        halfPlatePrice: "",
        fullPlatePrice: "",
        discount: "",
        tags: [""],
        content: "",
        category: "",
        preparationTime: "",
        imageFile: null,
      },
    ]);
  };

  const handleRemoveRecommended = (index) => {
    const updated = recommended.filter((_, i) => i !== index);
    setRecommended(updated);
  };

  const handleRecommendedChange = (index, field, value) => {
    const updated = [...recommended];
    updated[index][field] = value;
    setRecommended(updated);
  };

  const handleTagChange = (index, tagIndex, value) => {
    const updated = [...recommended];
    updated[index].tags[tagIndex] = value;
    setRecommended(updated);
  };

  const handleAddTag = (index) => {
    const updated = [...recommended];
    updated[index].tags.push("");
    setRecommended(updated);
  };

  const handleRemoveTag = (index, tagIndex) => {
    const updated = [...recommended];
    updated[index].tags = updated[index].tags.filter((_, i) => i !== tagIndex);
    setRecommended(updated);
  };

  const handleRecommendedImageChange = (index, e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Image size should be less than 5MB");
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        alert("Please select a valid image file");
        return;
      }

      const updated = [...recommended];
      updated[index].imageFile = file;
      setRecommended(updated);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!restaurantId) {
      alert("Vendor ID not found. Please login again.");
      return;
    }

    // Validate recommended products
    if (recommended.length === 0) {
      alert("Please add at least one recommended product");
      return;
    }

    const hasEmptyRecommendedFields = recommended.some(item => 
      !item.name || !item.price || !item.category || !item.imageFile
    );

    if (hasEmptyRecommendedFields) {
      alert("Please fill all required fields (Name, Price, Category, Image) for each recommended product");
      return;
    }

    const formData = new FormData();
    formData.append("restaurantId", restaurantId);

    // Prepare recommended array - matching backend structure
    const formattedRecommended = recommended.map((item) => ({
      name: item.name,
      price: parseFloat(item.price) || 0,
      halfPlatePrice: parseFloat(item.halfPlatePrice) || 0,
      fullPlatePrice: parseFloat(item.fullPlatePrice) || 0,
      discount: parseFloat(item.discount) || 0,
      tags: item.tags.filter(tag => tag.trim() !== ""),
      content: item.content,
      category: item.category,
      preparationTime: item.preparationTime || "",
    }));

    formData.append("recommended", JSON.stringify(formattedRecommended));

    // Attach recommended images
    recommended.forEach((item, index) => {
      if (item.imageFile) {
        console.log(`📤 Appending recommended image ${index}:`, item.imageFile.name);
        formData.append("recommendedImages", item.imageFile);
      }
    });

    // Debug FormData
    console.log("=== 🚀 FORM DATA DEBUG ===");
    console.log("📦 FormData contents:");
    for (let [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log(`📁 ${key}:`, value.name, `(${value.size} bytes)`, value.type);
      } else {
        console.log(`📄 ${key}:`, value);
      }
    }
    console.log("=== 🎯 END DEBUG ===");

    try {
      setLoading(true);
      const response = await axios.post("http://31.97.206.144:5051/api/restaurant-products", formData, {
        headers: { 
          "Content-Type": "multipart/form-data",
        },
        timeout: 30000,
      });

      console.log("✅ Success response:", response.data);
      
      if (response.data.success) {
        alert("🎉 Product created successfully!");
        navigate("/productlist");
      } else {
        alert("Failed to create product: " + (response.data.message || "Unknown error"));
      }
      
    } catch (error) {
      console.error("❌ Error:", error);
      if (error.response) {
        console.error("❌ Error response:", error.response.data);
        alert(`Failed to create product: ${error.response.data.message || error.response.data.error}`);
      } else if (error.request) {
        console.error("❌ No response received:", error.request);
        alert("Network error: Could not connect to server");
      } else {
        alert("Failed to create product.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded shadow max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Create Restaurant Product</h2>
      
      {/* Vendor Info */}
      <div className="mb-6 p-3 bg-blue-50 rounded border border-blue-200">
        <p className="text-sm text-blue-700">
          <span className="font-semibold">Vendor ID:</span> <span className="font-mono bg-blue-100 px-2 py-1 rounded">{restaurantId || "Not found"}</span>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Recommended Products Section */}
        <div className="border border-gray-200 rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-gray-800">Recommended Products</h3>
            <button
              type="button"
              onClick={handleAddRecommended}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-2"
            >
              <span>+</span>
              Add Recommended Product
            </button>
          </div>

          {recommended.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded">
              <p className="text-gray-500">No recommended products added yet</p>
              <p className="text-sm text-gray-400 mt-1">Click "Add Recommended Product" to get started</p>
            </div>
          ) : (
            recommended.map((item, index) => (
              <div key={index} className="border border-gray-200 p-6 mb-6 rounded-lg bg-gray-50 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-md font-semibold text-gray-700">Recommended Product #{index + 1}</h4>
                  <button
                    type="button"
                    onClick={() => handleRemoveRecommended(index)}
                    className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 text-sm"
                  >
                    Remove
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Product Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Product Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      className="p-2 border border-gray-300 rounded w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g. Paneer Butter Masala"
                      value={item.name}
                      onChange={(e) => handleRecommendedChange(index, "name", e.target.value)}
                      required
                    />
                  </div>

                  {/* Price */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Price (₹) <span className="text-red-500">*</span>
                    </label>
                    <input
                      className="p-2 border border-gray-300 rounded w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g. 250"
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.price}
                      onChange={(e) => handleRecommendedChange(index, "price", e.target.value)}
                      required
                    />
                  </div>

                  {/* Half Plate Price */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Half Plate Price (₹)
                    </label>
                    <input
                      className="p-2 border border-gray-300 rounded w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g. 150"
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.halfPlatePrice}
                      onChange={(e) => handleRecommendedChange(index, "halfPlatePrice", e.target.value)}
                    />
                  </div>

                  {/* Full Plate Price */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Plate Price (₹)
                    </label>
                    <input
                      className="p-2 border border-gray-300 rounded w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g. 280"
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.fullPlatePrice}
                      onChange={(e) => handleRecommendedChange(index, "fullPlatePrice", e.target.value)}
                    />
                  </div>

                  {/* Discount */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Discount (%)
                    </label>
                    <input
                      className="p-2 border border-gray-300 rounded w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g. 10"
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={item.discount}
                      onChange={(e) => handleRecommendedChange(index, "discount", e.target.value)}
                    />
                  </div>

                  {/* Preparation Time */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Preparation Time
                    </label>
                    <input
                      className="p-2 border border-gray-300 rounded w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g. 15-20 mins"
                      value={item.preparationTime}
                      onChange={(e) => handleRecommendedChange(index, "preparationTime", e.target.value)}
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      className="p-2 border border-gray-300 rounded w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={item.category}
                      onChange={(e) => handleRecommendedChange(index, "category", e.target.value)}
                      required
                    >
                      <option value="">Select Category</option>
                      {categoriesLoading ? (
                        <option disabled>Loading categories...</option>
                      ) : (
                        categories.map((category) => (
                          <option key={category._id} value={category._id}>
                            {category.categoryName}
                          </option>
                        ))
                      )}
                    </select>
                  </div>

                  {/* Description */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      className="p-2 border border-gray-300 rounded w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Product description..."
                      rows="3"
                      value={item.content}
                      onChange={(e) => handleRecommendedChange(index, "content", e.target.value)}
                    />
                  </div>

                  {/* Tags */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tags
                    </label>
                    <div className="space-y-2">
                      {item.tags.map((tag, tagIndex) => (
                        <div key={tagIndex} className="flex gap-2 items-center">
                          <input
                            className="p-2 border border-gray-300 rounded w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder={`Tag ${tagIndex + 1} (e.g., spicy, veg)`}
                            value={tag}
                            onChange={(e) => handleTagChange(index, tagIndex, e.target.value)}
                          />
                          {item.tags.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveTag(index, tagIndex)}
                              className="px-3 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 text-sm whitespace-nowrap"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleAddTag(index)}
                      className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
                    >
                      <span>+</span>
                      Add Tag
                    </button>
                  </div>

                  {/* Image Upload */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Product Image <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleRecommendedImageChange(index, e)}
                      className="p-2 border border-gray-300 rounded w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      required
                    />
                    {item.imageFile && (
                      <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
                        <p className="text-sm text-green-700 flex items-center gap-2">
                          <span>✅</span>
                          Image selected: <span className="font-medium">{item.imageFile.name}</span>
                          <span className="text-xs text-green-600">({Math.round(item.imageFile.size / 1024)} KB)</span>
                        </p>
                      </div>
                    )}
                    <p className="text-xs text-gray-500 mt-1">Max file size: 5MB • Supported formats: JPG, PNG, WebP</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-3 pt-6 border-t">
          <button
            type="button"
            onClick={() => navigate("/productlist")}
            className="px-6 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !restaurantId || recommended.length === 0}
            className="px-6 py-2 text-white bg-blue-600 rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Creating...
              </>
            ) : (
              "Create Product"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateProductForm;