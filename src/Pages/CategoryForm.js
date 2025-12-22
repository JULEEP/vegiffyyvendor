import React, { useState } from 'react';
import axios from 'axios';
import { FaCloudUploadAlt, FaPlus, FaTimes, FaImage } from 'react-icons/fa';
import { useNavigate } from "react-router-dom";

const CategoryForm = () => {
  const [categoryName, setCategoryName] = useState('');
  const [subcategories, setSubcategories] = useState([{ subcategoryName: '', subcategoryImage: null }]);
  const [categoryImage, setCategoryImage] = useState(null);
  const [categoryImagePreview, setCategoryImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  // 🟢 Handlers
  const handleCategoryNameChange = (e) => setCategoryName(e.target.value);

  const handleSubcategoryChange = (index, e) => {
    const updated = [...subcategories];
    updated[index][e.target.name] = e.target.value;
    setSubcategories(updated);
  };

  const handleSubcategoryImageChange = (index, e) => {
    const file = e.target.files[0];
    if (file) {
      const updated = [...subcategories];
      updated[index].subcategoryImage = file;
      updated[index].subcategoryImagePreview = URL.createObjectURL(file);
      setSubcategories(updated);
    }
  };

  const handleCategoryImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCategoryImage(file);
      setCategoryImagePreview(URL.createObjectURL(file));
    }
  };

  const handleAddSubcategory = () => {
    setSubcategories([...subcategories, { subcategoryName: '', subcategoryImage: null }]);
  };

  const handleRemoveSubcategory = (index) => {
    setSubcategories(subcategories.filter((_, i) => i !== index));
  };

  // 🟢 Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // 🧠 Manual validation (instead of browser)
    if (!categoryName.trim()) {
      alert('Please enter a category name');
      return;
    }
    if (!categoryImage) {
      alert('Please upload a main category image');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("categoryName", categoryName);
      formData.append("image", categoryImage);

      // Prepare subcategory names
      const subData = subcategories.map(sub => ({
        subcategoryName: sub.subcategoryName,
      }));
      formData.append("subcategories", JSON.stringify(subData));

      // Attach subcategory images
      subcategories.forEach((sub, i) => {
        if (sub.subcategoryImage) {
          formData.append(`subcategoryImage_${i}`, sub.subcategoryImage);
        }
      });

      console.log("📦 Sending form data to backend...");

      const res = await axios.post("https://api.vegiffyy.com/api/category", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("✅ API Response:", res.data);
      alert("🎉 Category created successfully!");
      navigate("/categorylist");

      // Reset
      setCategoryName('');
      setCategoryImage(null);
      setCategoryImagePreview(null);
      setSubcategories([{ subcategoryName: '', subcategoryImage: null }]);
    } catch (err) {
      console.error("❌ API Error:", err);
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  // 🟢 Reusable upload input
  const FileUploadInput = ({ onChange, preview, label }) => {
    const fileRef = React.useRef();

    const handleClick = () => fileRef.current?.click();

    return (
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">{label}</label>

        <div className="flex items-center gap-4">
          <input
            type="file"
            ref={fileRef}
            onChange={onChange}
            accept="image/*"
            className="hidden" // 🚀 Removed required to prevent invalid form control issue
          />

          <button
            type="button"
            onClick={handleClick}
            className="flex items-center gap-3 px-6 py-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-indigo-400 hover:bg-indigo-50 transition-all duration-200 w-full max-w-md"
          >
            <FaCloudUploadAlt className="text-2xl text-indigo-600" />
            <div className="text-left">
              <p className="font-medium text-gray-700">Click to upload {label.toLowerCase()}</p>
              <p className="text-sm text-gray-500">PNG, JPG, JPEG up to 5MB</p>
            </div>
          </button>

          {preview && (
            <div className="relative">
              <img
                src={preview}
                alt="Preview"
                className="w-20 h-20 object-cover rounded-lg border-2 border-indigo-200 shadow-sm"
              />
              <div className="absolute -top-1 -right-1 bg-indigo-600 text-white rounded-full w-5 h-5 flex items-center justify-center">
                <FaImage className="text-xs" />
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto p-8 bg-white shadow-lg rounded-2xl border border-gray-100">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Create Category</h2>
        <p className="text-gray-600">Add a new category with subcategories for your restaurant</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* 🟢 Category Info */}
        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
          <label className="block text-lg font-semibold text-gray-800 mb-4">Category Information</label>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category Name *</label>
              <input
                type="text"
                value={categoryName}
                onChange={handleCategoryNameChange}
                placeholder="Enter category name (e.g., Desserts)"
                className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <FileUploadInput
              onChange={handleCategoryImageChange}
              preview={categoryImagePreview}
              label="Main Category Image"
            />
          </div>
        </div>

        {/* 🟢 Subcategories */}
        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
          <div className="flex justify-between items-center mb-6">
            <label className="block text-lg font-semibold text-gray-800">Subcategories</label>
            <button
              type="button"
              onClick={handleAddSubcategory}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors duration-200"
            >
              <FaPlus className="text-sm" /> Add Subcategory
            </button>
          </div>

          <div className="space-y-6">
            {subcategories.map((sub, index) => (
              <div key={index} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-md font-semibold text-gray-700">
                    <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm">
                      Subcategory {index + 1}
                    </span>
                  </h3>
                  {subcategories.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveSubcategory(index)}
                      className="flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                    >
                      <FaTimes className="text-sm" /> Remove
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subcategory Name *
                    </label>
                    <input
                      type="text"
                      name="subcategoryName"
                      value={sub.subcategoryName}
                      onChange={(e) => handleSubcategoryChange(index, e)}
                      placeholder="Enter subcategory name"
                      className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <FileUploadInput
                    onChange={(e) => handleSubcategoryImageChange(index, e)}
                    preview={sub.subcategoryImagePreview}
                    label="Subcategory Image"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 🟢 Submit */}
        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-600">
              Total: {subcategories.length} subcategory{subcategories.length !== 1 ? 's' : ''}
            </p>
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 focus:ring-2 focus:ring-indigo-500 transition-all duration-200 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Creating Category...
                </>
              ) : (
                <>
                  <FaCloudUploadAlt /> Create Category
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* 🟢 Error Message */}
      {error && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
          <FaTimes className="inline mr-2" />
          {error}
        </div>
      )}
    </div>
  );
};

export default CategoryForm;
