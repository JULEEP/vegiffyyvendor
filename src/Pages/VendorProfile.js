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
  FiFile,
  FiPercent,
  FiTrendingUp,
  FiAlertCircle,
  FiInfo,
  FiHome
} from 'react-icons/fi';
import { FaIdCard, FaExclamationTriangle, FaAddressCard } from 'react-icons/fa';
import { MdLocationCity } from 'react-icons/md';

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
  
  // States for document uploads
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
      const res = await axios.get(`https://api.vegiffyy.com/api/profile/${vendorId}`);
      
      if (res.data?.success) {
        const data = res.data.data;
        setProfileData(data);
        setEditForm({
          restaurantName: data.restaurantName || '',
          description: data.description || '',
          locationName: data.locationName || '',
          fullAddress: data.fullAddress || '',
          rating: data.rating || '',
          status: data.status || 'active',
          gstNumber: data.gstNumber || '',
          commission: data.commission || 0,
          fssaiNo: data.fssaiNo || '',
          email: data.email || '',
          mobile: data.mobile || ''
        });

        if (data.declarationForm?.url) {
          setDocPreviews(prev => ({ ...prev, declarationForm: data.declarationForm.url }));
        }
        if (data.vendorAgreement?.url) {
          setDocPreviews(prev => ({ ...prev, vendorAgreement: data.vendorAgreement.url }));
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: name === 'commission' ? parseFloat(value) || 0 : value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);

    try {
      const formData = new FormData();
      
      Object.keys(editForm).forEach(key => {
        if (editForm[key] !== undefined && editForm[key] !== null) {
          formData.append(key, editForm[key]);
        }
      });

      if (imageFile) {
        formData.append('image', imageFile);
      }

      const response = await axios.put(
        `https://api.vegiffyy.com/api/restaurant/${vendorId}`,
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

  const handleCancel = () => {
    setIsEditing(false);
    setEditForm({
      restaurantName: profileData.restaurantName || '',
      description: profileData.description || '',
      locationName: profileData.locationName || '',
      fullAddress: profileData.fullAddress || '',
      rating: profileData.rating || '',
      status: profileData.status || 'active',
      gstNumber: profileData.gstNumber || '',
      commission: profileData.commission || 0,
      fssaiNo: profileData.fssaiNo || '',
      email: profileData.email || '',
      mobile: profileData.mobile || ''
    });
    setImageFile(null);
    setImagePreview('');
  };

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

  const removeDocFile = (fileType) => {
    setDocFiles(prev => ({ ...prev, [fileType]: null }));
    setDocPreviews(prev => ({ ...prev, [fileType]: null }));
  };

  const uploadDocuments = async () => {
    if (!docFiles.declarationForm && !docFiles.vendorAgreement) {
      setError('Please select at least one document to upload');
      return;
    }

    setUploadingDocs(true);
    setError('');

    try {
      const formData = new FormData();
      if (docFiles.declarationForm) formData.append('declarationForm', docFiles.declarationForm);
      if (docFiles.vendorAgreement) formData.append('vendorAgreement', docFiles.vendorAgreement);

      const response = await axios.put(
        `https://api.vegiffyy.com/api/documents/${vendorId}`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      if (response.data.success) {
        setUploadSuccess('Documents uploaded successfully!');
        setDocFiles({ declarationForm: null, vendorAgreement: null });
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

  const shareReferralCode = async () => {
    const shareText = `Join me on Veggyfy - India's First Pure Vegetarian Food Delivery App! Use my referral code: ${profileData.referralCode} to get special benefits. Download the app now! 🎉🌱`;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Join Veggyfy', text: shareText, url: window.location.origin });
        setShareSuccess('Shared successfully!');
        setTimeout(() => setShareSuccess(''), 3000);
      } catch (err) {}
    } else {
      try {
        await navigator.clipboard.writeText(shareText);
        setShareSuccess('Share message copied to clipboard!');
        setTimeout(() => setShareSuccess(''), 3000);
      } catch (err) {}
    }
  };

  const openDocumentModal = (doc) => {
    setCurrentDocument(doc);
    setModalOpen(true);
  };

  const closeDocumentModal = () => {
    setModalOpen(false);
    setCurrentDocument(null);
  };

  const downloadDocument = (url, filename) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || 'document';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getDocumentIcon = (type) => {
    switch(type) {
      case 'declarationForm': return <FiFileText className="text-red-600 text-xl" />;
      case 'vendorAgreement': return <FiFile className="text-indigo-600 text-xl" />;
      case 'gstCertificate': return <FiFileText className="text-green-600 text-xl" />;
      case 'fssaiLicense': return <FiShield className="text-blue-600 text-xl" />;
      case 'panCard': return <FiCreditCard className="text-purple-600 text-xl" />;
      case 'aadharCard': return <FiUser className="text-orange-600 text-xl" />;
      default: return <FiFileText className="text-gray-600 text-xl" />;
    }
  };

  const getDocumentBgColor = (type) => {
    switch(type) {
      case 'declarationForm': return 'from-red-50 to-pink-50 border-red-200';
      case 'vendorAgreement': return 'from-indigo-50 to-purple-50 border-indigo-200';
      case 'gstCertificate': return 'from-green-50 to-emerald-50 border-green-200';
      case 'fssaiLicense': return 'from-blue-50 to-cyan-50 border-blue-200';
      case 'panCard': return 'from-purple-50 to-violet-50 border-purple-200';
      case 'aadharCard': return 'from-orange-50 to-amber-50 border-orange-200';
      default: return 'from-gray-50 to-gray-100 border-gray-200';
    }
  };

  const getDocumentIconBg = (type) => {
    switch(type) {
      case 'declarationForm': return 'bg-red-100 group-hover:bg-red-200';
      case 'vendorAgreement': return 'bg-indigo-100 group-hover:bg-indigo-200';
      case 'gstCertificate': return 'bg-green-100 group-hover:bg-green-200';
      case 'fssaiLicense': return 'bg-blue-100 group-hover:bg-blue-200';
      case 'panCard': return 'bg-purple-100 group-hover:bg-purple-200';
      case 'aadharCard': return 'bg-orange-100 group-hover:bg-orange-200';
      default: return 'bg-gray-100 group-hover:bg-gray-200';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
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
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'inactive': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <FiCheckCircle className="text-green-600" />;
      case 'pending': return <FiClock className="text-yellow-600" />;
      case 'inactive': return <FiXCircle className="text-red-600" />;
      default: return <FiClock className="text-gray-600" />;
    }
  };

  const getCommissionColor = (commission) => {
    if (commission >= 5) return 'text-red-600 bg-red-100';
    if (commission >= 3) return 'text-orange-600 bg-orange-100';
    if (commission >= 2) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  };

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
            <button type="button" onClick={() => removeDocFile(fileType)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors shadow-lg">
              <FiX size={12} />
            </button>
          </div>
        ) : (
          <div className="w-20 h-20 border-2 border-dashed border-blue-300 rounded-xl flex items-center justify-center text-blue-400 bg-white">
            <FiUpload className="text-2xl" />
          </div>
        )}
        <div>
          <input type="file" className="hidden" id={fileType} accept=".pdf,image/*" onChange={(e) => handleDocFileChange(fileType, e.target.files[0])} />
          <label htmlFor={fileType} className="bg-gradient-to-r from-blue-500 to-blue-700 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 font-bold flex items-center gap-2 cursor-pointer">
            <FiUpload /> Choose File
          </label>
          {docFiles[fileType] && <p className="text-sm text-blue-700 font-medium mt-2">{docFiles[fileType].name}</p>}
        </div>
      </div>
    </div>
  );

  const DocumentCard = ({ type, title, data, uploadedAt }) => {
    if (!data?.url) return null;
    return (
      <div className={`bg-gradient-to-r ${getDocumentBgColor(type)} border ${getDocumentBgColor(type).split(' ')[2]} rounded-xl p-4 text-center hover:shadow-md transition-shadow cursor-pointer group relative`}
           onClick={() => openDocumentModal({ title, url: data.url, type: title, uploadedAt })}>
        <div className="relative">
          <div className={`w-12 h-12 ${getDocumentIconBg(type)} rounded-full flex items-center justify-center mx-auto mb-3 transition-colors`}>
            {getDocumentIcon(type)}
          </div>
          <p className="text-sm font-semibold text-gray-700 mb-1">{title}</p>
          <div className="flex items-center justify-center gap-1 text-xs text-gray-500 mb-2"><FiZoomIn className="text-xs" /> Click to view</div>
          {uploadedAt && <p className="text-xs text-gray-500 mb-2">Uploaded: {formatDate(uploadedAt)}</p>}
          <button onClick={(e) => { e.stopPropagation(); downloadDocument(data.url, `${title.replace(/\s+/g, '_')}.jpg`); }} 
                  className="absolute top-0 right-0 p-2 bg-white rounded-full shadow-md hover:shadow-lg hover:bg-gray-50 transition-all opacity-0 group-hover:opacity-100" title="Download document">
            <FiDownload className="text-gray-600 text-sm" />
          </button>
        </div>
      </div>
    );
  };

  const DisclaimersSection = ({ disclaimers }) => {
    if (!disclaimers || disclaimers.length === 0) return null;
    return (
      <div className="mb-8">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <FaExclamationTriangle className="text-orange-500" /> Restaurant Disclaimers
        </h3>
        <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-xl p-6">
          <div className="space-y-3">
            {disclaimers.map((disclaimer, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="flex-shrink-0"><span className="bg-orange-200 text-orange-700 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">{index + 1}</span></div>
                <p className="text-gray-700 flex-1">{disclaimer}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-orange-200">
            <p className="text-sm text-orange-600 flex items-center gap-2"><FiInfo className="text-orange-500" /> These disclaimers are displayed to all customers viewing your restaurant</p>
          </div>
        </div>
      </div>
    );
  };

  const DocumentUploadSection = () => (
    <div className="mb-8">
      <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2"><FiFileText className="text-blue-600" /> Upload Signed Documents</h3>
      {uploadSuccess && <div className="mb-4 p-4 bg-green-100 border border-green-200 rounded-xl text-green-700 font-medium">{uploadSuccess}</div>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <DocumentUpload title="📝 Declaration Form" fileType="declarationForm" />
        <DocumentUpload title="📑 Vendor Agreement" fileType="vendorAgreement" />
      </div>
      <div className="flex justify-end">
        <button onClick={uploadDocuments} disabled={uploadingDocs || (!docFiles.declarationForm && !docFiles.vendorAgreement)}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-all duration-300 font-bold">
          {uploadingDocs ? <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> Uploading...</> : <><FiUpload /> Upload Documents</>}
        </button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div><p className="mt-4 text-gray-600">Loading your profile...</p></div>
      </div>
    );
  }

  if (error && !isEditing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center"><div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-md"><div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3"><FiMapPin className="text-red-500 text-xl" /></div><h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Profile</h3><p className="text-red-600 mb-4">{error}</p><button onClick={fetchProfileData} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Try Again</button></div></div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center"><div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3"><FiMapPin className="text-gray-400 text-xl" /></div><h3 className="text-lg font-semibold text-gray-600">No Profile Data Found</h3></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">{isEditing ? 'Edit Restaurant Profile' : 'Restaurant Profile'}</h1>
          <p className="text-gray-600 text-lg">{isEditing ? 'Update your restaurant details' : 'Manage and view your restaurant details'}</p>
        </div>

        {isEditing ? (
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="relative h-64 bg-gradient-to-r from-orange-400 to-red-500">
              {imagePreview || profileData.image?.url ? (
                <img src={imagePreview || profileData.image?.url} alt={editForm.restaurantName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center"><div className="text-white text-center"><FiMapPin className="text-4xl mx-auto mb-2 opacity-80" /><p className="text-xl font-semibold">{editForm.restaurantName}</p></div></div>
              )}
              <div className="absolute inset-0 bg-black bg-opacity-30"></div>
              <div className="absolute bottom-4 right-4">
                <label className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors">
                  <FiUpload /> Change Image <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>
              </div>
            </div>

            <div className="p-8">
              {error && <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">{error}</div>}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div><label className="block text-sm font-medium text-gray-700 mb-2">Restaurant Name *</label><input type="text" name="restaurantName" value={editForm.restaurantName} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-2">GST Number</label><input type="text" name="gstNumber" value={editForm.gstNumber} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-2">Rating</label><input type="number" name="rating" value={editForm.rating} onChange={handleInputChange} min="0" max="5" step="0.1" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-2">Commission (%)</label><input type="number" name="commission" value={editForm.commission} onChange={handleInputChange} min="0" max="100" step="0.1" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" /><p className="text-xs text-gray-500 mt-1">Platform commission percentage</p></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-2">Status</label><select name="status" value={editForm.status} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"><option value="active">Active</option><option value="pending">Pending</option><option value="inactive">Inactive</option></select></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-2">FSSAI License No.</label><input type="text" name="fssaiNo" value={editForm.fssaiNo} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="14-digit FSSAI number" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label><input type="email" name="email" value={editForm.email} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-2">Mobile Number</label><input type="tel" name="mobile" value={editForm.mobile} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" /></div>
                <div className="md:col-span-2"><label className="block text-sm font-medium text-gray-700 mb-2">Location Name (Area/Landmark)</label><input type="text" name="locationName" value={editForm.locationName} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="e.g., Bolarum, Secunderabad" /></div>
                <div className="md:col-span-2"><label className="block text-sm font-medium text-gray-700 mb-2">Full Address</label><textarea name="fullAddress" value={editForm.fullAddress} onChange={handleInputChange} rows="3" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="Enter complete address with street, building, landmark, city, pincode" /><p className="text-xs text-gray-500 mt-1">Please provide complete address for delivery and verification purposes</p></div>
                <div className="md:col-span-2"><label className="block text-sm font-medium text-gray-700 mb-2">Description</label><textarea name="description" value={editForm.description} onChange={handleInputChange} rows="4" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="Brief description about your restaurant..." /></div>
              </div>

              <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800 flex items-center gap-2"><FiInfo className="text-yellow-600" /><span><strong>Note:</strong> Disclaimers cannot be edited. Contact admin for changes.</span></p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-end pt-6 border-t border-gray-200">
                <button type="button" onClick={handleCancel} disabled={editLoading} className="flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"><FiX /> Cancel</button>
                <button type="submit" disabled={editLoading} className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50">
                  {editLoading ? <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> Updating...</> : <><FiSave /> Update Profile</>}
                </button>
              </div>
            </div>
          </form>
        ) : (
          <>
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
              <div className="relative h-64 bg-gradient-to-r from-orange-400 to-red-500">
                {profileData.image?.url ? (
                  <img src={profileData.image.url} alt={profileData.restaurantName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center"><div className="text-white text-center"><FiMapPin className="text-4xl mx-auto mb-2 opacity-80" /><p className="text-xl font-semibold">{profileData.restaurantName}</p></div></div>
                )}
                <div className="absolute inset-0 bg-black bg-opacity-30"></div>
                <div className="absolute top-4 right-4"><div className={`flex items-center gap-1 px-3 py-2 rounded-full ${getRatingColor(profileData.rating)}`}><FiStar className="fill-current" /><span className="font-semibold">{profileData.rating || 'No Rating'}</span></div></div>
                <div className="absolute top-4 left-4 flex flex-wrap gap-4">
                  <div className={`flex items-center gap-2 px-3 py-2 rounded-full border ${getStatusBadge(profileData.status)}`}>{getStatusIcon(profileData.status)}<span className="font-medium capitalize">{profileData.status}</span></div>
                  <div className={`flex items-center gap-2 px-3 py-2 rounded-full border ${getCommissionColor(profileData.commission)}`}><FiPercent className="text-sm" /><span className="font-semibold">{profileData.commission || 0}% Commission</span></div>
                </div>
              </div>

              <div className="p-8">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
                  <div><h1 className="text-3xl font-bold text-gray-900 mb-2">{profileData.restaurantName}</h1>
                    <div className="flex items-center gap-4 flex-wrap">
                      <div className="flex items-center gap-2 bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full"><FiStar className="text-sm" /><span className="font-medium">Rating: {profileData.rating || 'No Rating'}</span></div>
                      <div className={`flex items-center gap-2 ${getCommissionColor(profileData.commission)} px-3 py-1 rounded-full`}><FiTrendingUp className="text-sm" /><span className="font-medium">Commission: {profileData.commission || 0}%</span></div>
                      {profileData.referralCode && (
                        <div className="flex items-center gap-2 bg-purple-100 text-purple-700 px-3 py-1 rounded-full"><FiGift className="text-sm" /><span className="font-medium">Code: {profileData.referralCode}</span><button onClick={copyReferralCode} className="p-1 hover:bg-purple-200 rounded transition-colors" title="Copy referral code"><FiCopy className="text-sm" /></button></div>
                      )}
                    </div>
                  </div>
                </div>

                {(copySuccess || shareSuccess) && <div className={`mb-4 p-3 rounded-lg text-center font-medium ${copySuccess || shareSuccess ? 'bg-green-100 text-green-700 border border-green-200' : ''}`}>{copySuccess || shareSuccess}</div>}

                {profileData.description && (
                  <div className="mb-6"><h3 className="text-lg font-semibold text-gray-900 mb-2">About Restaurant</h3><p className="text-gray-700 text-lg leading-relaxed bg-gray-50 p-4 rounded-lg border">{profileData.description}</p></div>
                )}

                {profileData.referralCode && (
                  <div className="mb-6 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-xl p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div><h3 className="text-xl font-bold text-purple-800 mb-2 flex items-center gap-2"><FiGift className="text-purple-600" /> Your Referral Code</h3><p className="text-purple-700 mb-2">Share this code with other vendors to earn rewards and grow the Veggyfy community!</p><div className="flex items-center gap-3"><code className="bg-purple-100 text-purple-800 px-4 py-2 rounded-lg text-lg font-bold border border-purple-300">{profileData.referralCode}</code><button onClick={copyReferralCode} className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"><FiCopy /> Copy</button></div></div>
                      <button onClick={shareReferralCode} className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium whitespace-nowrap"><FiShare2 /> Share Referral</button>
                    </div>
                  </div>
                )}

                <DisclaimersSection disclaimers={profileData.disclaimers} />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="space-y-4">
                    <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl"><div className="p-3 bg-red-100 rounded-full"><FiMapPin className="text-red-600 text-xl" /></div><div><h3 className="font-semibold text-gray-900 mb-1">Location (Area/Landmark)</h3><p className="text-gray-700">{profileData.locationName}</p></div></div>
                    <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl"><div className="p-3 bg-orange-100 rounded-full"><MdLocationCity className="text-orange-600 text-xl" /></div><div><h3 className="font-semibold text-gray-900 mb-1">Full Address</h3><p className="text-gray-700 whitespace-pre-line">{profileData.fullAddress || 'Not provided'}</p>{profileData.location?.coordinates && <p className="text-sm text-gray-500 mt-2 flex items-center gap-1"><FiNavigation className="text-xs" /> Coordinates: {profileData.location.coordinates[1]?.toFixed(6) || 'N/A'}, {profileData.location.coordinates[0]?.toFixed(6) || 'N/A'}</p>}</div></div>
                    <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl"><div className="p-3 bg-blue-100 rounded-full"><FiCreditCard className="text-blue-600 text-xl" /></div><div><h3 className="font-semibold text-gray-900 mb-1">GST Number</h3><p className="text-gray-700 font-mono">{profileData.gstNumber || 'Not provided'}</p></div></div>
                    <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl"><div className="p-3 bg-green-100 rounded-full"><FaIdCard className="text-green-600 text-xl" /></div><div><h3 className="font-semibold text-gray-900 mb-1">FSSAI License No.</h3><p className="text-gray-700 font-mono">{profileData.fssaiNo || 'Not provided'}</p><p className="text-xs text-gray-500 mt-1">14-digit FSSAI license number</p></div></div>
                    <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl"><div className="p-3 bg-teal-100 rounded-full"><FiTrendingUp className="text-teal-600 text-xl" /></div><div><h3 className="font-semibold text-gray-900 mb-1">Commission Rate</h3><p className={`text-2xl font-bold ${getCommissionColor(profileData.commission).split(' ')[0]}`}>{profileData.commission || 0}%</p><p className="text-sm text-gray-500 mt-1">Platform commission percentage on orders</p></div></div>
                    <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl"><div className="p-3 bg-purple-100 rounded-full"><FiUsers className="text-purple-600 text-xl" /></div><div><h3 className="font-semibold text-gray-900 mb-1">Referral Program</h3><p className="text-gray-700">{profileData.referredBy ? `Referred by: ${profileData.referredBy}` : 'No referral used'}</p></div></div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl"><div className="p-3 bg-blue-100 rounded-full"><FiMail className="text-blue-600 text-xl" /></div><div><h3 className="font-semibold text-gray-900 mb-1">Email</h3><p className="text-gray-700">{profileData.email}</p></div></div>
                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl"><div className="p-3 bg-green-100 rounded-full"><FiPhone className="text-green-600 text-xl" /></div><div><h3 className="font-semibold text-gray-900 mb-1">Mobile</h3><p className="text-gray-700">{profileData.mobile}</p></div></div>
                    <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl"><div className="p-3 bg-orange-100 rounded-full"><FiTag className="text-orange-600 text-xl" /></div><div><h3 className="font-semibold text-gray-900 mb-1">Categories</h3><p className="text-gray-700">{profileData.categories && profileData.categories.length > 0 ? profileData.categories.join(', ') : 'No categories assigned'}</p></div></div>
                    <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl"><div className="p-3 bg-pink-100 rounded-full"><FiStar className="text-pink-600 text-xl" /></div><div><h3 className="font-semibold text-gray-900 mb-1">Customer Reviews</h3><p className="text-gray-700">{profileData.reviews?.length || 0} review(s)</p>{profileData.reviews?.length > 0 && <p className="text-sm text-gray-500 mt-1">Latest: {profileData.reviews[profileData.reviews.length - 1]?.comment?.substring(0, 30)}...</p>}</div></div>
                  </div>
                </div>

                <div className="mb-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2"><FiFileText className="text-gray-600" /> Business Documents<span className="text-sm text-gray-500 font-normal ml-auto">Hover over documents to download</span></h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <DocumentCard type="gstCertificate" title="GST Certificate" data={profileData.gstCertificate} />
                    <DocumentCard type="fssaiLicense" title="FSSAI License" data={profileData.fssaiLicense} />
                    <DocumentCard type="panCard" title="PAN Card" data={profileData.panCard} />
                    <DocumentCard type="aadharCard" title="Aadhar Card" data={{ url: profileData.aadharCardFront?.url }} uploadedAt={profileData.aadharCardFront?.uploadedAt} />
                    <DocumentCard type="declarationForm" title="Declaration Form" data={profileData.declarationForm} uploadedAt={profileData.declarationForm?.uploadedAt} />
                    <DocumentCard type="vendorAgreement" title="Vendor Agreement" data={profileData.vendorAgreement} uploadedAt={profileData.vendorAgreement?.uploadedAt} />
                  </div>
                </div>

                <DocumentUploadSection />

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 text-center"><div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3"><FiDollarSign className="text-green-600 text-xl" /></div><p className="text-sm text-gray-600 mb-1">Wallet Balance</p><p className="text-2xl font-bold text-gray-900">₹{profileData.walletBalance || 0}</p></div>
                  <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-xl p-4 text-center"><div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3"><FiStar className="text-yellow-600 text-xl" /></div><p className="text-sm text-gray-600 mb-1">Rating</p><p className="text-2xl font-bold text-gray-900">{profileData.rating || 'N/A'}</p></div>
                  <div className="bg-gradient-to-r from-teal-50 to-cyan-50 border border-teal-200 rounded-xl p-4 text-center"><div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-3"><FiPercent className="text-teal-600 text-xl" /></div><p className="text-sm text-gray-600 mb-1">Commission</p><p className="text-2xl font-bold text-gray-900">{profileData.commission || 0}%</p></div>
                  <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-xl p-4 text-center"><div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3"><FiCalendar className="text-blue-600 text-xl" /></div><p className="text-sm text-gray-600 mb-1">Member Since</p><p className="text-lg font-bold text-gray-900">{formatDate(profileData.createdAt)}</p></div>
                  <div className="bg-gradient-to-r from-purple-50 to-violet-50 border border-purple-200 rounded-xl p-4 text-center"><div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3"><FiClock className="text-purple-600 text-xl" /></div><p className="text-sm text-gray-600 mb-1">Last Updated</p><p className="text-lg font-bold text-gray-900">{formatDate(profileData.updatedAt)}</p></div>
                  <div className="bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-200 rounded-xl p-4 text-center"><div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-3"><FiStar className="text-pink-600 text-xl" /></div><p className="text-sm text-gray-600 mb-1">Total Reviews</p><p className="text-2xl font-bold text-gray-900">{profileData.reviews?.length || 0}</p></div>
                  <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-xl p-4 text-center"><div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3"><FiGift className="text-purple-600 text-xl" /></div><p className="text-sm text-gray-600 mb-1">Referral Code</p><p className="text-lg font-bold text-gray-900 font-mono">{profileData.referralCode}</p></div>
                </div>

                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2"><FiNavigation className="text-gray-500" /> Restaurant Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div><span className="font-medium text-gray-700">Restaurant ID:</span><p className="text-gray-600 font-mono bg-gray-100 px-2 py-1 rounded mt-1 text-xs">{profileData._id}</p></div>
                    <div><span className="font-medium text-gray-700">Status:</span><div className="flex items-center gap-2 mt-1">{getStatusIcon(profileData.status)}<span className={`font-medium capitalize ${profileData.status === 'active' ? 'text-green-600' : profileData.status === 'pending' ? 'text-yellow-600' : 'text-red-600'}`}>{profileData.status}</span></div></div>
                    <div><span className="font-medium text-gray-700">Commission Rate:</span><p className={`font-bold ${getCommissionColor(profileData.commission).split(' ')[0]} mt-1`}>{profileData.commission || 0}%</p></div>
                    <div><span className="font-medium text-gray-700">Total Reviews:</span><p className="text-gray-900 font-bold mt-1">{profileData.reviews?.length || 0}</p></div>
                    <div className="md:col-span-2"><span className="font-medium text-gray-700">Full Address:</span><p className="text-gray-600 mt-1 whitespace-pre-line bg-gray-50 p-2 rounded">{profileData.fullAddress || 'Not provided'}</p></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button onClick={() => setIsEditing(true)} className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"><FiEdit3 /> Edit Profile</button>
            </div>
          </>
        )}

        {!isEditing && (
          <div className="mt-8 bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-orange-800 mb-3 flex items-center gap-2"><FiStar className="text-orange-600" /> Profile Tips</h3>
            <ul className="text-orange-700 space-y-2">
              <li className="flex items-start gap-2"><span className="text-orange-500 mt-1">•</span><span>Share your referral code <strong>{profileData.referralCode}</strong> to earn rewards</span></li>
              <li className="flex items-start gap-2"><span className="text-orange-500 mt-1">•</span><span>Your current commission rate is <strong>{profileData.commission || 0}%</strong> on all orders</span></li>
              <li className="flex items-start gap-2"><span className="text-orange-500 mt-1">•</span><span>Keep your restaurant information updated to attract more customers</span></li>
              <li className="flex items-start gap-2"><span className="text-orange-500 mt-1">•</span><span>All your business documents are securely stored and can be viewed anytime</span></li>
              <li className="flex items-start gap-2"><span className="text-orange-500 mt-1">•</span><span>Hover over any document card and click the download icon to save it</span></li>
              {profileData.disclaimers && profileData.disclaimers.length > 0 && <li className="flex items-start gap-2"><span className="text-orange-500 mt-1">•</span><span>Your restaurant has <strong>{profileData.disclaimers.length} disclaimer(s)</strong> displayed to customers</span></li>}
            </ul>
          </div>
        )}
      </div>

      {modalOpen && currentDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2"><FiFileText className="text-blue-600" /> {currentDocument.title}</h3>
              <div className="flex items-center gap-2">
                <button onClick={() => downloadDocument(currentDocument.url, `${currentDocument.title.replace(/\s+/g, '_')}.jpg`)} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"><FiDownload /> Download</button>
                <button onClick={closeDocumentModal} className="p-2 hover:bg-gray-100 rounded-lg transition-colors"><FiX className="text-xl text-gray-600" /></button>
              </div>
            </div>
            <div className="p-6 max-h-[70vh] overflow-auto">
              <div className="flex justify-center"><img src={currentDocument.url} alt={currentDocument.title} className="max-w-full max-h-[60vh] object-contain rounded-lg shadow-lg" /></div>
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div><span className="font-medium text-gray-700">Document Type:</span><p className="text-gray-900 font-semibold mt-1">{currentDocument.type}</p></div>
                {currentDocument.uploadedAt && <div><span className="font-medium text-gray-700">Uploaded At:</span><p className="text-gray-900 font-semibold mt-1">{formatDate(currentDocument.uploadedAt)}</p></div>}
                <div className="md:col-span-2"><span className="font-medium text-gray-700">File URL:</span><p className="text-blue-600 break-all mt-1 font-mono text-xs">{currentDocument.url}</p></div>
              </div>
            </div>
            <div className="flex justify-end p-6 border-t border-gray-200"><button onClick={closeDocumentModal} className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">Close</button></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorProfile;