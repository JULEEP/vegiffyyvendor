import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FiStar, 
  FiMapPin, 
  FiMail, 
  FiPhone, 
  FiCalendar,
  FiEdit3,
  FiDollarSign,
  FiNavigation,
  FiClock,
  FiTag,
  FiUsers,
  FiGift,
  FiCheckCircle,
  FiXCircle,
  FiCopy,
  FiShare2,
  FiSave,
  FiX,
  FiUpload,
  FiFileText,
  FiCreditCard,
  FiShield,
  FiUser,
  FiZoomIn,
  FiDownload,
  FiCheck,
  FiFile
} from 'react-icons/fi';

const VendorProfile = () => {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copySuccess, setCopySuccess] = useState('');
  const [shareSuccess, setShareSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [currentDocument, setCurrentDocument] = useState(null);
  
  // New states for document uploads
  const [uploadingDocs, setUploadingDocs] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState('');
  const [docFiles, setDocFiles] = useState({
    declarationForm: null,
    vendorAgreement: null
  });
  const [docPreviews, setDocPreviews] = useState({
    declarationForm: null,
    vendorAgreement: null
  });

  const vendorId = localStorage.getItem("vendorId");

  const fetchProfileData = async () => {
    try {
      setError('');
      const res = await axios.get(`http://31.97.206.144:5051/api/profile/${vendorId}`);
      
      if (res.data?.success) {
        setProfileData(res.data.data);
        setEditForm({
          restaurantName: res.data.data.restaurantName || '',
          description: res.data.data.description || '',
          locationName: res.data.data.locationName || '',
          rating: res.data.data.rating || '',
          status: res.data.data.status || 'active',
          gstNumber: res.data.data.gstNumber || ''
        });

        // Set document previews if they exist
        if (res.data.data.declarationForm?.url) {
          setDocPreviews(prev => ({ ...prev, declarationForm: res.data.data.declarationForm.url }));
        }
        if (res.data.data.vendorAgreement?.url) {
          setDocPreviews(prev => ({ ...prev, vendorAgreement: res.data.data.vendorAgreement.url }));
        }
      } else {
        setError(res.data?.message || 'Failed to fetch profile data');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Server error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (vendorId) {
      fetchProfileData();
    } else {
      setError('Vendor ID not found. Please login again.');
      setLoading(false);
    }
  }, [vendorId]);

  // Handle input changes for edit form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle image selection for edit form
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  // Handle form submission for editing profile
  const handleSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);

    try {
      const formData = new FormData();
      
      // Append form fields
      Object.keys(editForm).forEach(key => {
        if (editForm[key] !== undefined && editForm[key] !== null) {
          formData.append(key, editForm[key]);
        }
      });

      // Append image if selected
      if (imageFile) {
        formData.append('image', imageFile);
      }

      const response = await axios.put(
        `http://31.97.206.144:5051/api/restaurant/${vendorId}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.data.success) {
        setProfileData(response.data.data);
        setIsEditing(false);
        setImageFile(null);
        setImagePreview('');
        
        // Show success message
        setError('');
        setTimeout(() => {
          alert('Profile updated successfully!');
        }, 100);
      } else {
        setError(response.data.message || 'Failed to update profile');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Server error');
    } finally {
      setEditLoading(false);
    }
  };

  // Cancel editing
  const handleCancel = () => {
    setIsEditing(false);
    setEditForm({
      restaurantName: profileData.restaurantName || '',
      description: profileData.description || '',
      locationName: profileData.locationName || '',
      rating: profileData.rating || '',
      status: profileData.status || 'active',
      gstNumber: profileData.gstNumber || ''
    });
    setImageFile(null);
    setImagePreview('');
  };

  // Handle document file changes
  const handleDocFileChange = (fileType, file) => {
    if (!file) return;

    setDocFiles(prev => ({ ...prev, [fileType]: file }));
    
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        setDocPreviews(prev => ({ ...prev, [fileType]: reader.result }));
      };
      reader.readAsDataURL(file);
    } else {
      setDocPreviews(prev => ({ ...prev, [fileType]: 'pdf' }));
    }
  };

  // Remove document file
  const removeDocFile = (fileType) => {
    setDocFiles(prev => ({ ...prev, [fileType]: null }));
    setDocPreviews(prev => ({ ...prev, [fileType]: null }));
  };

  // Upload documents
  const uploadDocuments = async () => {
    if (!docFiles.declarationForm && !docFiles.vendorAgreement) {
      setError('Please select at least one document to upload');
      return;
    }

    setUploadingDocs(true);
    setError('');

    try {
      const formData = new FormData();
      
      if (docFiles.declarationForm) {
        formData.append('declarationForm', docFiles.declarationForm);
      }
      if (docFiles.vendorAgreement) {
        formData.append('vendorAgreement', docFiles.vendorAgreement);
      }

      const response = await axios.put(
        `http://31.97.206.144:5051/api/documents/${vendorId}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.data.success) {
        setUploadSuccess('Documents uploaded successfully!');
        setDocFiles({ declarationForm: null, vendorAgreement: null });
        
        // Refresh profile data to show updated documents
        fetchProfileData();
        
        setTimeout(() => setUploadSuccess(''), 5000);
      } else {
        setError(response.data.message || 'Failed to upload documents');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Server error');
    } finally {
      setUploadingDocs(false);
    }
  };

  // Copy referral code to clipboard
  const copyReferralCode = async () => {
    try {
      await navigator.clipboard.writeText(profileData.referralCode);
      setCopySuccess('Referral code copied!');
      setTimeout(() => setCopySuccess(''), 3000);
    } catch (err) {
      setCopySuccess('Failed to copy!');
      setTimeout(() => setCopySuccess(''), 3000);
    }
  };

  // Share referral code
  const shareReferralCode = async () => {
    const shareText = `Join me on Veggyfy - India's First Pure Vegetarian Food Delivery App! Use my referral code: ${profileData.referralCode} to get special benefits. Download the app now! 🎉🌱`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join Veggyfy',
          text: shareText,
          url: window.location.origin,
        });
        setShareSuccess('Shared successfully!');
        setTimeout(() => setShareSuccess(''), 3000);
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(shareText);
        setShareSuccess('Share message copied to clipboard!');
        setTimeout(() => setShareSuccess(''), 3000);
      } catch (err) {
        setShareSuccess('Failed to share!');
        setTimeout(() => setShareSuccess(''), 3000);
      }
    }
  };

  // Open document modal
  const openDocumentModal = (doc) => {
    setCurrentDocument(doc);
    setModalOpen(true);
  };

  // Close document modal
  const closeDocumentModal = () => {
    setModalOpen(false);
    setCurrentDocument(null);
  };

  // Download document
  const downloadDocument = (url, filename) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || 'document';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helper function to get document icon based on type
  const getDocumentIcon = (type) => {
    switch(type) {
      case 'declarationForm':
        return <FiFileText className="text-red-600 text-xl" />;
      case 'vendorAgreement':
        return <FiFile className="text-indigo-600 text-xl" />;
      case 'gstCertificate':
        return <FiFileText className="text-green-600 text-xl" />;
      case 'fssaiLicense':
        return <FiShield className="text-blue-600 text-xl" />;
      case 'panCard':
        return <FiCreditCard className="text-purple-600 text-xl" />;
      case 'aadharCard':
        return <FiUser className="text-orange-600 text-xl" />;
      default:
        return <FiFileText className="text-gray-600 text-xl" />;
    }
  };

  // Helper function to get document background color
  const getDocumentBgColor = (type) => {
    switch(type) {
      case 'declarationForm':
        return 'from-red-50 to-pink-50 border-red-200';
      case 'vendorAgreement':
        return 'from-indigo-50 to-purple-50 border-indigo-200';
      case 'gstCertificate':
        return 'from-green-50 to-emerald-50 border-green-200';
      case 'fssaiLicense':
        return 'from-blue-50 to-cyan-50 border-blue-200';
      case 'panCard':
        return 'from-purple-50 to-violet-50 border-purple-200';
      case 'aadharCard':
        return 'from-orange-50 to-amber-50 border-orange-200';
      default:
        return 'from-gray-50 to-gray-100 border-gray-200';
    }
  };

  // Helper function to get document icon background color
  const getDocumentIconBg = (type) => {
    switch(type) {
      case 'declarationForm':
        return 'bg-red-100 group-hover:bg-red-200';
      case 'vendorAgreement':
        return 'bg-indigo-100 group-hover:bg-indigo-200';
      case 'gstCertificate':
        return 'bg-green-100 group-hover:bg-green-200';
      case 'fssaiLicense':
        return 'bg-blue-100 group-hover:bg-blue-200';
      case 'panCard':
        return 'bg-purple-100 group-hover:bg-purple-200';
      case 'aadharCard':
        return 'bg-orange-100 group-hover:bg-orange-200';
      default:
        return 'bg-gray-100 group-hover:bg-gray-200';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRatingColor = (rating) => {
    if (rating >= 4.5) return 'text-green-600 bg-green-100';
    if (rating >= 4.0) return 'text-blue-600 bg-blue-100';
    if (rating >= 3.0) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'inactive':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <FiCheckCircle className="text-green-600" />;
      case 'pending':
        return <FiClock className="text-yellow-600" />;
      case 'inactive':
        return <FiXCircle className="text-red-600" />;
      default:
        return <FiClock className="text-gray-600" />;
    }
  };

  // Document Upload Component
  const DocumentUpload = ({ title, fileType, required = false }) => (
    <div className="border-2 border-blue-200 rounded-xl p-4 bg-blue-50 hover:bg-blue-100 transition-all duration-300">
      <label className="block font-bold text-blue-800 mb-2">
        {title} {required && <span className="text-red-500">*</span>}
      </label>
      
      <div className="flex items-center gap-4">
        {docPreviews[fileType] ? (
          <div className="relative">
            {docPreviews[fileType] === 'pdf' ? (
              <div className="w-20 h-20 bg-red-100 rounded-xl border-2 border-red-300 flex items-center justify-center shadow-lg">
                <FiFileText className="text-red-600 text-2xl" />
              </div>
            ) : (
              <img src={docPreviews[fileType]} alt="Preview" className="w-20 h-20 rounded-xl border-2 border-blue-300 object-cover shadow-lg" />
            )}
            <button
              type="button"
              onClick={() => removeDocFile(fileType)}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors shadow-lg"
            >
              <FiX size={12} />
            </button>
          </div>
        ) : (
          <div className="w-20 h-20 border-2 border-dashed border-blue-300 rounded-xl flex items-center justify-center text-blue-400 bg-white">
            <FiUpload className="text-2xl" />
          </div>
        )}
        
        <div>
          <input
            type="file"
            className="hidden"
            id={fileType}
            accept=".pdf,image/*"
            onChange={(e) => handleDocFileChange(fileType, e.target.files[0])}
          />
          <label
            htmlFor={fileType}
            className="bg-gradient-to-r from-blue-500 to-blue-700 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 font-bold flex items-center gap-2 cursor-pointer"
          >
            <FiUpload />
            Choose File
          </label>
          {docFiles[fileType] && (
            <p className="text-sm text-blue-700 font-medium mt-2">{docFiles[fileType].name}</p>
          )}
        </div>
      </div>
    </div>
  );

  // Document Card Component
  const DocumentCard = ({ type, title, data, uploadedAt }) => {
    if (!data?.url) return null;
    
    return (
      <div 
        className={`bg-gradient-to-r ${getDocumentBgColor(type)} border ${getDocumentBgColor(type).split(' ')[2]} rounded-xl p-4 text-center hover:shadow-md transition-shadow cursor-pointer group relative`}
        onClick={() => openDocumentModal({
          title,
          url: data.url,
          type: title,
          uploadedAt
        })}
      >
        <div className="relative">
          <div className={`w-12 h-12 ${getDocumentIconBg(type)} rounded-full flex items-center justify-center mx-auto mb-3 transition-colors`}>
            {getDocumentIcon(type)}
          </div>
          <p className="text-sm font-semibold text-gray-700 mb-1">{title}</p>
          <div className="flex items-center justify-center gap-1 text-xs text-gray-500 mb-2">
            <FiZoomIn className="text-xs" />
            Click to view
          </div>
          
          {uploadedAt && (
            <p className="text-xs text-gray-500 mb-2">
              Uploaded: {formatDate(uploadedAt)}
            </p>
          )}
          
          {/* Download button - appears on hover */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              downloadDocument(data.url, `${title.replace(/\s+/g, '_')}.jpg`);
            }}
            className="absolute top-0 right-0 p-2 bg-white rounded-full shadow-md hover:shadow-lg hover:bg-gray-50 transition-all opacity-0 group-hover:opacity-100"
            title="Download document"
          >
            <FiDownload className="text-gray-600 text-sm" />
          </button>
        </div>
      </div>
    );
  };

  // Document Upload Section
  const DocumentUploadSection = () => (
    <div className="mb-8">
      <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <FiFileText className="text-blue-600" />
        Upload Signed Documents
      </h3>
      
      {uploadSuccess && (
        <div className="mb-4 p-4 bg-green-100 border border-green-200 rounded-xl text-green-700 font-medium">
          {uploadSuccess}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <DocumentUpload 
          title="📝 Declaration Form" 
          fileType="declarationForm" 
        />
        <DocumentUpload 
          title="📑 Vendor Agreement" 
          fileType="vendorAgreement" 
        />
      </div>

      <div className="flex justify-end">
        <button
          onClick={uploadDocuments}
          disabled={uploadingDocs || (!docFiles.declarationForm && !docFiles.vendorAgreement)}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-all duration-300 font-bold"
        >
          {uploadingDocs ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Uploading...
            </>
          ) : (
            <>
              <FiUpload />
              Upload Documents
            </>
          )}
        </button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (error && !isEditing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-md">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <FiMapPin className="text-red-500 text-xl" />
            </div>
            <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Profile</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={fetchProfileData}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <FiMapPin className="text-gray-400 text-xl" />
          </div>
          <h3 className="text-lg font-semibold text-gray-600">No Profile Data Found</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            {isEditing ? 'Edit Restaurant Profile' : 'Restaurant Profile'}
          </h1>
          <p className="text-gray-600 text-lg">
            {isEditing ? 'Update your restaurant details' : 'Manage and view your restaurant details'}
          </p>
        </div>

        {/* Edit Form */}
        {isEditing ? (
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Image Upload Section */}
            <div className="relative h-64 bg-gradient-to-r from-orange-400 to-red-500">
              {imagePreview || profileData.image?.url ? (
                <img
                  src={imagePreview || profileData.image?.url}
                  alt={editForm.restaurantName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-white text-center">
                    <FiMapPin className="text-4xl mx-auto mb-2 opacity-80" />
                    <p className="text-xl font-semibold">{editForm.restaurantName}</p>
                  </div>
                </div>
              )}
              <div className="absolute inset-0 bg-black bg-opacity-30"></div>
              
              {/* Image Upload Button */}
              <div className="absolute bottom-4 right-4">
                <label className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors">
                  <FiUpload />
                  Change Image
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Form Fields */}
            <div className="p-8">
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Restaurant Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Restaurant Name *
                  </label>
                  <input
                    type="text"
                    name="restaurantName"
                    value={editForm.restaurantName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* GST Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    GST Number
                  </label>
                  <input
                    type="text"
                    name="gstNumber"
                    value={editForm.gstNumber}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Rating */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rating
                  </label>
                  <input
                    type="number"
                    name="rating"
                    value={editForm.rating}
                    onChange={handleInputChange}
                    min="0"
                    max="5"
                    step="0.1"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    name="status"
                    value={editForm.status}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="active">Active</option>
                    <option value="pending">Pending</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                {/* Location Name */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location Name *
                  </label>
                  <input
                    type="text"
                    name="locationName"
                    value={editForm.locationName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={editForm.description}
                    onChange={handleInputChange}
                    rows="4"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-end pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={editLoading}
                  className="flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  <FiX />
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
                >
                  {editLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Updating...
                    </>
                  ) : (
                    <>
                      <FiSave />
                      Update Profile
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        ) : (
          /* View Mode */
          <>
            {/* Main Profile Card */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
              {/* Restaurant Image Section */}
              <div className="relative h-64 bg-gradient-to-r from-orange-400 to-red-500">
                {profileData.image?.url ? (
                  <img
                    src={profileData.image.url}
                    alt={profileData.restaurantName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-white text-center">
                      <FiMapPin className="text-4xl mx-auto mb-2 opacity-80" />
                      <p className="text-xl font-semibold">{profileData.restaurantName}</p>
                    </div>
                  </div>
                )}
                <div className="absolute inset-0 bg-black bg-opacity-30"></div>
                
                {/* Rating Badge */}
                <div className="absolute top-4 right-4">
                  <div className={`flex items-center gap-1 px-3 py-2 rounded-full ${getRatingColor(profileData.rating)}`}>
                    <FiStar className="fill-current" />
                    <span className="font-semibold">{profileData.rating || 'No Rating'}</span>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="absolute top-4 left-4">
                  <div className={`flex items-center gap-2 px-3 py-2 rounded-full border ${getStatusBadge(profileData.status)}`}>
                    {getStatusIcon(profileData.status)}
                    <span className="font-medium capitalize">{profileData.status}</span>
                  </div>
                </div>
              </div>

              {/* Profile Details */}
              <div className="p-8">
                {/* Restaurant Name and Basic Info */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                      {profileData.restaurantName}
                    </h1>
                    <div className="flex items-center gap-4 flex-wrap">
                      {/* Rating */}
                      <div className="flex items-center gap-2 bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full">
                        <FiStar className="text-sm" />
                        <span className="font-medium">Rating: {profileData.rating || 'No Rating'}</span>
                      </div>
                      
                      {/* Referral Code with Copy Button */}
                      {profileData.referralCode && (
                        <div className="flex items-center gap-2 bg-purple-100 text-purple-700 px-3 py-1 rounded-full">
                          <FiGift className="text-sm" />
                          <span className="font-medium">Code: {profileData.referralCode}</span>
                          <button
                            onClick={copyReferralCode}
                            className="p-1 hover:bg-purple-200 rounded transition-colors"
                            title="Copy referral code"
                          >
                            <FiCopy className="text-sm" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Success Messages */}
                {(copySuccess || shareSuccess) && (
                  <div className={`mb-4 p-3 rounded-lg text-center font-medium ${
                    copySuccess || shareSuccess ? 'bg-green-100 text-green-700 border border-green-200' : ''
                  }`}>
                    {copySuccess || shareSuccess}
                  </div>
                )}

                {/* Description */}
                {profileData.description && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">About Restaurant</h3>
                    <p className="text-gray-700 text-lg leading-relaxed bg-gray-50 p-4 rounded-lg border">
                      {profileData.description}
                    </p>
                  </div>
                )}

                {/* Referral Code Section with Share Button */}
                {profileData.referralCode && (
                  <div className="mb-6 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-xl p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div>
                        <h3 className="text-xl font-bold text-purple-800 mb-2 flex items-center gap-2">
                          <FiGift className="text-purple-600" />
                          Your Referral Code
                        </h3>
                        <p className="text-purple-700 mb-2">
                          Share this code with other vendors to earn rewards and grow the Veggyfy community!
                        </p>
                        <div className="flex items-center gap-3">
                          <code className="bg-purple-100 text-purple-800 px-4 py-2 rounded-lg text-lg font-bold border border-purple-300">
                            {profileData.referralCode}
                          </code>
                          <button
                            onClick={copyReferralCode}
                            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                          >
                            <FiCopy />
                            Copy
                          </button>
                        </div>
                      </div>
                      <button
                        onClick={shareReferralCode}
                        className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium whitespace-nowrap"
                      >
                        <FiShare2 />
                        Share Referral
                      </button>
                    </div>
                  </div>
                )}

                {/* Contact Information Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {/* Location Information */}
                  <div className="space-y-4">
                    {/* Location Name */}
                    <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                      <div className="p-3 bg-red-100 rounded-full">
                        <FiMapPin className="text-red-600 text-xl" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">Location</h3>
                        <p className="text-gray-700">{profileData.locationName}</p>
                        {profileData.location?.coordinates && (
                          <p className="text-sm text-gray-500 mt-1">
                            Coordinates: {profileData.location.coordinates[1]?.toFixed(6) || 'N/A'}, {profileData.location.coordinates[0]?.toFixed(6) || 'N/A'}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* GST Number */}
                    <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                      <div className="p-3 bg-blue-100 rounded-full">
                        <FiCreditCard className="text-blue-600 text-xl" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">GST Number</h3>
                        <p className="text-gray-700 font-mono">{profileData.gstNumber}</p>
                      </div>
                    </div>

                    {/* Referral Information */}
                    <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                      <div className="p-3 bg-purple-100 rounded-full">
                        <FiUsers className="text-purple-600 text-xl" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">Referral Program</h3>
                        <p className="text-gray-700">
                          {profileData.referredBy 
                            ? `Referred by: ${profileData.referredBy}` 
                            : 'No referral used'
                          }
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Contact Details */}
                  <div className="space-y-4">
                    {/* Email */}
                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                      <div className="p-3 bg-blue-100 rounded-full">
                        <FiMail className="text-blue-600 text-xl" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">Email</h3>
                        <p className="text-gray-700">{profileData.email}</p>
                      </div>
                    </div>

                    {/* Mobile */}
                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                      <div className="p-3 bg-green-100 rounded-full">
                        <FiPhone className="text-green-600 text-xl" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">Mobile</h3>
                        <p className="text-gray-700">{profileData.mobile}</p>
                      </div>
                    </div>

                    {/* Categories */}
                    <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                      <div className="p-3 bg-orange-100 rounded-full">
                        <FiTag className="text-orange-600 text-xl" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">Categories</h3>
                        <p className="text-gray-700">
                          {profileData.categories && profileData.categories.length > 0 
                            ? profileData.categories.join(', ') 
                            : 'No categories assigned'
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Documents Section */}
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <FiFileText className="text-gray-600" />
                    Business Documents
                    <span className="text-sm text-gray-500 font-normal ml-auto">
                      Hover over documents to download
                    </span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* GST Certificate */}
                    <DocumentCard
                      type="gstCertificate"
                      title="GST Certificate"
                      data={profileData.gstCertificate}
                    />

                    {/* FSSAI License */}
                    <DocumentCard
                      type="fssaiLicense"
                      title="FSSAI License"
                      data={profileData.fssaiLicense}
                    />

                    {/* PAN Card */}
                    <DocumentCard
                      type="panCard"
                      title="PAN Card"
                      data={profileData.panCard}
                    />

                    {/* Aadhar Card */}
                    <DocumentCard
                      type="aadharCard"
                      title="Aadhar Card"
                      data={profileData.aadharCard}
                    />

                    {/* Declaration Form */}
                    <DocumentCard
                      type="declarationForm"
                      title="Declaration Form"
                      data={profileData.declarationForm}
                      uploadedAt={profileData.declarationForm?.uploadedAt}
                    />

                    {/* Vendor Agreement */}
                    <DocumentCard
                      type="vendorAgreement"
                      title="Vendor Agreement"
                      data={profileData.vendorAgreement}
                      uploadedAt={profileData.vendorAgreement?.uploadedAt}
                    />
                  </div>
                </div>

                {/* Document Upload Section */}
                <DocumentUploadSection />

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  {/* Wallet Balance */}
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 text-center">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <FiDollarSign className="text-green-600 text-xl" />
                    </div>
                    <p className="text-sm text-gray-600 mb-1">Wallet Balance</p>
                    <p className="text-2xl font-bold text-gray-900">₹{profileData.walletBalance || 0}</p>
                  </div>

                  {/* Rating */}
                  <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-xl p-4 text-center">
                    <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <FiStar className="text-yellow-600 text-xl" />
                    </div>
                    <p className="text-sm text-gray-600 mb-1">Rating</p>
                    <p className="text-2xl font-bold text-gray-900">{profileData.rating || 'N/A'}</p>
                  </div>

                  {/* Member Since */}
                  <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-xl p-4 text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <FiCalendar className="text-blue-600 text-xl" />
                    </div>
                    <p className="text-sm text-gray-600 mb-1">Member Since</p>
                    <p className="text-lg font-bold text-gray-900">{formatDate(profileData.createdAt)}</p>
                  </div>

                  {/* Last Updated */}
                  <div className="bg-gradient-to-r from-purple-50 to-violet-50 border border-purple-200 rounded-xl p-4 text-center">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <FiClock className="text-purple-600 text-xl" />
                    </div>
                    <p className="text-sm text-gray-600 mb-1">Last Updated</p>
                    <p className="text-lg font-bold text-gray-900">{formatDate(profileData.updatedAt)}</p>
                  </div>
                </div>

                {/* Additional Information */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <FiNavigation className="text-gray-500" />
                    Restaurant Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Restaurant ID:</span>
                      <p className="text-gray-600 font-mono bg-gray-100 px-2 py-1 rounded mt-1 text-xs">
                        {profileData._id}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Status:</span>
                      <div className="flex items-center gap-2 mt-1">
                        {getStatusIcon(profileData.status)}
                        <span className={`font-medium capitalize ${profileData.status === 'active' ? 'text-green-600' : profileData.status === 'pending' ? 'text-yellow-600' : 'text-red-600'}`}>
                          {profileData.status}
                        </span>
                      </div>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Referral Code:</span>
                      <p className="text-purple-600 font-medium mt-1 font-mono">{profileData.referralCode}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Reviews:</span>
                      <p className="text-gray-600 mt-1">
                        {profileData.reviews && profileData.reviews.length > 0 
                          ? `${profileData.reviews.length} reviews` 
                          : 'No reviews yet'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => setIsEditing(true)}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <FiEdit3 />
                Edit Profile
              </button>
            </div>
          </>
        )}

        {/* Quick Tips */}
        {!isEditing && (
          <div className="mt-8 bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-orange-800 mb-3 flex items-center gap-2">
              <FiStar className="text-orange-600" />
              Profile Tips
            </h3>
            <ul className="text-orange-700 space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-orange-500 mt-1">•</span>
                <span>Share your referral code <strong>{profileData.referralCode}</strong> to earn rewards</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-500 mt-1">•</span>
                <span>Keep your restaurant information updated to attract more customers</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-500 mt-1">•</span>
                <span>All your business documents are securely stored and can be viewed anytime</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-500 mt-1">•</span>
                <span>Hover over any document card and click the download icon to save it</span>
              </li>
            </ul>
          </div>
        )}
      </div>

      {/* Document Modal */}
      {modalOpen && currentDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <FiFileText className="text-blue-600" />
                {currentDocument.title}
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => downloadDocument(currentDocument.url, `${currentDocument.title.replace(/\s+/g, '_')}.jpg`)}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <FiDownload />
                  Download
                </button>
                <button
                  onClick={closeDocumentModal}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <FiX className="text-xl text-gray-600" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 max-h-[70vh] overflow-auto">
              <div className="flex justify-center">
                <img
                  src={currentDocument.url}
                  alt={currentDocument.title}
                  className="max-w-full max-h-[60vh] object-contain rounded-lg shadow-lg"
                />
              </div>
              
              {/* Document Details */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Document Type:</span>
                  <p className="text-gray-900 font-semibold mt-1">{currentDocument.type}</p>
                </div>
                {currentDocument.uploadedAt && (
                  <div>
                    <span className="font-medium text-gray-700">Uploaded At:</span>
                    <p className="text-gray-900 font-semibold mt-1">{formatDate(currentDocument.uploadedAt)}</p>
                  </div>
                )}
                <div className="md:col-span-2">
                  <span className="font-medium text-gray-700">File URL:</span>
                  <p className="text-blue-600 break-all mt-1 font-mono text-xs">
                    {currentDocument.url}
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end p-6 border-t border-gray-200">
              <button
                onClick={closeDocumentModal}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorProfile;