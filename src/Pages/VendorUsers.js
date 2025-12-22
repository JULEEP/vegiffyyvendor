import React, { useState, useEffect } from 'react';
import { 
  FiUsers, 
  FiSearch, 
  FiEye, 
  FiCalendar,
  FiPhone,
  FiMail,
  FiMapPin,
  FiUser,
  FiX
} from 'react-icons/fi';

const VendorUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const vendorId = localStorage.getItem('vendorId');
      if (!vendorId) {
        console.error('Vendor ID not found');
        return;
      }

      const response = await fetch(`https://api.vegiffyy.com/api/vendor/allusers/${vendorId}`);
      const result = await response.json();

      if (result.message === "Users found successfully") {
        setUsers(result.data || []);
      } else {
        console.error('Failed to fetch users:', result.message);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  // Format user data based on API response structure
  const formatUserData = (user) => {
    return {
      _id: user._id,
      fullName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'N/A',
      email: user.email || 'No email',
      mobileNumber: user.phoneNumber || 'N/A',
      city: user.addresses && user.addresses.length > 0 ? user.addresses[0].city : 'N/A',
      joinDate: user.createdAt,
      status: user.isVerified ? 'verified' : 'pending',
      referralCode: user.referralCode || 'N/A'
    };
  };

  const filteredUsers = users
    .map(formatUserData)
    .filter(user =>
      user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.mobileNumber?.includes(searchTerm) ||
      user.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.referralCode?.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const openUserDetails = (user) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  const closeUserDetails = () => {
    setSelectedUser(null);
    setShowUserModal(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading users data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
              <div className="p-3 bg-blue-100 rounded-lg">
                <FiUsers className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Restaurant Customers</h1>
                <p className="text-gray-600">Users who ordered from your restaurant</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-blue-600">{filteredUsers.length}</p>
              <p className="text-sm text-gray-600">Total Customers</p>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search customers by name, email, mobile, city or referral code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <FiUsers className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No customers found</h3>
              <p className="text-gray-500">
                {searchTerm ? 'No customers match your search' : 'No customers have ordered from your restaurant yet'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer Details
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Join Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Referral Code
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <FiUser className="w-5 h-5 text-blue-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.fullName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 flex items-center">
                          <FiPhone className="w-4 h-4 mr-2 text-gray-400" />
                          {user.mobileNumber}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 flex items-center">
                          <FiMapPin className="w-4 h-4 mr-2 text-gray-400" />
                          {user.city}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 flex items-center">
                          <FiCalendar className="w-4 h-4 mr-2 text-gray-400" />
                          {user.joinDate ? new Date(user.joinDate).toLocaleDateString('en-IN') : 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 font-mono">
                          {user.referralCode}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.status === 'verified' 
                            ? 'bg-green-100 text-green-800'
                            : user.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => openUserDetails(user)}
                          className="flex items-center space-x-1 text-blue-600 hover:text-blue-900 transition-colors"
                        >
                          <FiEye className="w-4 h-4" />
                          <span>View</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* User Details Modal */}
        {showUserModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Customer Details</h3>
                  <button
                    onClick={closeUserDetails}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <FiX className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0 h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <FiUser className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">
                        {selectedUser.fullName}
                      </h4>
                      <p className="text-gray-600">{selectedUser.email}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex items-center space-x-3 p-3 bg-white border rounded-lg">
                      <FiPhone className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Mobile Number</p>
                        <p className="font-medium text-gray-900">
                          {selectedUser.mobileNumber}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 p-3 bg-white border rounded-lg">
                      <FiMail className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-medium text-gray-900">
                          {selectedUser.email}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 p-3 bg-white border rounded-lg">
                      <FiMapPin className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Location</p>
                        <p className="font-medium text-gray-900">
                          {selectedUser.city}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 p-3 bg-white border rounded-lg">
                      <FiCalendar className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Join Date</p>
                        <p className="font-medium text-gray-900">
                          {selectedUser.joinDate ? new Date(selectedUser.joinDate).toLocaleDateString('en-IN') : 'N/A'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 p-3 bg-white border rounded-lg">
                      <FiUser className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Referral Code</p>
                        <p className="font-medium text-gray-900 font-mono">
                          {selectedUser.referralCode}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 p-3 bg-white border rounded-lg">
                      <FiUser className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Status</p>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          selectedUser.status === 'verified' 
                            ? 'bg-green-100 text-green-800'
                            : selectedUser.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {selectedUser.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    onClick={closeUserDetails}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Close
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

export default VendorUsers;