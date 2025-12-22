import React, { useState, useRef } from "react";
import {
  FiUpload,
  FiX,
  FiMapPin,
  FiMail,
  FiPhone,
  FiDollarSign,
  FiStar,
  FiNavigation,
  FiLock,
  FiFileText,
  FiDownload,
  FiPercent,
  FiHome,
  FiMap,
  FiUser,
  FiClipboard,
  FiFile,
  FiImage,
  FiCheckCircle,
  FiAlertCircle
} from "react-icons/fi";
import { 
  MdRestaurant, 
  MdLocationOn, 
  MdDescription,
  MdPhone,
  MdEmail,
  MdAttachMoney,
  MdDiscount,
  MdBusiness,
  MdSecurity,
  MdAssignment
} from "react-icons/md";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";

const AddVendorForm = () => {
  const navigate = useNavigate();
  
  const [form, setForm] = useState({
    restaurantName: "",
    description: "",
    locationName: "",
    email: "",
    mobile: "",
    gstNumber: "",
    referralCode: "",
    password: "",
    lat: "",
    lng: "",
    commission: "",
    discount: ""
  });

  const [files, setFiles] = useState({
    image: null,
    gstCertificate: null,
    fssaiLicense: null,
    panCard: null,
    aadharCardFront: null,
    aadharCardBack: null
  });

  const [previews, setPreviews] = useState({
    image: null,
    gstCertificate: null,
    fssaiLicense: null,
    panCard: null,
    aadharCardFront: null,
    aadharCardBack: null
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [totalFileSize, setTotalFileSize] = useState(0);

  const fileRefs = {
    image: useRef(null),
    gstCertificate: useRef(null),
    fssaiLicense: useRef(null),
    panCard: useRef(null),
    aadharCardFront: useRef(null),
    aadharCardBack: useRef(null)
  };

  // File size calculation
  const calculateTotalSize = (filesObj) => {
    let total = 0;
    Object.values(filesObj).forEach(file => {
      if (file) total += file.size;
    });
    return total;
  };

  // Image compression function
  const compressImage = async (file, maxWidth = 1024, quality = 0.7) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          // Calculate new dimensions
          let width = img.width;
          let height = img.height;
          
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
          
          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);
          
          canvas.toBlob(
            (blob) => {
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now()
              });
              resolve(compressedFile);
            },
            'image/jpeg',
            quality
          );
        };
      };
    });
  };

  // Generate Declaration PDF
  const generateDeclarationPDF = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFillColor(46, 125, 50);
    doc.rect(0, 0, 210, 30, 'F');
    
    // Title
    doc.setFontSize(18);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text('DECLARATION LETTER', 105, 15, { align: 'center' });
    doc.setFontSize(12);
    doc.text('(Pure Vegetarian Restaurant)', 105, 22, { align: 'center' });
    
    // Content
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    
    const content = [
      'Date: ___________________________',
      '',
      'To,',
      'Vegiffyy - Pure Vegetarian Food Delivery App',
      'Jainity Eats India Private Limited',
      '',
      'Subject: Declaration of Pure Vegetarian Restaurant',
      '',
      'I, ________________________________________, Proprietor / Authorized Signatory of',
      '',
      `Restaurant Name: ${form.restaurantName || '___________________________'}`,
      `Address: ${form.locationName || '___________________________'}`,
      '',
      'do hereby solemnly declare and affirm that:',
      '',
      '1. Our restaurant is a 100% Pure Vegetarian establishment.',
      '2. We do not prepare, store, sell, or serve any non-vegetarian food items.',
      '3. All ingredients and food preparation processes follow pure vegetarian standards.',
      '4. We comply with FSSAI regulations and maintain proper hygiene standards.',
      '5. We understand any violation may lead to immediate delisting from Vegiffyy.',
      '',
      'This declaration is made for the purpose of onboarding with Vegiffyy platform.',
      '',
      'Vendor Signature: _________________________',
      'Name: _________________________',
      'Mobile: _________________________',
      'Date: _________________________'
    ];

    let yPosition = 40;
    content.forEach(line => {
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
      }
      doc.text(line, 20, yPosition);
      yPosition += 7;
    });

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text('Generated by Vegiffyy Platform', 105, 285, { align: 'center' });

    doc.save('Vegiffyy-Declaration.pdf');
  };

  // Generate Vendor Agreement PDF
  const generateVendorAgreementPDF = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFillColor(46, 125, 50);
    doc.rect(0, 0, 210, 30, 'F');
    
    // Title
    doc.setFontSize(16);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text('VENDOR AGREEMENT', 105, 15, { align: 'center' });
    
    doc.setFontSize(10);
    doc.text('Vegiffyy - Pure Vegetarian Food Delivery Platform', 105, 22, { align: 'center' });
    
    // Content
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    
    const agreementContent = [
      'This Vendor Agreement is made on ___________________________',
      '',
      'BETWEEN',
      '',
      'Jainity Eats India Private Limited',
      '(Hereinafter referred to as "Company")',
      '',
      'AND',
      '',
      `Vendor: ${form.restaurantName || '___________________________'}`,
      `Address: ${form.locationName || '___________________________'}`,
      '(Hereinafter referred to as "Vendor")',
      '',
      'AGREEMENT TERMS:',
      '',
      '1. COMMISSION STRUCTURE',
      `   Vendor agrees to pay ${form.commission || '___'}% commission on all orders.`,
      '',
      '2. PAYMENT TERMS',
      '   Payments will be settled weekly after deducting applicable charges.',
      '',
      '3. QUALITY STANDARDS',
      '   Vendor shall maintain highest food quality and hygiene standards.',
      '',
      '4. DELIVERY COMMITMENT',
      '   Orders must be prepared within promised time frames.',
      '',
      '5. TERMINATION',
      '   Either party may terminate with 15 days written notice.',
      '',
      '6. GOVERNING LAW',
      '   This agreement shall be governed by laws of India.',
      '',
      'IN WITNESS WHEREOF, the parties have executed this agreement.',
      '',
      '_________________________',
      'For Jainity Eats India Private Limited',
      '',
      '_________________________',
      'Vendor Signature',
      '',
      'Date: _________________________'
    ];

    let yPosition = 40;
    agreementContent.forEach(line => {
      if (yPosition > 280) {
        doc.addPage();
        yPosition = 20;
      }
      
      if (line.includes('AGREEMENT') || line.match(/^\d+\./)) {
        doc.setFont('helvetica', 'bold');
        doc.text(line, 20, yPosition);
        doc.setFont('helvetica', 'normal');
      } else {
        doc.text(line, 20, yPosition);
      }
      yPosition += 6;
    });

    doc.save('Vegiffyy-Vendor-Agreement.pdf');
  };

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFileChange = async (fileType, file) => {
    if (!file) return;

    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: "error", text: `${file.name} exceeds 5MB size limit` });
      return;
    }

    // Compress if it's an image
    let processedFile = file;
    if (file.type.startsWith('image/')) {
      setMessage({ type: "info", text: "Compressing image..." });
      processedFile = await compressImage(file);
    }

    setFiles(prev => ({ ...prev, [fileType]: processedFile }));
    setTotalFileSize(calculateTotalSize({ ...files, [fileType]: processedFile }));
    
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        setPreviews(prev => ({ ...prev, [fileType]: reader.result }));
      };
      reader.readAsDataURL(processedFile);
    } else {
      setPreviews(prev => ({ ...prev, [fileType]: 'pdf' }));
    }
    
    setMessage({ type: "success", text: `${file.name} added successfully` });
  };

  const removeFile = (fileType) => {
    setFiles(prev => ({ ...prev, [fileType]: null }));
    setPreviews(prev => ({ ...prev, [fileType]: null }));
    setTotalFileSize(calculateTotalSize({ ...files, [fileType]: null }));
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setMessage({ type: "error", text: "Geolocation not supported by your browser" });
      return;
    }

    setMessage({ type: "info", text: "Getting your location..." });

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setForm(prev => ({
          ...prev,
          lat: latitude.toFixed(6),
          lng: longitude.toFixed(6)
        }));
        setMessage({ type: "success", text: "Location fetched successfully" });
      },
      (error) => {
        setMessage({ type: "error", text: "Please allow location access or enter manually" });
      }
    );
  };

  const validateForm = () => {
    if (!form.restaurantName) return "Restaurant name is required";
    if (!form.locationName) return "Location name is required";
    if (!form.email) return "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return "Please enter a valid email";
    if (!form.mobile) return "Mobile number is required";
    if (!/^\d{10}$/.test(form.mobile)) return "Please enter a valid 10-digit mobile number";
    if (!form.password) return "Password is required";
    if (form.password.length < 6) return "Password must be at least 6 characters";
    if (!form.commission) return "Commission percentage is required";
    if (isNaN(form.commission) || parseFloat(form.commission) < 0 || parseFloat(form.commission) > 50) return "Commission must be between 0 and 50%";
    if (!form.discount) return "Discount percentage is required";
    if (isNaN(form.discount) || parseFloat(form.discount) < 0 || parseFloat(form.discount) > 100) return "Discount must be between 0 and 100%";
    if (!form.lat || !form.lng) return "Location coordinates are required";
    if (!files.image) return "Restaurant image is required";
    if (!files.fssaiLicense) return "FSSAI license is required";
    if (!files.panCard) return "PAN card is required";
    if (!files.aadharCardFront) return "Aadhar Card Front is required";
    
    // Check total file size
    if (totalFileSize > 15 * 1024 * 1024) {
      return "Total files size exceeds 15MB limit. Please compress your files.";
    }
    
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const error = validateForm();
    if (error) {
      setMessage({ type: "error", text: error });
      return;
    }

    setLoading(true);
    setMessage({ type: "info", text: "Creating restaurant..." });

    try {
      const formData = new FormData();
      
      // Add form fields
      Object.keys(form).forEach(key => {
        if (form[key] !== "") formData.append(key, form[key]);
      });

      // Add files
      Object.keys(files).forEach(key => {
        if (files[key]) formData.append(key, files[key]);
      });

      // Configure axios for progress tracking
      const config = {
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        },
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 300000 // 5 minutes timeout
      };

      const res = await axios.post("https://api.vegiffyy.com/api/restaurant", formData, config);
      
      if (res.data.success) {
        setMessage({ type: "success", text: "Restaurant created successfully!" });
        setTimeout(() => navigate("/"), 2000);
      } else {
        setMessage({ type: "error", text: res.data.message || "Creation failed" });
      }
    } catch (err) {
      if (err.code === 'ECONNABORTED') {
        setMessage({ type: "error", text: "Request timeout. Please check your internet connection." });
      } else if (err.response?.status === 413) {
        setMessage({ type: "error", text: "File size too large. Please compress images before uploading." });
      } else {
        setMessage({ type: "error", text: err.response?.data?.message || "Server error. Please try again." });
      }
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  const FileUpload = ({ title, fileType, required = false, accept = "image/*,.pdf", badgeText, icon: Icon }) => (
    <div className="border border-gray-300 rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition-all duration-300">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="text-green-600" />}
          <label className="block font-semibold text-gray-800">
            {title} {required && <span className="text-red-500">*</span>}
          </label>
        </div>
        {badgeText && (
          <span className={`px-2 py-1 text-xs rounded font-medium ${
            badgeText === "Required" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"
          }`}>
            {badgeText}
          </span>
        )}
      </div>
      
      <div className="flex items-center gap-4">
        {previews[fileType] ? (
          <div className="relative">
            {previews[fileType] === 'pdf' ? (
              <div className="w-20 h-20 bg-red-50 rounded-lg border border-red-200 flex items-center justify-center">
                <FiFileText className="text-red-500 text-xl" />
              </div>
            ) : (
              <img 
                src={previews[fileType]} 
                alt="Preview" 
                className="w-20 h-20 rounded-lg border border-gray-300 object-cover" 
              />
            )}
            <button
              type="button"
              onClick={() => removeFile(fileType)}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
            >
              <FiX size={12} />
            </button>
          </div>
        ) : (
          <div className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400 bg-white">
            <FiUpload className="text-xl" />
          </div>
        )}
        
        <div>
          <input
            type="file"
            ref={fileRefs[fileType]}
            className="hidden"
            accept={accept}
            onChange={(e) => handleFileChange(fileType, e.target.files[0])}
          />
          <button
            type="button"
            onClick={() => fileRefs[fileType].current?.click()}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center gap-2"
          >
            <FiUpload />
            Choose File
          </button>
          {files[fileType] && (
            <p className="text-sm text-gray-600 mt-1">
              {files[fileType].name} ({(files[fileType].size / 1024 / 1024).toFixed(2)} MB)
            </p>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg border border-gray-200">
        {/* Header */}
        <div className="bg-green-600 text-white p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-1">Add New Restaurant</h1>
              <p className="text-green-100">Register your restaurant on Vegiffyy platform</p>
            </div>
            <MdRestaurant className="text-3xl" />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Restaurant Image */}
          <FileUpload 
            title="Restaurant Image" 
            fileType="image" 
            required 
            accept="image/*" 
            badgeText="Required"
            icon={FiImage}
          />

          {/* Progress Bar */}
          {uploadProgress > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Uploading...</span>
                <span className="text-green-600 font-medium">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500">
                Total file size: {(totalFileSize / 1024 / 1024).toFixed(2)} MB / 15 MB
              </p>
            </div>
          )}

          {/* Basic Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block font-medium text-gray-700">
                <MdRestaurant className="inline mr-2 text-green-600" />
                Restaurant Name *
              </label>
              <input
                type="text"
                name="restaurantName"
                value={form.restaurantName}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Enter restaurant name"
              />
            </div>

            <div className="space-y-2">
              <label className="block font-medium text-gray-700">
                <MdLocationOn className="inline mr-2 text-green-600" />
                Location Name *
              </label>
              <input
                type="text"
                name="locationName"
                value={form.locationName}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Enter location name"
              />
            </div>

            <div className="space-y-2">
              <label className="block font-medium text-gray-700">
                <MdEmail className="inline mr-2 text-green-600" />
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Enter email address"
              />
            </div>

            <div className="space-y-2">
              <label className="block font-medium text-gray-700">
                <MdPhone className="inline mr-2 text-green-600" />
                Mobile Number *
              </label>
              <input
                type="tel"
                name="mobile"
                value={form.mobile}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="10-digit mobile number"
                maxLength="10"
              />
            </div>

            <div className="space-y-2">
              <label className="block font-medium text-gray-700">
                <MdSecurity className="inline mr-2 text-green-600" />
                Password *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 pr-20 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Minimum 6 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-2 text-sm text-green-600 hover:text-green-800"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block font-medium text-gray-700">
                <MdAttachMoney className="inline mr-2 text-green-600" />
                Commission % *
              </label>
              <div className="relative">
                <input
                  type="number"
                  name="commission"
                  value={form.commission}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 pr-12 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="0-50%"
                  min="0"
                  max="50"
                  step="0.1"
                />
                <span className="absolute right-3 top-2 text-gray-500">%</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block font-medium text-gray-700">
                <MdDiscount className="inline mr-2 text-green-600" />
                Discount % *
              </label>
              <div className="relative">
                <input
                  type="number"
                  name="discount"
                  value={form.discount}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 pr-12 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="0-100%"
                  min="0"
                  max="100"
                  step="0.1"
                  required
                />
                <span className="absolute right-3 top-2 text-gray-500">%</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block font-medium text-gray-700">
                <MdBusiness className="inline mr-2 text-green-600" />
                GST Number (Optional)
              </label>
              <input
                type="text"
                name="gstNumber"
                value={form.gstNumber}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Enter GST number"
              />
            </div>
          </div>

          {/* Document Uploads */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
              <FiFile className="inline mr-2" />
              Required Documents
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FileUpload 
                title="GST Certificate" 
                fileType="gstCertificate" 
                accept=".pdf,image/*"
                badgeText="Optional"
                icon={FiFileText}
              />
              <FileUpload 
                title="FSSAI License" 
                fileType="fssaiLicense" 
                required 
                accept=".pdf,image/*"
                badgeText="Required"
                icon={FiClipboard}
              />
              <FileUpload 
                title="PAN Card" 
                fileType="panCard" 
                required 
                accept=".pdf,image/*"
                badgeText="Required"
                icon={FiUser}
              />
            </div>
          </div>

          {/* Aadhar Card Section */}
          <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
            <h3 className="font-semibold text-blue-800 text-lg mb-3">
              <FiUser className="inline mr-2" />
              Aadhar Card Documents
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FileUpload 
                title="Aadhar Card Front" 
                fileType="aadharCardFront" 
                required 
                accept="image/*"
                badgeText="Required"
                icon={FiImage}
              />
              <FileUpload 
                title="Aadhar Card Back" 
                fileType="aadharCardBack" 
                accept="image/*"
                badgeText="Optional"
                icon={FiImage}
              />
            </div>
          </div>

          {/* Location Section */}
          <div className="border border-green-200 rounded-lg p-4 bg-green-50">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-3">
              <div>
                <h3 className="font-semibold text-green-800 text-lg mb-1">
                  <FiMapPin className="inline mr-2" />
                  Location Coordinates *
                </h3>
                <p className="text-green-700 text-sm">Get your current location automatically</p>
              </div>
              <button
                type="button"
                onClick={getCurrentLocation}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center gap-2"
              >
                <FiNavigation />
                Get Current Location
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block font-medium text-gray-700">Latitude</label>
                <input
                  type="number"
                  step="any"
                  name="lat"
                  value={form.lat}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Enter latitude"
                />
              </div>
              
              <div className="space-y-2">
                <label className="block font-medium text-gray-700">Longitude</label>
                <input
                  type="number"
                  step="any"
                  name="lng"
                  value={form.lng}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Enter longitude"
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="block font-medium text-gray-700">
              <MdDescription className="inline mr-2 text-green-600" />
              Description (Optional)
            </label>
            <textarea
              name="description"
              rows="3"
              value={form.description}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="Brief description about your restaurant..."
            />
          </div>

          {/* Referral Code */}
          <div className="space-y-2">
            <label className="block font-medium text-gray-700">
              <FiStar className="inline mr-2 text-green-600" />
              Referral Code (Optional)
            </label>
            <input
              type="text"
              name="referralCode"
              value={form.referralCode}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="Enter referral code"
            />
          </div>

          {/* Document Download Section */}
          <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
            <h3 className="font-semibold text-blue-800 text-lg mb-3">
              <MdAssignment className="inline mr-2" />
              Required Forms
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={generateDeclarationPDF}
                className="bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
              >
                <FiDownload />
                Download Declaration Form
              </button>
              
              <button
                type="button"
                onClick={generateVendorAgreementPDF}
                className="bg-purple-600 text-white px-4 py-3 rounded-lg hover:bg-purple-700 transition-colors font-medium flex items-center justify-center gap-2"
              >
                <FiFileText />
                Download Vendor Agreement
              </button>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex flex-col md:flex-row gap-4 pt-6 border-t">
            <button
              type="submit"
              disabled={loading}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors font-medium flex items-center justify-center gap-2 flex-1"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creating Restaurant...
                </>
              ) : (
                <>
                  <FiCheckCircle />
                  Create Restaurant
                </>
              )}
            </button>
            
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="border border-red-500 text-red-500 hover:bg-red-500 hover:text-white px-6 py-3 rounded-lg transition-colors font-medium flex items-center justify-center gap-2 flex-1"
            >
              <FiX />
              Cancel
            </button>
          </div>

          {/* Message Display */}
          {message.text && (
            <div className={`p-4 rounded-lg border ${
              message.type === "success" ? "bg-green-50 text-green-800 border-green-200" :
              message.type === "error" ? "bg-red-50 text-red-800 border-red-200" :
              "bg-blue-50 text-blue-800 border-blue-200"
            }`}>
              <div className="flex items-center gap-2">
                {message.type === "success" ? <FiCheckCircle /> :
                 message.type === "error" ? <FiAlertCircle /> :
                 <FiAlertCircle />}
                <span className="font-medium">{message.text}</span>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default AddVendorForm;