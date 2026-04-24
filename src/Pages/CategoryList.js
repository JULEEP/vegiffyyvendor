import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FaEdit, 
  FaTrash, 
  FaPlus, 
  FaImage, 
  FaList, 
  FaTimes,
  FaChevronDown,
  FaChevronUp,
  FaSave,
  FaUpload,
  FaSpinner
} from 'react-icons/fa';

const CategoryList = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [processingId, setProcessingId] = useState(null);
  
  // Edit states
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingSubcategory, setEditingSubcategory] = useState(null);
  const [editFormData, setEditFormData] = useState({
    categoryName: '',
    image: null,
    imagePreview: ''
  });
  const [editSubcategoryFormData, setEditSubcategoryFormData] = useState({
    subcategoryName: '',
    image: null,
    imagePreview: ''
  });

  // Get subAdminId from localStorage
  const getSubAdminId = () => {
    try {
      const userRole = localStorage.getItem("role");
      if (userRole === "subadmin") {
        return localStorage.getItem("adminId");
      }
      return null;
    } catch (error) {
      console.error("Error getting subAdminId:", error);
      return null;
    }
  };

  // Get user info for display
  const getUserInfo = () => {
    try {
      const role = localStorage.getItem("role");
      const name = localStorage.getItem("adminName");
      return {
        role: role || "unknown",
        name: name || ""
      };
    } catch (error) {
      console.error("Error getting user info:", error);
      return { role: "unknown", name: "" };
    }
  };

  const userInfo = getUserInfo();

  // Fetch categories from API
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await axios.get('https://api.vegiffy.in/api/category');
      if (response.data.success) {
        setCategories(response.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // ✅ FIXED: Single delete function for both category and subcategory
  const handleDelete = async (categoryId, subcategoryId = null) => {
    const itemType = subcategoryId ? 'subcategory' : 'category';
    if (!window.confirm(`Are you sure you want to delete this ${itemType}?`)) {
      return;
    }

    setProcessingId(subcategoryId || categoryId);
    try {
      const subAdminId = getSubAdminId();
      
      // Prepare request config
      const config = {};
      
      // If subcategory delete, add subcategoryId in body
      if (subcategoryId) {
        config.data = {
          subcategoryId: subcategoryId,
          ...(subAdminId && { subAdminId })
        };
      } else if (subAdminId) {
        // If category delete and sub-admin, add subAdminId in body
        config.data = { subAdminId };
      }

      // ✅ SINGLE API CALL - categoryId in URL
      const response = await axios.delete(
        `https://api.vegiffy.in/api/category/${categoryId}`,
        config
      );
      
      if (response.data.success) {
        alert(`${itemType.charAt(0).toUpperCase() + itemType.slice(1)} deleted successfully!`);
        fetchCategories();
      }
    } catch (err) {
      setError(err.response?.data?.message || `Failed to delete ${itemType}`);
    } finally {
      setProcessingId(null);
    }
  };

  // Category Edit Functions
  const handleEditCategory = (category) => {
    setEditingCategory(category._id);
    setEditFormData({
      categoryName: category.categoryName,
      image: null,
      imagePreview: category.imageUrl
    });
  };

  const handleCancelEditCategory = () => {
    setEditingCategory(null);
    setEditFormData({
      categoryName: '',
      image: null,
      imagePreview: ''
    });
  };

  const handleEditCategoryChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'image' && files[0]) {
      setEditFormData(prev => ({
        ...prev,
        image: files[0],
        imagePreview: URL.createObjectURL(files[0])
      }));
    } else {
      setEditFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Update category using category update API
  const handleUpdateCategory = async (categoryId) => {
    setProcessingId(categoryId);
    try {
      const subAdminId = getSubAdminId();
      const formData = new FormData();
      
      // Add category data
      formData.append('categoryName', editFormData.categoryName);
      if (editFormData.image) {
        formData.append('image', editFormData.image);
      }

      // Get existing subcategories for this category
      const category = categories.find(c => c._id === categoryId);
      const existingSubcategories = category.subcategories || [];
      
      // Prepare subcategories data - keep existing subcategories as they are
      const subcategoriesData = existingSubcategories.map(sub => ({
        _id: sub._id,
        subcategoryName: sub.subcategoryName,
        subcategoryImageUrl: sub.subcategoryImageUrl
      }));
      
      // Add subcategories as JSON string
      formData.append('subcategories', JSON.stringify(subcategoriesData));

      if (subAdminId) {
        formData.append('subAdminId', subAdminId);
      }

      const response = await axios.put(
        `https://api.vegiffy.in/api/category/${categoryId}`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' }
        }
      );

      if (response.data.success) {
        alert('Category updated successfully!');
        setEditingCategory(null);
        fetchCategories();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update category');
    } finally {
      setProcessingId(null);
    }
  };

  // Subcategory Edit Functions
  const handleEditSubcategory = (subcategory) => {
    setEditingSubcategory(subcategory._id);
    setEditSubcategoryFormData({
      subcategoryName: subcategory.subcategoryName,
      image: null,
      imagePreview: subcategory.subcategoryImageUrl
    });
  };

  const handleCancelEditSubcategory = () => {
    setEditingSubcategory(null);
    setEditSubcategoryFormData({
      subcategoryName: '',
      image: null,
      imagePreview: ''
    });
  };

  const handleEditSubcategoryChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'image' && files[0]) {
      setEditSubcategoryFormData(prev => ({
        ...prev,
        image: files[0],
        imagePreview: URL.createObjectURL(files[0])
      }));
    } else {
      setEditSubcategoryFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Update subcategory using category update API
  const handleUpdateSubcategory = async (categoryId, subcategoryId) => {
    setProcessingId(subcategoryId);
    try {
      const subAdminId = getSubAdminId();
      const formData = new FormData();
      
      // Find the category
      const category = categories.find(c => c._id === categoryId);
      if (!category) return;

      // Update only the specific subcategory
      const updatedSubcategories = category.subcategories.map((sub, index) => {
        if (sub._id === subcategoryId) {
          return {
            _id: sub._id,
            subcategoryName: editSubcategoryFormData.subcategoryName,
            subcategoryImageUrl: editSubcategoryFormData.image ? null : sub.subcategoryImageUrl
          };
        }
        return {
          _id: sub._id,
          subcategoryName: sub.subcategoryName,
          subcategoryImageUrl: sub.subcategoryImageUrl
        };
      });

      // Add subcategories as JSON string
      formData.append('subcategories', JSON.stringify(updatedSubcategories));

      // Add the new subcategory image if changed
      if (editSubcategoryFormData.image) {
        // Find the index of the subcategory being updated
        const subcategoryIndex = category.subcategories.findIndex(sub => sub._id === subcategoryId);
        formData.append(`subcategoryImage_${subcategoryIndex}`, editSubcategoryFormData.image);
      }

      if (subAdminId) {
        formData.append('subAdminId', subAdminId);
      }

      const response = await axios.put(
        `https://api.vegiffy.in/api/category/${categoryId}`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' }
        }
      );

      if (response.data.success) {
        alert('Subcategory updated successfully!');
        setEditingSubcategory(null);
        fetchCategories();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update subcategory');
    } finally {
      setProcessingId(null);
    }
  };

  // Toggle category expansion
  const toggleCategoryExpansion = (categoryId) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <FaList className="text-indigo-600" />
                Categories Management
              </h1>
              <p className="text-gray-600 mt-2">Manage your categories and subcategories</p>
            </div>
          </div>
          {/* User Role Display */}
          {userInfo.role === "subadmin" && (
            <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
              <p className="text-sm text-purple-800">
                <strong>Note:</strong> You are editing as Sub-Admin: <strong>{userInfo.name}</strong>
              </p>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Categories Grid */}
        <div className="grid gap-6">
          {categories.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm">
              <FaImage className="mx-auto text-4xl text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No categories found</h3>
              <p className="text-gray-600 mb-4">Get started by creating your first category.</p>
              <button
                onClick={() => window.location.href = '/create-category'}
                className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition duration-200"
              >
                Create Category
              </button>
            </div>
          ) : (
            categories.map((category) => (
              <div
                key={category._id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all duration-200 hover:shadow-md"
              >
                {/* Category Header */}
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      {/* Category Image */}
                      <div className="flex-shrink-0">
                        <img
                          src={editingCategory === category._id ? editFormData.imagePreview : category.imageUrl}
                          alt={category.categoryName}
                          className="w-16 h-16 rounded-lg object-cover border border-gray-200"
                          onError={(e) => {
                            e.target.src = "https://via.placeholder.com/64x64?text=No+Image";
                          }}
                        />
                      </div>
                      
                      {/* Category Info or Edit Form */}
                      <div className="flex-1">
                        {editingCategory === category._id ? (
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Category Name
                              </label>
                              <input
                                type="text"
                                name="categoryName"
                                value={editFormData.categoryName}
                                onChange={handleEditCategoryChange}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="Enter category name"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Update Image
                              </label>
                              <input
                                type="file"
                                name="image"
                                onChange={handleEditCategoryChange}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                accept="image/*"
                              />
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleUpdateCategory(category._id)}
                                disabled={processingId === category._id}
                                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {processingId === category._id ? (
                                  <>
                                    <FaSpinner className="animate-spin" />
                                    Saving...
                                  </>
                                ) : (
                                  <>
                                    <FaSave className="text-sm" />
                                    Save
                                  </>
                                )}
                              </button>
                              <button
                                onClick={handleCancelEditCategory}
                                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition duration-200 flex items-center gap-2"
                              >
                                <FaTimes className="text-sm" />
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <h3 className="text-xl font-semibold text-gray-900 mb-1">
                              {category.categoryName}
                            </h3>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <span className="flex items-center gap-1">
                                <FaList className="text-xs" />
                                {category.subcategories?.length || 0} subcategories
                              </span>
                              <span>Created: {formatDate(category.createdAt)}</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    {editingCategory !== category._id && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleCategoryExpansion(category._id)}
                          className="p-2 text-gray-500 hover:text-indigo-600 transition duration-200"
                          title={expandedCategory === category._id ? 'Collapse' : 'Expand'}
                        >
                          {expandedCategory === category._id ? <FaChevronUp /> : <FaChevronDown />}
                        </button>
                        <button
                          onClick={() => handleEditCategory(category)}
                          className="p-2 text-blue-600 hover:text-blue-800 transition duration-200"
                          title="Edit Category"
                          disabled={processingId === category._id}
                        >
                          {processingId === category._id ? (
                            <FaSpinner className="animate-spin" />
                          ) : (
                            <FaEdit />
                          )}
                        </button>
                        <button
                          onClick={() => handleDelete(category._id)}
                          className="p-2 text-red-600 hover:text-red-800 transition duration-200"
                          title="Delete Category"
                          disabled={processingId === category._id}
                        >
                          {processingId === category._id ? (
                            <FaSpinner className="animate-spin" />
                          ) : (
                            <FaTrash />
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Subcategories Section */}
                {expandedCategory === category._id && (
                  <div className="border-t border-gray-200 bg-gray-50">
                    <div className="p-6">
                      <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                        <FaList className="text-indigo-600" />
                        Subcategories
                      </h4>
                      
                      {category.subcategories?.length === 0 ? (
                        <div className="text-center py-4 text-gray-500">
                          No subcategories found
                        </div>
                      ) : (
                        <div className="grid gap-4 md:grid-cols-2">
                          {category.subcategories?.map((subcategory) => (
                            <div
                              key={subcategory._id}
                              className="bg-white rounded-lg border border-gray-200 p-4"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3 flex-1">
                                  {/* Subcategory Image */}
                                  <div className="flex-shrink-0">
                                    <img
                                      src={editingSubcategory === subcategory._id ? editSubcategoryFormData.imagePreview : subcategory.subcategoryImageUrl}
                                      alt={subcategory.subcategoryName}
                                      className="w-12 h-12 rounded-lg object-cover border border-gray-200"
                                      onError={(e) => {
                                        e.target.src = "https://via.placeholder.com/48x48?text=No+Image";
                                      }}
                                    />
                                  </div>
                                  
                                  {/* Subcategory Info or Edit Form */}
                                  <div className="flex-1">
                                    {editingSubcategory === subcategory._id ? (
                                      <div className="space-y-2">
                                        <input
                                          type="text"
                                          name="subcategoryName"
                                          value={editSubcategoryFormData.subcategoryName}
                                          onChange={handleEditSubcategoryChange}
                                          className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                          placeholder="Subcategory name"
                                        />
                                        <input
                                          type="file"
                                          name="image"
                                          onChange={handleEditSubcategoryChange}
                                          className="w-full p-1 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                          accept="image/*"
                                        />
                                        <div className="flex gap-2">
                                          <button
                                            onClick={() => handleUpdateSubcategory(category._id, subcategory._id)}
                                            disabled={processingId === subcategory._id}
                                            className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700 transition duration-200 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                                          >
                                            {processingId === subcategory._id ? (
                                              <>
                                                <FaSpinner className="animate-spin text-xs" />
                                                Saving...
                                              </>
                                            ) : (
                                              <>
                                                <FaSave className="text-xs" />
                                                Save
                                              </>
                                            )}
                                          </button>
                                          <button
                                            onClick={handleCancelEditSubcategory}
                                            className="bg-gray-600 text-white px-3 py-1 rounded text-xs hover:bg-gray-700 transition duration-200 flex items-center gap-1"
                                          >
                                            <FaTimes className="text-xs" />
                                            Cancel
                                          </button>
                                        </div>
                                      </div>
                                    ) : (
                                      <h5 className="font-medium text-gray-900">
                                        {subcategory.subcategoryName}
                                      </h5>
                                    )}
                                  </div>
                                </div>
                                
                                {/* Action Buttons */}
                                {editingSubcategory !== subcategory._id && (
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => handleEditSubcategory(subcategory)}
                                      className="p-1 text-blue-600 hover:text-blue-800 transition duration-200"
                                      title="Edit Subcategory"
                                      disabled={processingId === subcategory._id}
                                    >
                                      {processingId === subcategory._id ? (
                                        <FaSpinner className="animate-spin text-sm" />
                                      ) : (
                                        <FaEdit className="text-sm" />
                                      )}
                                    </button>
                                    <button
                                      onClick={() => handleDelete(category._id, subcategory._id)}
                                      className="p-1 text-red-600 hover:text-red-800 transition duration-200"
                                      title="Delete Subcategory"
                                      disabled={processingId === subcategory._id}
                                    >
                                      {processingId === subcategory._id ? (
                                        <FaSpinner className="animate-spin text-sm" />
                                      ) : (
                                        <FaTrash className="text-sm" />
                                      )}
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Stats Footer */}
        {categories.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-600">{categories.length}</div>
                <div className="text-gray-600">Total Categories</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {categories.reduce((total, cat) => total + (cat.subcategories?.length || 0), 0)}
                </div>
                <div className="text-gray-600">Total Subcategories</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {categories.filter(cat => cat.subcategories?.length > 0).length}
                </div>
                <div className="text-gray-600">Categories with Subcategories</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryList;