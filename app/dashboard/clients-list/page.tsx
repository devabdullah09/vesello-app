"use client";
import { useState, useEffect } from "react";
import { useAuth } from '@/components/supabase-auth-provider';
import { supabase } from '@/lib/supabase';

interface Client {
  id: string;
  email: string;
  display_name: string;
  role: string;
  event_id?: string;
  created_at: string;
  last_login: string;
  status: 'active' | 'inactive' | 'suspended';
}

export default function ClientsListPage() {
  const { userProfile } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  // Form state for adding/editing clients
  const [formData, setFormData] = useState({
    email: "",
    display_name: "",
    role: "organizer",
    event_id: "",
    status: "active"
  });

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      setLoading(true);
      console.log('Fetching clients...');
      
      // Get the session token from Supabase
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token || ''
      
      console.log('Fetching clients with token:', token ? 'present' : 'missing')
      
      const response = await fetch('/api/dashboard/clients', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to fetch clients: ${response.status}`)
      }

      const result = await response.json();
      setClients(result.data || []);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const getClientStatus = (lastLogin: string): 'active' | 'inactive' | 'suspended' => {
    const lastLoginDate = new Date(lastLogin);
    const daysSinceLogin = (Date.now() - lastLoginDate.getTime()) / (1000 * 60 * 60 * 24);
    
    if (daysSinceLogin <= 7) return 'active';
    if (daysSinceLogin <= 30) return 'inactive';
    return 'suspended';
  };

  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('user_profiles')
        .insert([{
          email: formData.email,
          display_name: formData.display_name,
          role: formData.role,
          event_id: formData.event_id || null,
          created_at: new Date().toISOString(),
          last_login: new Date().toISOString()
        }]);

      if (error) throw error;

      setShowAddModal(false);
      setFormData({ email: "", display_name: "", role: "organizer", event_id: "", status: "active" });
      fetchClients();
    } catch (error) {
      console.error('Error adding client:', error);
    }
  };

  const handleEditClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClient) return;

    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          email: formData.email,
          display_name: formData.display_name,
          role: formData.role,
          event_id: formData.event_id || null
        })
        .eq('id', editingClient.id);

      if (error) throw error;

      setEditingClient(null);
      setFormData({ email: "", display_name: "", role: "organizer", event_id: "", status: "active" });
      fetchClients();
    } catch (error) {
      console.error('Error updating client:', error);
    }
  };

  const handleDeleteClient = async (clientId: string) => {
    if (!confirm('Are you sure you want to delete this client?')) return;

    try {
      const { error } = await supabase
        .from('user_profiles')
        .delete()
        .eq('id', clientId);

      if (error) throw error;

      fetchClients();
    } catch (error) {
      console.error('Error deleting client:', error);
    }
  };

  const openEditModal = (client: Client) => {
    setEditingClient(client);
    setFormData({
      email: client.email,
      display_name: client.display_name,
      role: client.role,
      event_id: client.event_id || "",
      status: client.status
    });
  };

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.display_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === "all" || client.role === filterRole;
    const matchesStatus = filterStatus === "all" || client.status === filterStatus;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'inactive': return 'text-yellow-600 bg-yellow-100';
      case 'suspended': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'superadmin': return 'text-purple-600 bg-purple-100';
      case 'organizer': return 'text-blue-600 bg-blue-100';
      case 'guest': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C18037] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading clients...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-black">CLIENTS LIST</h1>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-gradient-to-r from-[#E5B574] via-[#D59C58] to-[#C18037] text-white font-semibold px-6 py-2 rounded-md shadow-md hover:from-[#D59C58] hover:to-[#E5B574] transition-colors"
        >
          Add Client
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <input 
          className="border rounded px-3 py-2" 
          placeholder="Search by email or name..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select 
          className="border rounded px-3 py-2"
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
        >
          <option value="all">All Roles</option>
          <option value="superadmin">Super Admin</option>
          <option value="organizer">Organizer</option>
          <option value="guest">Guest</option>
        </select>
        <select 
          className="border rounded px-3 py-2"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="suspended">Suspended</option>
        </select>
        <button 
          onClick={() => {
            setSearchTerm("");
            setFilterRole("all");
            setFilterStatus("all");
          }}
          className="bg-gray-400 text-white px-6 py-2 rounded hover:bg-gray-500 transition-colors"
        >
          Clear Filters
        </button>
      </div>

      {/* Clients Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Login</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredClients.map((client) => (
                <tr key={client.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{client.display_name || 'N/A'}</div>
                      <div className="text-sm text-gray-500">{client.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(client.role)}`}>
                      {client.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {client.event_id || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(client.status)}`}>
                      {client.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(client.last_login).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => openEditModal(client)}
                        className="text-[#C18037] hover:text-[#E5B574] transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteClient(client.id)}
                        className="text-red-600 hover:text-red-800 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {(showAddModal || editingClient) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editingClient ? 'Edit Client' : 'Add New Client'}
            </h2>
            <form onSubmit={editingClient ? handleEditClient : handleAddClient}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    className="w-full border rounded px-3 py-2"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
                  <input
                    type="text"
                    required
                    className="w-full border rounded px-3 py-2"
                    value={formData.display_name}
                    onChange={(e) => setFormData({...formData, display_name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <select
                    className="w-full border rounded px-3 py-2"
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                  >
                    <option value="organizer">Organizer</option>
                    <option value="guest">Guest</option>
                    {userProfile?.role === 'superadmin' && (
                      <option value="superadmin">Super Admin</option>
                    )}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Event ID (Optional)</label>
                  <input
                    type="text"
                    className="w-full border rounded px-3 py-2"
                    value={formData.event_id}
                    onChange={(e) => setFormData({...formData, event_id: e.target.value})}
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingClient(null);
                    setFormData({ email: "", display_name: "", role: "organizer", event_id: "", status: "active" });
                  }}
                  className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-[#E5B574] via-[#D59C58] to-[#C18037] text-white rounded hover:from-[#D59C58] hover:to-[#E5B574] transition-colors"
                >
                  {editingClient ? 'Update' : 'Add'} Client
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
