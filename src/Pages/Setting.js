import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FiUploadCloud } from "react-icons/fi"; // add this at the top

const Settings = ({ closeModal }) => {
  const navigate = useNavigate();
  const [vendorId, setVendorId] = useState(null);

  // Vendor profile fields
  const [restaurantName, setRestaurantName] = useState("");
  const [description, setDescription] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [locationName, setLocationName] = useState("");
  const [startingPrice, setStartingPrice] = useState("");
  const [rating, setRating] = useState(""); // Read-only
  const [location, setLocation] = useState({ lat: "", lng: "" });

  const [profileImage, setProfileImage] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [notifications, setNotifications] = useState(false);

  useEffect(() => {
    const storedVendorId = localStorage.getItem("vendorId");
    if (!storedVendorId) {
      alert("Vendor ID not found. Please login again.");
      navigate("/login");
      return;
    }
    setVendorId(storedVendorId);

    axios
      .get(`http://31.97.206.144:5051/api/vendor/vendorprofile/${storedVendorId}`)
      .then((res) => {
        const vendor = res.data.vendor;
        setRestaurantName(vendor.restaurantName || "");
        setDescription(vendor.description || "");
        setEmail(vendor.email || "");
        setMobile(vendor.mobile || "");
        setLocationName(vendor.locationName || "");
        setStartingPrice(vendor.startingPrice || "");
        setRating(vendor.rating || "");

        if (vendor.location?.coordinates?.length === 2) {
          setLocation({
            lat: vendor.location.coordinates[0],
            lng: vendor.location.coordinates[1],
          });
        }

        if (vendor.image?.url) {
          setProfileImage(vendor.image.url);
        }
      })
      .catch((err) => {
        console.error("Error fetching vendor profile:", err);
        alert("Failed to fetch vendor profile");
      });
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!vendorId) return;

    const formData = new FormData();
    formData.append("restaurantName", restaurantName);
    formData.append("description", description);
    formData.append("email", email);
    formData.append("mobile", mobile);
    formData.append("locationName", locationName);
    formData.append("startingPrice", startingPrice);
    formData.append("latitude", location.lat);
    formData.append("longitude", location.lng);
    formData.append("notifications", notifications);
    if (newPassword) formData.append("new_password", newPassword);
    if (confirmPassword) formData.append("confirm_password", confirmPassword);
    if (profileImage && typeof profileImage !== "string") {
      formData.append("profile_image", profileImage);
    }

    try {
      const response = await axios.put(
        `http://31.97.206.144:5051/api/vendor/update/${vendorId}`,
        formData
      );
      alert("Settings updated successfully");
      closeModal();
    } catch (err) {
      console.error("Update error:", err);
      alert("Failed to update vendor profile");
    }
  };

  const handleProfileImageChange = (e) => {
    setProfileImage(e.target.files[0]);
  };

  return (
    <div className="p-6 bg-white rounded shadow max-w-5xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Vendor Profile Settings</h2>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm">Restaurant Name</label>
            <input
              className="w-full border p-2 rounded"
              value={restaurantName}
              onChange={(e) => setRestaurantName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm">Email</label>
            <input
              className="w-full border p-2 rounded"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm">Mobile</label>
            <input
              className="w-full border p-2 rounded"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm">Location Name</label>
            <input
              className="w-full border p-2 rounded"
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm">Starting Price (₹)</label>
            <input
              type="number"
              className="w-full border p-2 rounded"
              value={startingPrice}
              onChange={(e) => setStartingPrice(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm">Rating</label>
            <input
              className="w-full border p-2 rounded bg-gray-100 cursor-not-allowed"
              value={rating}
              disabled
            />
          </div>

          <div className="col-span-full">
            <label className="block text-sm">Description</label>
            <textarea
              className="w-full border p-2 rounded"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            ></textarea>
          </div>

          <div>
            <label className="block text-sm">Latitude</label>
            <input
              type="number"
              className="w-full border p-2 rounded"
              value={location.lat}
              onChange={(e) =>
                setLocation({ ...location, lat: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-sm">Longitude</label>
            <input
              type="number"
              className="w-full border p-2 rounded"
              value={location.lng}
              onChange={(e) =>
                setLocation({ ...location, lng: e.target.value })
              }
            />
          </div>

          <div>
            {/* Custom upload button */}
            <label
              htmlFor="profileImageInput"
              className="flex items-center gap-2 cursor-pointer bg-blue-100 text-blue-700 px-3 py-2 rounded border border-blue-600 w-fit"
            >
              <FiUploadCloud className="text-xl" />
              Upload Image
            </label>
            <input
              id="profileImageInput"
              type="file"
              accept="image/*"
              onChange={handleProfileImageChange}
              className="hidden"
            />

            {profileImage && typeof profileImage === "string" && (
              <img
                src={profileImage}
                alt="Profile Preview"
                className="mt-2 rounded"
                style={{ height: 80 }}
              />
            )}
            {profileImage && typeof profileImage !== "string" && (
              <img
                src={URL.createObjectURL(profileImage)}
                alt="Preview"
                className="mt-2 rounded"
                style={{ height: 80 }}
              />
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-sm">New Password</label>
            <input
              type="password"
              className="w-full border p-2 rounded"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm">Confirm Password</label>
            <input
              type="password"
              className="w-full border p-2 rounded"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center mt-4">
          <input
            type="checkbox"
            checked={notifications}
            onChange={(e) => setNotifications(e.target.checked)}
            className="mr-2"
          />
          <label className="text-sm">Enable Notifications</label>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button
            type="button"
            onClick={closeModal}
            className="px-4 py-2 text-red-700 bg-red-100 border border-red-600 rounded"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-blue-700 bg-blue-100 border border-blue-600 rounded"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
};

export default Settings;
