"use client";
import { useState, useEffect } from "react";
import { useAuth } from '@/components/supabase-auth-provider';

interface Webhook {
  id: string;
  name: string;
  url: string;
  events: string[];
  status: 'active' | 'inactive' | 'error';
  secret: string;
  created_at: string;
  last_triggered?: string;
  success_count: number;
  failure_count: number;
  description?: string;
  headers?: Record<string, string>;
}

interface WebhookLog {
  id: string;
  webhook_id: string;
  event: string;
  status: 'success' | 'failed';
  response_code: number;
  response_time: number;
  triggered_at: string;
  error_message?: string;
}

export default function WebhooksListPage() {
  const { userProfile } = useAuth();
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [webhookLogs, setWebhookLogs] = useState<WebhookLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingWebhook, setEditingWebhook] = useState<Webhook | null>(null);
  const [selectedWebhook, setSelectedWebhook] = useState<Webhook | null>(null);
  const [showLogs, setShowLogs] = useState(false);

  // Form state for adding/editing webhooks
  const [formData, setFormData] = useState({
    name: "",
    url: "",
    events: [] as string[],
    status: "active",
    secret: "",
    description: "",
    headers: ""
  });

  // Available webhook events
  const availableEvents = [
    'event.created',
    'event.updated',
    'event.deleted',
    'rsvp.submitted',
    'rsvp.updated',
    'rsvp.cancelled',
    'gallery.photo.uploaded',
    'gallery.photo.deleted',
    'gallery.album.created',
    'gallery.album.updated',
    'user.registered',
    'user.login',
    'user.logout',
    'payment.completed',
    'payment.failed',
    'notification.sent',
    'system.maintenance'
  ];

  // Mock data for demonstration
  const mockWebhooks: Webhook[] = [
    {
      id: "1",
      name: "RSVP Notifications",
      url: "https://api.example.com/webhooks/rsvp",
      events: ["rsvp.submitted", "rsvp.updated", "rsvp.cancelled"],
      status: "active",
      secret: "whsec_1234567890abcdef",
      created_at: "2024-01-10T10:00:00Z",
      last_triggered: "2024-01-15T14:30:00Z",
      success_count: 45,
      failure_count: 2,
      description: "Sends notifications when guests submit RSVPs",
      headers: { "Authorization": "Bearer token123", "Content-Type": "application/json" }
    },
    {
      id: "2",
      name: "Gallery Updates",
      url: "https://api.example.com/webhooks/gallery",
      events: ["gallery.photo.uploaded", "gallery.photo.deleted", "gallery.album.created"],
      status: "active",
      secret: "whsec_abcdef1234567890",
      created_at: "2024-01-08T09:00:00Z",
      last_triggered: "2024-01-15T16:45:00Z",
      success_count: 128,
      failure_count: 1,
      description: "Notifies when photos are uploaded or deleted",
      headers: { "X-API-Key": "key456" }
    },
    {
      id: "3",
      name: "Event Management",
      url: "https://api.example.com/webhooks/events",
      events: ["event.created", "event.updated", "event.deleted"],
      status: "error",
      secret: "whsec_9876543210fedcba",
      created_at: "2024-01-05T11:30:00Z",
      last_triggered: "2024-01-12T08:15:00Z",
      success_count: 12,
      failure_count: 8,
      description: "Handles event lifecycle changes",
      headers: {}
    },
    {
      id: "4",
      name: "Analytics Tracking",
      url: "https://analytics.example.com/webhook",
      events: ["user.login", "user.logout", "payment.completed"],
      status: "inactive",
      secret: "whsec_fedcba0987654321",
      created_at: "2024-01-03T15:20:00Z",
      last_triggered: "2024-01-10T12:00:00Z",
      success_count: 89,
      failure_count: 3,
      description: "Tracks user activity and payments for analytics",
      headers: { "X-Analytics-Source": "vesello" }
    }
  ];

  const mockLogs: WebhookLog[] = [
    {
      id: "1",
      webhook_id: "1",
      event: "rsvp.submitted",
      status: "success",
      response_code: 200,
      response_time: 245,
      triggered_at: "2024-01-15T14:30:00Z"
    },
    {
      id: "2",
      webhook_id: "1",
      event: "rsvp.updated",
      status: "success",
      response_code: 200,
      response_time: 189,
      triggered_at: "2024-01-15T13:45:00Z"
    },
    {
      id: "3",
      webhook_id: "3",
      event: "event.updated",
      status: "failed",
      response_code: 500,
      response_time: 5000,
      triggered_at: "2024-01-12T08:15:00Z",
      error_message: "Connection timeout"
    }
  ];

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setWebhooks(mockWebhooks);
      setWebhookLogs(mockLogs);
      setLoading(false);
    }, 1000);
  }, []);

  const handleAddWebhook = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newWebhook: Webhook = {
      id: Date.now().toString(),
      name: formData.name,
      url: formData.url,
      events: formData.events,
      status: formData.status as Webhook['status'],
      secret: formData.secret || generateSecret(),
      created_at: new Date().toISOString(),
      success_count: 0,
      failure_count: 0,
      description: formData.description,
      headers: parseHeaders(formData.headers)
    };

    setWebhooks([newWebhook, ...webhooks]);
    setShowAddModal(false);
    resetForm();
  };

  const handleEditWebhook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingWebhook) return;

    const updatedWebhook: Webhook = {
      ...editingWebhook,
      name: formData.name,
      url: formData.url,
      events: formData.events,
      status: formData.status as Webhook['status'],
      secret: formData.secret,
      description: formData.description,
      headers: parseHeaders(formData.headers)
    };

    setWebhooks(webhooks.map(w => w.id === editingWebhook.id ? updatedWebhook : w));
    setEditingWebhook(null);
    resetForm();
  };

  const handleDeleteWebhook = async (webhookId: string) => {
    if (!confirm('Are you sure you want to delete this webhook?')) return;
    setWebhooks(webhooks.filter(w => w.id !== webhookId));
  };

  const handleToggleStatus = async (webhookId: string, newStatus: Webhook['status']) => {
    setWebhooks(webhooks.map(w => 
      w.id === webhookId ? { ...w, status: newStatus } : w
    ));
  };

  const handleTestWebhook = async (webhook: Webhook) => {
    // Simulate webhook test
    const testLog: WebhookLog = {
      id: Date.now().toString(),
      webhook_id: webhook.id,
      event: "webhook.test",
      status: "success",
      response_code: 200,
      response_time: Math.floor(Math.random() * 500) + 100,
      triggered_at: new Date().toISOString()
    };

    setWebhookLogs([testLog, ...webhookLogs]);
    
    // Update webhook stats
    setWebhooks(webhooks.map(w => 
      w.id === webhook.id 
        ? { 
            ...w, 
            success_count: w.success_count + 1,
            last_triggered: new Date().toISOString()
          } 
        : w
    ));
  };

  const openEditModal = (webhook: Webhook) => {
    setEditingWebhook(webhook);
    setFormData({
      name: webhook.name,
      url: webhook.url,
      events: webhook.events,
      status: webhook.status,
      secret: webhook.secret,
      description: webhook.description || "",
      headers: Object.entries(webhook.headers || {}).map(([key, value]) => `${key}: ${value}`).join('\n')
    });
  };

  const resetForm = () => {
    setFormData({
      name: "",
      url: "",
      events: [],
      status: "active",
      secret: "",
      description: "",
      headers: ""
    });
  };

  const generateSecret = () => {
    return 'whsec_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  };

  const parseHeaders = (headersString: string): Record<string, string> => {
    const headers: Record<string, string> = {};
    if (!headersString.trim()) return headers;
    
    headersString.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split(':');
      if (key && valueParts.length > 0) {
        headers[key.trim()] = valueParts.join(':').trim();
      }
    });
    
    return headers;
  };

  const filteredWebhooks = webhooks.filter(webhook => {
    const matchesSearch = webhook.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         webhook.url.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || webhook.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'inactive': return 'text-gray-600 bg-gray-100';
      case 'error': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getLogStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-100';
      case 'failed': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C18037] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading webhooks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-black">WEBHOOKS LIST</h1>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-gradient-to-r from-[#E5B574] via-[#D59C58] to-[#C18037] text-white font-semibold px-6 py-2 rounded-md shadow-md hover:from-[#D59C58] hover:to-[#E5B574] transition-colors"
        >
          Add Webhook
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <input 
          className="border rounded px-3 py-2" 
          placeholder="Search webhooks..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select 
          className="border rounded px-3 py-2"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="error">Error</option>
        </select>
        <button 
          onClick={() => {
            setSearchTerm("");
            setFilterStatus("all");
          }}
          className="bg-gray-400 text-white px-6 py-2 rounded hover:bg-gray-500 transition-colors"
        >
          Clear Filters
        </button>
      </div>

      {/* Webhooks Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Webhook</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">URL</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Events</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stats</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredWebhooks.map((webhook) => (
                <tr key={webhook.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{webhook.name}</div>
                      {webhook.description && (
                        <div className="text-sm text-gray-500">{webhook.description}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs truncate">{webhook.url}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {webhook.events.length} event{webhook.events.length !== 1 ? 's' : ''}
                    </div>
                    <div className="text-xs text-gray-500">
                      {webhook.events.slice(0, 2).join(', ')}
                      {webhook.events.length > 2 && ` +${webhook.events.length - 2} more`}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(webhook.status)}`}>
                      {webhook.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>✓ {webhook.success_count}</div>
                    <div>✗ {webhook.failure_count}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleTestWebhook(webhook)}
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        Test
                      </button>
                      <button
                        onClick={() => {
                          setSelectedWebhook(webhook);
                          setShowLogs(true);
                        }}
                        className="text-purple-600 hover:text-purple-800 transition-colors"
                      >
                        Logs
                      </button>
                      <button
                        onClick={() => openEditModal(webhook)}
                        className="text-[#C18037] hover:text-[#E5B574] transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteWebhook(webhook.id)}
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
      {(showAddModal || editingWebhook) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editingWebhook ? 'Edit Webhook' : 'Add New Webhook'}
            </h2>
            <form onSubmit={editingWebhook ? handleEditWebhook : handleAddWebhook}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Webhook Name</label>
                  <input
                    type="text"
                    required
                    className="w-full border rounded px-3 py-2"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Webhook URL</label>
                  <input
                    type="url"
                    required
                    className="w-full border rounded px-3 py-2"
                    value={formData.url}
                    onChange={(e) => setFormData({...formData, url: e.target.value})}
                    placeholder="https://api.example.com/webhook"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Events to Subscribe</label>
                  <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto border rounded p-3">
                    {availableEvents.map(event => (
                      <label key={event} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.events.includes(event)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({...formData, events: [...formData.events, event]});
                            } else {
                              setFormData({...formData, events: formData.events.filter(ev => ev !== event)});
                            }
                          }}
                          className="rounded"
                        />
                        <span className="text-sm text-gray-700">{event}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      className="w-full border rounded px-3 py-2"
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value})}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Secret (optional)</label>
                    <input
                      type="text"
                      className="w-full border rounded px-3 py-2"
                      value={formData.secret}
                      onChange={(e) => setFormData({...formData, secret: e.target.value})}
                      placeholder="Auto-generated if empty"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    rows={2}
                    className="w-full border rounded px-3 py-2"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Custom Headers (one per line, format: Key: Value)</label>
                  <textarea
                    rows={3}
                    className="w-full border rounded px-3 py-2"
                    value={formData.headers}
                    onChange={(e) => setFormData({...formData, headers: e.target.value})}
                    placeholder="Authorization: Bearer token123&#10;Content-Type: application/json"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingWebhook(null);
                    resetForm();
                  }}
                  className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-[#E5B574] via-[#D59C58] to-[#C18037] text-white rounded hover:from-[#D59C58] hover:to-[#E5B574] transition-colors"
                >
                  {editingWebhook ? 'Update' : 'Add'} Webhook
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Webhook Logs Modal */}
      {showLogs && selectedWebhook && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Webhook Logs - {selectedWebhook.name}</h2>
              <button
                onClick={() => setShowLogs(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Response Code</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Response Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Triggered At</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Error</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {webhookLogs
                    .filter(log => log.webhook_id === selectedWebhook.id)
                    .map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{log.event}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getLogStatusColor(log.status)}`}>
                          {log.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{log.response_code}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{log.response_time}ms</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(log.triggered_at).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {log.error_message || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
