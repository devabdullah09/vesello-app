"use client";
import { useState, useEffect } from "react";
import { useAuth } from '@/components/supabase-auth-provider';

interface Module {
  id: string;
  name: string;
  description: string;
  version: string;
  status: 'active' | 'inactive' | 'maintenance';
  category: 'core' | 'feature' | 'integration' | 'analytics';
  dependencies: string[];
  lastUpdated: string;
  author: string;
  settings: Record<string, any>;
}

export default function ModulesListPage() {
  const { userProfile } = useAuth();
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingModule, setEditingModule] = useState<Module | null>(null);

  // Form state for adding/editing modules
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    version: "1.0.0",
    status: "active",
    category: "feature",
    dependencies: "",
    author: "",
    settings: {}
  });

  // Mock data for demonstration
  const mockModules: Module[] = [
    {
      id: "1",
      name: "Wedding Gallery",
      description: "Photo gallery management for wedding events",
      version: "2.1.0",
      status: "active",
      category: "core",
      dependencies: ["Bunny.net Storage", "Image Processing"],
      lastUpdated: "2024-01-15",
      author: "Vesello Team",
      settings: { maxFileSize: "10MB", allowedFormats: ["jpg", "png", "jpeg"] }
    },
    {
      id: "2",
      name: "RSVP Management",
      description: "Guest response and attendance tracking system",
      version: "1.8.2",
      status: "active",
      category: "core",
      dependencies: ["Email Service", "Database"],
      lastUpdated: "2024-01-10",
      author: "Vesello Team",
      settings: { emailNotifications: true, customQuestions: true }
    },
    {
      id: "3",
      name: "Event Timeline",
      description: "Wedding day timeline and schedule management",
      version: "1.5.1",
      status: "active",
      category: "feature",
      dependencies: ["Calendar Integration"],
      lastUpdated: "2024-01-08",
      author: "Vesello Team",
      settings: { timezone: "UTC", reminders: true }
    },
    {
      id: "4",
      name: "Seating Chart",
      description: "Interactive seating arrangement tool",
      version: "1.3.0",
      status: "active",
      category: "feature",
      dependencies: ["Drag & Drop Library"],
      lastUpdated: "2024-01-05",
      author: "Vesello Team",
      settings: { maxTables: 50, dragDrop: true }
    },
    {
      id: "5",
      name: "Analytics Dashboard",
      description: "Event analytics and reporting system",
      version: "1.2.0",
      status: "maintenance",
      category: "analytics",
      dependencies: ["Chart.js", "Data Processing"],
      lastUpdated: "2024-01-12",
      author: "Vesello Team",
      settings: { retentionDays: 365, realTimeUpdates: true }
    },
    {
      id: "6",
      name: "Email Integration",
      description: "Email service integration for notifications",
      version: "2.0.1",
      status: "active",
      category: "integration",
      dependencies: ["SMTP Service"],
      lastUpdated: "2024-01-14",
      author: "Vesello Team",
      settings: { provider: "SendGrid", rateLimit: 100 }
    },
    {
      id: "7",
      name: "QR Code Generator",
      description: "QR code generation for event sharing",
      version: "1.1.0",
      status: "inactive",
      category: "feature",
      dependencies: ["QR Code Library"],
      lastUpdated: "2023-12-20",
      author: "Vesello Team",
      settings: { size: "200x200", format: "png" }
    },
    {
      id: "8",
      name: "Payment Gateway",
      description: "Payment processing for premium features",
      version: "1.0.0",
      status: "maintenance",
      category: "integration",
      dependencies: ["Stripe API", "Security"],
      lastUpdated: "2024-01-18",
      author: "Vesello Team",
      settings: { currency: "USD", testMode: true }
    }
  ];

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setModules(mockModules);
      setLoading(false);
    }, 1000);
  }, []);

  const handleAddModule = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newModule: Module = {
      id: Date.now().toString(),
      name: formData.name,
      description: formData.description,
      version: formData.version,
      status: formData.status as Module['status'],
      category: formData.category as Module['category'],
      dependencies: formData.dependencies.split(',').map(dep => dep.trim()).filter(dep => dep),
      lastUpdated: new Date().toISOString().split('T')[0],
      author: formData.author,
      settings: formData.settings
    };

    setModules([newModule, ...modules]);
    setShowAddModal(false);
    setFormData({
      name: "",
      description: "",
      version: "1.0.0",
      status: "active",
      category: "feature",
      dependencies: "",
      author: "",
      settings: {}
    });
  };

  const handleEditModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingModule) return;

    const updatedModule: Module = {
      ...editingModule,
      name: formData.name,
      description: formData.description,
      version: formData.version,
      status: formData.status as Module['status'],
      category: formData.category as Module['category'],
      dependencies: formData.dependencies.split(',').map(dep => dep.trim()).filter(dep => dep),
      lastUpdated: new Date().toISOString().split('T')[0],
      author: formData.author,
      settings: formData.settings
    };

    setModules(modules.map(m => m.id === editingModule.id ? updatedModule : m));
    setEditingModule(null);
    setFormData({
      name: "",
      description: "",
      version: "1.0.0",
      status: "active",
      category: "feature",
      dependencies: "",
      author: "",
      settings: {}
    });
  };

  const handleDeleteModule = async (moduleId: string) => {
    if (!confirm('Are you sure you want to delete this module?')) return;
    setModules(modules.filter(m => m.id !== moduleId));
  };

  const handleToggleStatus = async (moduleId: string, newStatus: Module['status']) => {
    setModules(modules.map(m => 
      m.id === moduleId ? { ...m, status: newStatus } : m
    ));
  };

  const openEditModal = (module: Module) => {
    setEditingModule(module);
    setFormData({
      name: module.name,
      description: module.description,
      version: module.version,
      status: module.status,
      category: module.category,
      dependencies: module.dependencies.join(', '),
      author: module.author,
      settings: module.settings
    });
  };

  const filteredModules = modules.filter(module => {
    const matchesSearch = module.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         module.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "all" || module.category === filterCategory;
    const matchesStatus = filterStatus === "all" || module.status === filterStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'inactive': return 'text-gray-600 bg-gray-100';
      case 'maintenance': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'core': return 'text-red-600 bg-red-100';
      case 'feature': return 'text-blue-600 bg-blue-100';
      case 'integration': return 'text-purple-600 bg-purple-100';
      case 'analytics': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C18037] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading modules...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-black">MODULES LIST</h1>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-gradient-to-r from-[#E5B574] via-[#D59C58] to-[#C18037] text-white font-semibold px-6 py-2 rounded-md shadow-md hover:from-[#D59C58] hover:to-[#E5B574] transition-colors"
        >
          Add Module
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <input 
          className="border rounded px-3 py-2" 
          placeholder="Search modules..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select 
          className="border rounded px-3 py-2"
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
        >
          <option value="all">All Categories</option>
          <option value="core">Core</option>
          <option value="feature">Feature</option>
          <option value="integration">Integration</option>
          <option value="analytics">Analytics</option>
        </select>
        <select 
          className="border rounded px-3 py-2"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="maintenance">Maintenance</option>
        </select>
        <button 
          onClick={() => {
            setSearchTerm("");
            setFilterCategory("all");
            setFilterStatus("all");
          }}
          className="bg-gray-400 text-white px-6 py-2 rounded hover:bg-gray-500 transition-colors"
        >
          Clear Filters
        </button>
      </div>

      {/* Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredModules.map((module) => (
          <div key={module.id} className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{module.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{module.description}</p>
                <div className="flex items-center space-x-2 mb-2">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(module.status)}`}>
                    {module.status}
                  </span>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(module.category)}`}>
                    {module.category}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">v{module.version}</div>
                <div className="text-xs text-gray-400">{module.lastUpdated}</div>
              </div>
            </div>

            <div className="mb-4">
              <div className="text-sm text-gray-600 mb-1">
                <strong>Author:</strong> {module.author}
              </div>
              {module.dependencies.length > 0 && (
                <div className="text-sm text-gray-600">
                  <strong>Dependencies:</strong> {module.dependencies.join(', ')}
                </div>
              )}
            </div>

            <div className="flex justify-between items-center">
              <div className="flex space-x-2">
                <button
                  onClick={() => openEditModal(module)}
                  className="text-[#C18037] hover:text-[#E5B574] text-sm transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteModule(module.id)}
                  className="text-red-600 hover:text-red-800 text-sm transition-colors"
                >
                  Delete
                </button>
              </div>
              <div className="flex space-x-1">
                <button
                  onClick={() => handleToggleStatus(module.id, module.status === 'active' ? 'inactive' : 'active')}
                  className={`text-xs px-2 py-1 rounded ${
                    module.status === 'active' 
                      ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' 
                      : 'bg-green-100 text-green-600 hover:bg-green-200'
                  }`}
                >
                  {module.status === 'active' ? 'Disable' : 'Enable'}
                </button>
                <button
                  onClick={() => handleToggleStatus(module.id, 'maintenance')}
                  className="text-xs px-2 py-1 rounded bg-yellow-100 text-yellow-600 hover:bg-yellow-200"
                >
                  Maintenance
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      {(showAddModal || editingModule) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editingModule ? 'Edit Module' : 'Add New Module'}
            </h2>
            <form onSubmit={editingModule ? handleEditModule : handleAddModule}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Module Name</label>
                  <input
                    type="text"
                    required
                    className="w-full border rounded px-3 py-2"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    required
                    rows={3}
                    className="w-full border rounded px-3 py-2"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Version</label>
                    <input
                      type="text"
                      required
                      className="w-full border rounded px-3 py-2"
                      value={formData.version}
                      onChange={(e) => setFormData({...formData, version: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      className="w-full border rounded px-3 py-2"
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value})}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="maintenance">Maintenance</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select
                      className="w-full border rounded px-3 py-2"
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                    >
                      <option value="core">Core</option>
                      <option value="feature">Feature</option>
                      <option value="integration">Integration</option>
                      <option value="analytics">Analytics</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Author</label>
                    <input
                      type="text"
                      required
                      className="w-full border rounded px-3 py-2"
                      value={formData.author}
                      onChange={(e) => setFormData({...formData, author: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Dependencies (comma-separated)</label>
                  <input
                    type="text"
                    className="w-full border rounded px-3 py-2"
                    value={formData.dependencies}
                    onChange={(e) => setFormData({...formData, dependencies: e.target.value})}
                    placeholder="e.g., React, Express, MongoDB"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingModule(null);
                    setFormData({
                      name: "",
                      description: "",
                      version: "1.0.0",
                      status: "active",
                      category: "feature",
                      dependencies: "",
                      author: "",
                      settings: {}
                    });
                  }}
                  className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-[#E5B574] via-[#D59C58] to-[#C18037] text-white rounded hover:from-[#D59C58] hover:to-[#E5B574] transition-colors"
                >
                  {editingModule ? 'Update' : 'Add'} Module
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
