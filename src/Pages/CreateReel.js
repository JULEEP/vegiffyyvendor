import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  FiVideo,
  FiUpload,
  FiX,
  FiCheckCircle,
  FiAlertCircle,
  FiLoader,
  FiLink,
  FiTag,
  FiFileText,
  FiZap,
  FiImage,
  FiEdit2,
  FiTrash2,
  FiPlay,
  FiEye,
  FiEyeOff,
  FiStar,
  FiCalendar,
  FiExternalLink,
  FiCopy,
  FiClock
} from 'react-icons/fi';

const CreateReel = () => {
  // ========== STATE ==========
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    deepLink: '',
    isHot: false,
    status: 'active'
  });

  const [videoFile, setVideoFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState('');
  const [videoPreview, setVideoPreview] = useState('');
  
  // UI state
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  
  // Reels list state
  const [reels, setReels] = useState([]);
  const [loadingReels, setLoadingReels] = useState(false);
  
  // Modal state
  const [deleteModal, setDeleteModal] = useState({ show: false, reelId: null, reelTitle: '' });
  const [editModal, setEditModal] = useState({ show: false, reel: null });
  const [viewModal, setViewModal] = useState({ show: false, reel: null });
  const [editFormData, setEditFormData] = useState({
    title: '',
    description: '',
    deepLink: '',
    isHot: false
    // status removed
  });
  const [updating, setUpdating] = useState(false);
  const [copySuccess, setCopySuccess] = useState('');

  // Constants
  const restaurantId = localStorage.getItem("vendorId");
  const API_BASE_URL = "https://api.vegiffyy.com/api/vendor";

  // ========== FETCH REELS ==========
  useEffect(() => {
    if (restaurantId) {
      fetchReels();
    }
  }, [restaurantId]);

  const fetchReels = async () => {
    setLoadingReels(true);
    try {
      const response = await axios.get(
        `${API_BASE_URL}/getallreelsbyvendor/${restaurantId}`
      );
      if (response.data.success) {
        setReels(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching reels:', err);
      setError('Reels load nahi ho payi');
    } finally {
      setLoadingReels(false);
    }
  };

  // ========== CREATE REEL ==========
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm', 'video/3gpp'];
      if (!validTypes.includes(file.type)) {
        setValidationErrors({ video: 'Sirf MP4, MOV, AVI, WEBM, 3GP video allowed hai' });
        return;
      }
      if (file.size > 100 * 1024 * 1024) {
        setValidationErrors({ video: 'Video size 100MB se kam hona chahiye' });
        return;
      }

      setVideoFile(file);
      setValidationErrors({});
      
      const reader = new FileReader();
      reader.onloadend = () => setVideoPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        setValidationErrors({ thumbnail: 'Sirf JPG, PNG, WEBP images allowed hain' });
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setValidationErrors({ thumbnail: 'Thumbnail size 5MB se kam hona chahiye' });
        return;
      }

      setThumbnailFile(file);
      setValidationErrors({});
      
      const reader = new FileReader();
      reader.onloadend = () => setThumbnailPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const removeVideo = () => {
    setVideoFile(null);
    setVideoPreview('');
    document.getElementById('video-input').value = '';
  };

  const removeThumbnail = () => {
    setThumbnailFile(null);
    setThumbnailPreview('');
    document.getElementById('thumbnail-input').value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!videoFile) {
      setValidationErrors({ video: 'Video file select karna zaroori hai' });
      return;
    }

    if (!restaurantId) {
      setError('Restaurant ID nahi mila');
      return;
    }

    setUploading(true);
    setError('');
    setUploadProgress(0);

    const formDataObj = new FormData();
    formDataObj.append('video', videoFile);
    if (thumbnailFile) formDataObj.append('thumbnail', thumbnailFile);
    formDataObj.append('title', formData.title);
    formDataObj.append('description', formData.description);
    formDataObj.append('deepLink', formData.deepLink);
    formDataObj.append('isHot', formData.isHot);
    formDataObj.append('status', formData.status);

    try {
      const response = await axios.post(
        `${API_BASE_URL}/createreel/${restaurantId}`,
        formDataObj,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              setUploadProgress(percentCompleted);
            }
          }
        }
      );

      if (response.data.success) {
        setSuccess(true);
        setFormData({ title: '', description: '', deepLink: '', isHot: false, status: 'active' });
        setVideoFile(null);
        setVideoPreview('');
        setThumbnailFile(null);
        setThumbnailPreview('');
        fetchReels();
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  // ========== VIEW REEL ==========
  const openViewModal = (reel) => {
    setViewModal({ show: true, reel });
  };

  // ========== UPDATE REEL (status removed) ==========
  const openEditModal = (reel) => {
    setEditModal({ show: true, reel });
    setEditFormData({
      title: reel.title || '',
      description: reel.description || '',
      deepLink: reel.deepLink || '',
      isHot: reel.isHot || false
      // status field removed
    });
  };

  const handleEditInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleUpdateReel = async (e) => {
    e.preventDefault();
    
    if (!editModal.reel) return;

    setUpdating(true);
    setError('');

    const formDataObj = new FormData();
    formDataObj.append('title', editFormData.title);
    formDataObj.append('description', editFormData.description);
    formDataObj.append('deepLink', editFormData.deepLink);
    formDataObj.append('isHot', editFormData.isHot);
    // status field not sent

    try {
      const response = await axios.put(
        `${API_BASE_URL}/updatereels/${editModal.reel._id}`,
        formDataObj,
        {
          headers: { 'Content-Type': 'multipart/form-data' }
        }
      );

      if (response.data.success) {
        setEditModal({ show: false, reel: null });
        fetchReels();
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed');
    } finally {
      setUpdating(false);
    }
  };

  // ========== DELETE REEL ==========
  const openDeleteModal = (reel) => {
    setDeleteModal({ show: true, reelId: reel._id, reelTitle: reel.title || 'Untitled' });
  };

  const handleDeleteReel = async () => {
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/deletereel/${deleteModal.reelId}`
      );

      if (response.data.success) {
        setDeleteModal({ show: false, reelId: null, reelTitle: '' });
        fetchReels();
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Delete failed');
    }
  };

  // ========== UTILITY FUNCTIONS ==========
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopySuccess('Copied!');
    setTimeout(() => setCopySuccess(''), 2000);
  };

  // ========== RENDER ==========
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Reel Management</h1>
          <p className="text-gray-600">Create and manage your video reels</p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
            <FiCheckCircle className="text-green-500" />
            <span className="text-green-700">Success!</span>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
            <FiAlertCircle className="text-red-500" />
            <span className="text-red-700">{error}</span>
          </div>
        )}

        {/* Main Grid - Left: Form, Right: List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* ===== LEFT SIDE - CREATE FORM ===== */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-[750px] flex flex-col">
            <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
              <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                <FiVideo className="text-purple-600" />
                Create New Reel
              </h2>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Video Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Video <span className="text-red-500">*</span>
                  </label>
                  {!videoPreview ? (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                      <input
                        id="video-input"
                        type="file"
                        accept="video/mp4,video/mov,video/avi,video/webm,video/3gpp"
                        onChange={handleVideoChange}
                        className="hidden"
                      />
                      <label htmlFor="video-input" className="cursor-pointer">
                        <FiUpload className="mx-auto text-gray-400 text-2xl mb-2" />
                        <p className="text-sm text-gray-600">Click to upload video</p>
                        <p className="text-xs text-gray-400">MP4, MOV, AVI • Max 100MB</p>
                      </label>
                    </div>
                  ) : (
                    <div className="relative">
                      <video src={videoPreview} className="w-full rounded-lg max-h-40 object-contain bg-black" controls />
                      <button type="button" onClick={removeVideo} className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-lg">
                        <FiX size={16} />
                      </button>
                    </div>
                  )}
                  {validationErrors.video && (
                    <p className="mt-1 text-xs text-red-600">{validationErrors.video}</p>
                  )}
                </div>

                {/* Thumbnail Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FiImage className="inline mr-1" /> Thumbnail (Optional)
                  </label>
                  {!thumbnailPreview ? (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-3 text-center">
                      <input
                        id="thumbnail-input"
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        onChange={handleThumbnailChange}
                        className="hidden"
                      />
                      <label htmlFor="thumbnail-input" className="cursor-pointer">
                        <p className="text-xs text-gray-600">Click to upload thumbnail</p>
                      </label>
                    </div>
                  ) : (
                    <div className="relative w-24">
                      <img src={thumbnailPreview} alt="Thumbnail" className="w-full h-16 object-cover rounded-lg" />
                      <button type="button" onClick={removeThumbnail} className="absolute top-1 right-1 p-0.5 bg-red-500 text-white rounded">
                        <FiX size={12} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <FiTag className="inline mr-1" /> Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Enter title"
                    className="w-full border border-gray-300 rounded-lg p-2 text-sm"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <FiFileText className="inline mr-1" /> Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Enter description"
                    rows="2"
                    className="w-full border border-gray-300 rounded-lg p-2 text-sm"
                  />
                </div>

                {/* Deep Link */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <FiLink className="inline mr-1" /> Deep Link
                  </label>
                  <input
                    type="url"
                    name="deepLink"
                    value={formData.deepLink}
                    onChange={handleInputChange}
                    placeholder="https://example.com"
                    className="w-full border border-gray-300 rounded-lg p-2 text-sm"
                  />
                </div>

                {/* Hot Toggle */}
                <div className="flex items-center justify-between p-2 bg-yellow-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <FiZap className="text-yellow-600" />
                    <span className="text-sm font-medium">Mark as Hot</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="isHot"
                      checked={formData.isHot}
                      onChange={handleInputChange}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:ring-2 peer-focus:ring-yellow-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-yellow-600"></div>
                  </label>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={uploading || !videoFile}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2 px-4 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {uploading ? (
                    <>
                      <FiLoader className="animate-spin" />
                      Uploading... {uploadProgress}%
                    </>
                  ) : (
                    <>
                      <FiVideo />
                      Create Reel
                    </>
                  )}
                </button>

                {/* Progress Bar */}
                {uploading && (
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div 
                        className="bg-gradient-to-r from-purple-600 to-pink-600 h-1.5 rounded-full transition-all duration-300" 
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </form>
            </div>
          </div>

          {/* ===== RIGHT SIDE - REELS LIST ===== */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-[750px] flex flex-col">
            <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 flex justify-between items-center">
              <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                <FiPlay className="text-blue-600" />
                Your Reels ({reels.length})
              </h2>
              <button 
                onClick={fetchReels}
                className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded hover:bg-blue-200"
              >
                Refresh
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {loadingReels ? (
                <div className="text-center py-8">
                  <FiLoader className="animate-spin mx-auto text-blue-600 text-2xl" />
                  <p className="text-sm text-gray-500 mt-2">Loading...</p>
                </div>
              ) : reels.length === 0 ? (
                <div className="text-center py-8">
                  <FiVideo className="mx-auto text-gray-300 text-4xl" />
                  <p className="text-sm text-gray-500 mt-2">No reels yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {reels.map((reel) => (
                    <div key={reel._id} className="border border-gray-200 rounded-lg p-3 hover:shadow-sm">
                      <div className="flex gap-3">
                        {/* Thumbnail */}
                        <div 
                          className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 cursor-pointer"
                          onClick={() => openViewModal(reel)}
                        >
                          {reel.thumbUrl ? (
                            <img src={reel.thumbUrl} alt={reel.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-purple-100">
                              <FiVideo className="text-purple-400" />
                            </div>
                          )}
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div 
                              className="cursor-pointer flex-1"
                              onClick={() => openViewModal(reel)}
                            >
                              <h3 className="font-medium text-sm truncate">{reel.title || 'Untitled'}</h3>
                              <p className="text-xs text-gray-500 truncate">{reel.description || 'No description'}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className={`text-xs px-2 py-0.5 rounded-full ${
                                  reel.status === 'active' 
                                    ? 'bg-green-100 text-green-700' 
                                    : 'bg-gray-100 text-gray-700'
                                }`}>
                                  {reel.status === 'active' ? <FiEye size={10} className="inline mr-1" /> : <FiEyeOff size={10} className="inline mr-1" />}
                                  {reel.status}
                                </span>
                                {reel.isHot && (
                                  <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                                    <FiStar size={10} /> Hot
                                  </span>
                                )}
                                <span className="text-xs text-gray-400">
                                  {new Date(reel.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                            
                            {/* Actions */}
                            <div className="flex gap-1 ml-2">
                              <button
                                onClick={() => openViewModal(reel)}
                                className="p-1.5 bg-green-50 text-green-600 rounded hover:bg-green-100"
                                title="View"
                              >
                                <FiEye size={14} />
                              </button>
                              <button
                                onClick={() => openEditModal(reel)}
                                className="p-1.5 bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
                                title="Edit"
                              >
                                <FiEdit2 size={14} />
                              </button>
                              <button
                                onClick={() => openDeleteModal(reel)}
                                className="p-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100"
                                title="Delete"
                              >
                                <FiTrash2 size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ===== VIEW MODAL (unchanged) ===== */}
        {viewModal.show && viewModal.reel && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] flex flex-col">
              <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="font-semibold flex items-center gap-2 text-lg">
                  <FiEye className="text-blue-600" />
                  {viewModal.reel.title || 'Untitled Reel'}
                </h3>
                <button 
                  onClick={() => setViewModal({ show: false, reel: null })}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <FiX size={20} />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6">
                <div className="bg-black rounded-lg overflow-hidden mb-6">
                  <video 
                    src={viewModal.reel.videoUrl} 
                    controls 
                    autoPlay
                    className="w-full max-h-[400px] object-contain"
                  >
                    Your browser does not support the video tag.
                  </video>
                </div>

                {viewModal.reel.thumbUrl && (
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <FiImage className="text-purple-600" />
                      Thumbnail Image
                    </h4>
                    <div className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50 p-4">
                      <img 
                        src={viewModal.reel.thumbUrl} 
                        alt="Thumbnail" 
                        className="max-h-[200px] w-auto mx-auto object-contain rounded-lg shadow-sm"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <label className="text-xs text-gray-500 flex items-center gap-1 mb-1">
                        <FiTag size={12} /> Title
                      </label>
                      <p className="text-sm font-medium">{viewModal.reel.title || '—'}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <label className="text-xs text-gray-500 flex items-center gap-1 mb-1">
                        <FiEye size={12} /> Status
                      </label>
                      <p className="text-sm">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                          viewModal.reel.status === 'active' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {viewModal.reel.status === 'active' ? <FiEye size={12} className="mr-1" /> : <FiEyeOff size={12} className="mr-1" />}
                          {viewModal.reel.status}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-3 rounded-lg">
                    <label className="text-xs text-gray-500 flex items-center gap-1 mb-1">
                      <FiFileText size={12} /> Description
                    </label>
                    <p className="text-sm whitespace-pre-wrap">{viewModal.reel.description || 'No description provided'}</p>
                  </div>

                  {viewModal.reel.deepLink && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <label className="text-xs text-gray-500 flex items-center gap-1 mb-1">
                        <FiLink size={12} /> Deep Link
                      </label>
                      <a 
                        href={viewModal.reel.deepLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 flex items-center gap-1 hover:underline break-all"
                      >
                        {viewModal.reel.deepLink} <FiExternalLink size={12} />
                      </a>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    {viewModal.reel.isHot && (
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <label className="text-xs text-gray-500 flex items-center gap-1 mb-1">
                          <FiStar size={12} /> Featured
                        </label>
                        <p className="text-sm">
                          <span className="inline-flex items-center px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs">
                            <FiStar size={12} className="mr-1" /> Hot
                          </span>
                        </p>
                      </div>
                    )}
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <label className="text-xs text-gray-500 flex items-center gap-1 mb-1">
                        <FiVideo size={12} /> Reel ID
                      </label>
                      <p className="text-xs font-mono text-gray-600 break-all">{viewModal.reel._id}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <label className="text-xs text-gray-500 flex items-center gap-1 mb-1">
                        <FiCalendar size={12} /> Created
                      </label>
                      <p className="text-sm flex items-center gap-1">
                        <FiClock size={12} className="text-gray-400" />
                        {formatDate(viewModal.reel.createdAt)}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <label className="text-xs text-gray-500 flex items-center gap-1 mb-1">
                        <FiCalendar size={12} /> Updated
                      </label>
                      <p className="text-sm flex items-center gap-1">
                        <FiClock size={12} className="text-gray-400" />
                        {formatDate(viewModal.reel.updatedAt)}
                      </p>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-3 rounded-lg">
                    <label className="text-xs text-gray-500 flex items-center gap-1 mb-1">
                      <FiVideo size={12} /> Vendor ID
                    </label>
                    <p className="text-xs font-mono text-gray-600">{viewModal.reel.vendorId}</p>
                  </div>

                  <div className="bg-gray-50 p-3 rounded-lg">
                    <label className="text-xs text-gray-500 flex items-center gap-1 mb-1">
                      <FiLink size={12} /> Video URL
                    </label>
                    <div className="flex items-center gap-2">
                      <input 
                        type="text" 
                        value={viewModal.reel.videoUrl} 
                        readOnly 
                        className="text-xs bg-white p-2 rounded border flex-1"
                      />
                      <button
                        onClick={() => copyToClipboard(viewModal.reel.videoUrl)}
                        className="px-3 py-2 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200 flex items-center gap-1"
                      >
                        <FiCopy size={14} />
                        {copySuccess || 'Copy'}
                      </button>
                    </div>
                  </div>

                  {viewModal.reel.thumbUrl && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <label className="text-xs text-gray-500 flex items-center gap-1 mb-1">
                        <FiImage size={12} /> Thumbnail URL
                      </label>
                      <div className="flex items-center gap-2">
                        <input 
                          type="text" 
                          value={viewModal.reel.thumbUrl} 
                          readOnly 
                          className="text-xs bg-white p-2 rounded border flex-1"
                        />
                        <button
                          onClick={() => copyToClipboard(viewModal.reel.thumbUrl)}
                          className="px-3 py-2 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200 flex items-center gap-1"
                        >
                          <FiCopy size={14} />
                          Copy
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-4 border-t border-gray-200 flex justify-end">
                <button
                  onClick={() => setViewModal({ show: false, reel: null })}
                  className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ===== EDIT MODAL - STATUS FIELD REMOVED ===== */}
        {editModal.show && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full">
              <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="font-semibold">Edit Reel</h3>
                <button onClick={() => setEditModal({ show: false, reel: null })}>
                  <FiX />
                </button>
              </div>
              <form onSubmit={handleUpdateReel} className="p-4 space-y-3 max-h-[70vh] overflow-y-auto">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    name="title"
                    value={editFormData.title}
                    onChange={handleEditInputChange}
                    className="w-full border border-gray-300 rounded-lg p-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    name="description"
                    value={editFormData.description}
                    onChange={handleEditInputChange}
                    rows="2"
                    className="w-full border border-gray-300 rounded-lg p-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Deep Link</label>
                  <input
                    type="url"
                    name="deepLink"
                    value={editFormData.deepLink}
                    onChange={handleEditInputChange}
                    className="w-full border border-gray-300 rounded-lg p-2 text-sm"
                  />
                </div>
                {/* Status select removed */}
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Mark as Hot</label>
                  <input
                    type="checkbox"
                    name="isHot"
                    checked={editFormData.isHot}
                    onChange={handleEditInputChange}
                    className="w-5 h-5"
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    disabled={updating}
                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {updating ? 'Updating...' : 'Update'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditModal({ show: false, reel: null })}
                    className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ===== DELETE MODAL ===== */}
        {deleteModal.show && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-sm w-full p-4">
              <div className="text-center">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <FiTrash2 className="text-red-600 text-xl" />
                </div>
                <h3 className="font-semibold mb-2">Delete Reel?</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Are you sure you want to delete "{deleteModal.reelTitle}"?
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handleDeleteReel}
                    className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => setDeleteModal({ show: false, reelId: null, reelTitle: '' })}
                    className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateReel;