import React, { useState } from 'react';
import { 
  Users,
  UserPlus,
  Search,
  Filter,
  Edit,
  Trash2,
  Lock,
  Unlock,
  Mail,
  Phone,
  Shield,
  CheckCircle,
  XCircle,
  Clock,
  MoreVertical,
  Eye
} from 'lucide-react';

const UserManagement = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddUser, setShowAddUser] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const [newUser, setNewUser] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: 'loan_officer',
    status: 'active'
  });

  const users = [
    {
      id: 1,
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@cashub.na',
      phone: '+264811234567',
      role: 'admin',
      status: 'active',
      lastLogin: '2024-01-22 14:30',
      createdAt: '2023-01-15',
      loansProcessed: 234,
      permissions: ['all']
    },
    {
      id: 2,
      firstName: 'Sarah',
      lastName: 'Johnson',
      email: 'sarah.j@cashub.na',
      phone: '+264812345678',
      role: 'loan_officer',
      status: 'active',
      lastLogin: '2024-01-22 11:20',
      createdAt: '2023-03-20',
      loansProcessed: 156,
      permissions: ['view_loans', 'create_loans', 'process_payments']
    },
    {
      id: 3,
      firstName: 'Michael',
      lastName: 'Chen',
      email: 'michael.c@cashub.na',
      phone: '+264813456789',
      role: 'manager',
      status: 'active',
      lastLogin: '2024-01-21 16:45',
      createdAt: '2023-02-10',
      loansProcessed: 89,
      permissions: ['view_loans', 'approve_loans', 'view_reports', 'manage_users']
    },
    {
      id: 4,
      firstName: 'Emma',
      lastName: 'Williams',
      email: 'emma.w@cashub.na',
      phone: '+264814567890',
      role: 'loan_officer',
      status: 'inactive',
      lastLogin: '2024-01-15 09:12',
      createdAt: '2023-06-05',
      loansProcessed: 67,
      permissions: ['view_loans', 'create_loans']
    },
    {
      id: 5,
      firstName: 'David',
      lastName: 'Martinez',
      email: 'david.m@cashub.na',
      phone: '+264815678901',
      role: 'accountant',
      status: 'active',
      lastLogin: '2024-01-22 13:15',
      createdAt: '2023-04-18',
      loansProcessed: 0,
      permissions: ['view_reports', 'view_payments', 'export_data']
    }
  ];

  const roles = [
    { value: 'admin', label: 'Administrator', color: 'from-red-500 to-pink-500' },
    { value: 'manager', label: 'Manager', color: 'from-purple-500 to-pink-500' },
    { value: 'loan_officer', label: 'Loan Officer', color: 'from-blue-500 to-cyan-500' },
    { value: 'accountant', label: 'Accountant', color: 'from-green-500 to-emerald-500' },
    { value: 'viewer', label: 'Viewer', color: 'from-gray-500 to-gray-600' }
  ];

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getStatusColor = (status) => {
    const colors = {
      active: 'bg-green-500/20 text-green-300 border-green-500/30',
      inactive: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
      suspended: 'bg-red-500/20 text-red-300 border-red-500/30'
    };
    return colors[status] || 'bg-gray-500/20 text-gray-300 border-gray-500/30';
  };

  const getRoleColor = (role) => {
    const roleObj = roles.find(r => r.value === role);
    return roleObj ? roleObj.color : 'from-gray-500 to-gray-600';
  };

  const handleAddUser = () => {
    console.log('Adding user:', newUser);
    setShowAddUser(false);
    setNewUser({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      role: 'loan_officer',
      status: 'active'
    });
  };

  const stats = [
    { label: 'Total Users', value: users.length, icon: Users, color: 'from-blue-500 to-cyan-500' },
    { label: 'Active', value: users.filter(u => u.status === 'active').length, icon: CheckCircle, color: 'from-green-500 to-emerald-500' },
    { label: 'Inactive', value: users.filter(u => u.status === 'inactive').length, icon: XCircle, color: 'from-gray-500 to-gray-600' },
    { label: 'Administrators', value: users.filter(u => u.role === 'admin').length, icon: Shield, color: 'from-purple-500 to-pink-500' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">User Management</h1>
              <p className="text-purple-200">Manage system users and permissions</p>
            </div>
            <button 
              onClick={() => setShowAddUser(true)}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg text-white font-medium transition-all hover:scale-105 flex items-center gap-2 shadow-lg"
            >
              <UserPlus size={20} />
              Add User
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, idx) => (
            <div key={idx} className="bg-white/10 backdrop-blur-lg rounded-xl shadow-xl border border-white/20 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg bg-gradient-to-br ${stat.color}`}>
                  <stat.icon className="text-white" size={24} />
                </div>
              </div>
              <h3 className="text-3xl font-bold text-white mb-1">{stat.value}</h3>
              <p className="text-purple-200 text-sm">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl shadow-xl border border-white/20 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-300" size={20} />
              <input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-purple-300 focus:ring-2 focus:ring-purple-400"
              />
            </div>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-purple-400"
            >
              <option value="all" className="bg-slate-800">All Roles</option>
              {roles.map(role => (
                <option key={role.value} value={role.value} className="bg-slate-800">
                  {role.label}
                </option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-purple-400"
            >
              <option value="all" className="bg-slate-800">All Status</option>
              <option value="active" className="bg-slate-800">Active</option>
              <option value="inactive" className="bg-slate-800">Inactive</option>
              <option value="suspended" className="bg-slate-800">Suspended</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl shadow-xl border border-white/20 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5 border-b border-white/10">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-purple-200 uppercase tracking-wider">User</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-purple-200 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-purple-200 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-purple-200 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-purple-200 uppercase tracking-wider">Last Login</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-purple-200 uppercase tracking-wider">Loans</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-purple-200 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getRoleColor(user.role)} flex items-center justify-center text-white font-semibold`}>
                          {user.firstName[0]}{user.lastName[0]}
                        </div>
                        <div>
                          <p className="text-white font-medium">{user.firstName} {user.lastName}</p>
                          <p className="text-purple-200 text-sm">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-purple-200 text-sm">
                          <Mail size={14} />
                          {user.email}
                        </div>
                        <div className="flex items-center gap-2 text-purple-200 text-sm">
                          <Phone size={14} />
                          {user.phone}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 bg-gradient-to-r ${getRoleColor(user.role)} text-white text-xs font-medium rounded-full`}>
                        {roles.find(r => r.value === user.role)?.label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(user.status)}`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-purple-200 text-sm">
                        <Clock size={14} />
                        {user.lastLogin}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-white font-semibold">{user.loansProcessed}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all">
                          <Eye size={16} className="text-purple-300" />
                        </button>
                        <button className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all">
                          <Edit size={16} className="text-purple-300" />
                        </button>
                        <button className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all">
                          {user.status === 'active' ? (
                            <Lock size={16} className="text-purple-300" />
                          ) : (
                            <Unlock size={16} className="text-purple-300" />
                          )}
                        </button>
                        <button className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-all">
                          <Trash2 size={16} className="text-red-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add User Modal */}
        {showAddUser && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gradient-to-br from-slate-900 to-purple-900 rounded-xl shadow-2xl border border-white/20 p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">Add New User</h2>
                  <p className="text-purple-200">Create a new user account</p>
                </div>
                <button
                  onClick={() => setShowAddUser(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-all"
                >
                  <XCircle className="text-purple-300" size={24} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-purple-200 mb-2">
                      First Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={newUser.firstName}
                      onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-purple-300 focus:ring-2 focus:ring-purple-400"
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-purple-200 mb-2">
                      Last Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={newUser.lastName}
                      onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-purple-300 focus:ring-2 focus:ring-purple-400"
                      placeholder="Doe"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-purple-200 mb-2">
                    Email Address <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-300" size={20} />
                    <input
                      type="email"
                      value={newUser.email}
                      onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-purple-300 focus:ring-2 focus:ring-purple-400"
                      placeholder="john.doe@cashub.na"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-purple-200 mb-2">
                    Phone Number <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-300" size={20} />
                    <input
                      type="tel"
                      value={newUser.phone}
                      onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-purple-300 focus:ring-2 focus:ring-purple-400"
                      placeholder="+264811234567"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-purple-200 mb-2">
                    Role <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-purple-400"
                  >
                    {roles.map(role => (
                      <option key={role.value} value={role.value} className="bg-slate-800">
                        {role.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                  <p className="text-blue-200 text-sm">
                    A temporary password will be generated and sent to the user's email address. 
                    The user will be required to change it on first login.
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowAddUser(false)}
                    className="flex-1 px-4 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white font-medium transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddUser}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg text-white font-medium transition-all shadow-lg flex items-center justify-center gap-2"
                  >
                    <UserPlus size={18} />
                    Add User
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

export default UserManagement;