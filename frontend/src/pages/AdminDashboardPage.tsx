import React, { useEffect, useState } from 'react';
import { adminService } from '../services/adminService';
import { AdminStats, User, AIModelStatus, RecyclingCenter } from '../types';
import { 
  ShieldCheck, 
  Users, 
  Cpu, 
  MapPin, 
  FileText, 
  RefreshCw, 
  Sliders, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Activity 
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'model' | 'centers' | 'logs'>('overview');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [usersList, setUsersList] = useState<User[]>([]);
  const [modelStatus, setModelStatus] = useState<AIModelStatus | null>(null);
  const [threshold, setThreshold] = useState<number>(0.60);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // New center form state
  const [newCenterName, setNewCenterName] = useState('');
  const [newCenterAddress, setNewCenterAddress] = useState('');
  const [newCenterCity, setNewCenterCity] = useState('');
  const [newCenterLat, setNewCenterLat] = useState('17.3850');
  const [newCenterLng, setNewCenterLng] = useState('78.4867');
  const [newCenterHours, setNewCenterHours] = useState('Mon-Sat: 09:00 - 18:00');
  const [newCenterMaterials, setNewCenterMaterials] = useState<string[]>(['Plastic', 'Glass']);

  const loadAllAdminData = async () => {
    setIsLoading(true);
    try {
      const [s, u, m, l] = await Promise.all([
        adminService.getStats(),
        adminService.getUsers(100),
        adminService.getModelStatus(),
        adminService.getAuditLogs(30)
      ]);
      setStats(s);
      setUsersList(u);
      setModelStatus(m);
      setThreshold(m.confidence_threshold);
      setAuditLogs(l);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAllAdminData();
  }, []);

  const handleUpdateRole = async (userId: number, currentRole: 'USER' | 'ADMIN') => {
    const nextRole = currentRole === 'USER' ? 'ADMIN' : 'USER';
    try {
      const updated = await adminService.updateUserRole(userId, nextRole);
      setUsersList((prev) => prev.map((u) => (u.id === userId ? updated : u)));
      setActionMsg({ text: `User role updated to ${nextRole}`, type: 'success' });
    } catch (err: any) {
      setActionMsg({ text: err.response?.data?.detail || 'Failed to update user role', type: 'error' });
    }
  };

  const handleToggleUserStatus = async (userId: number, currentStatus: boolean) => {
    try {
      const updated = await adminService.toggleUserStatus(userId, !currentStatus);
      setUsersList((prev) => prev.map((u) => (u.id === userId ? updated : u)));
      setActionMsg({ text: `User account ${!currentStatus ? 'activated' : 'deactivated'}`, type: 'success' });
    } catch (err: any) {
      setActionMsg({ text: err.response?.data?.detail || 'Failed to toggle status', type: 'error' });
    }
  };

  const handleSaveThreshold = async () => {
    try {
      await adminService.updateThreshold(threshold);
      setActionMsg({ text: `AI confidence threshold successfully updated to ${threshold}`, type: 'success' });
      const m = await adminService.getModelStatus();
      setModelStatus(m);
    } catch (err: any) {
      setActionMsg({ text: err.response?.data?.detail || 'Failed to update threshold', type: 'error' });
    }
  };

  const handleTriggerRetrain = async () => {
    try {
      const res = await adminService.triggerRetrain();
      setActionMsg({ text: `${res.message} (Calibrated with ${res.dataset_size} verified feedback samples)`, type: 'success' });
      const logs = await adminService.getAuditLogs(30);
      setAuditLogs(logs);
    } catch (err: any) {
      setActionMsg({ text: err.response?.data?.detail || 'Failed to trigger model recalibration', type: 'error' });
    }
  };

  const handleCreateCenter = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminService.createCenter({
        name: newCenterName,
        address: newCenterAddress,
        city: newCenterCity,
        latitude: parseFloat(newCenterLat),
        longitude: parseFloat(newCenterLng),
        operating_hours: newCenterHours,
        accepted_materials: newCenterMaterials,
        is_municipal: true,
        rating: 4.8
      });
      setActionMsg({ text: 'Recycling center depot registered successfully!', type: 'success' });
      setNewCenterName('');
      setNewCenterAddress('');
      setNewCenterCity('');
      await loadAllAdminData();
    } catch (err: any) {
      setActionMsg({ text: err.response?.data?.detail || 'Failed to create recycling center', type: 'error' });
    }
  };

  if (isLoading || !stats) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Loading System Administration...</p>
      </div>
    );
  }

  return (
    <div className="py-8 max-w-7xl mx-auto space-y-8">
      
      {/* Title & Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5" />
            System Administration
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
            WasteWise AI Control Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Monitor platform-wide diversion statistics, manage accounts, and configure the AI model.
          </p>
        </div>

        <button
          onClick={loadAllAdminData}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 shadow-xs self-start sm:self-auto transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh Data
        </button>
      </div>

      {actionMsg && (
        <div className={`p-4 rounded-2xl border text-xs flex items-center justify-between gap-3 ${
          actionMsg.type === 'success'
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
            : 'bg-red-50 border-red-200 text-red-700'
        }`}>
          <div className="flex items-center gap-2">
            {actionMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
            <span>{actionMsg.text}</span>
          </div>
          <button onClick={() => setActionMsg(null)} className="font-bold underline text-[11px]">Dismiss</button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            activeTab === 'overview' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Activity className="w-4 h-4" />
          Platform Overview
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            activeTab === 'users' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          User Management ({usersList.length})
        </button>

        <button
          onClick={() => setActiveTab('model')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            activeTab === 'model' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Cpu className="w-4 h-4" />
          AI Model Management
        </button>

        <button
          onClick={() => setActiveTab('centers')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            activeTab === 'centers' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <MapPin className="w-4 h-4" />
          Register Depot
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            activeTab === 'logs' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FileText className="w-4 h-4" />
          Audit Logs
        </button>
      </div>

      {/* Tab: Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-1">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Registered Users</p>
              <p className="text-3xl font-black text-slate-900">{stats.total_users}</p>
              <p className="text-[11px] text-slate-500 font-medium">Platform community members</p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-1">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Scans</p>
              <p className="text-3xl font-black text-slate-900">{stats.total_scans}</p>
              <p className="text-[11px] text-slate-500 font-medium">{stats.total_recycled_items} items diverted</p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-1">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Diverted Waste</p>
              <p className="text-3xl font-black text-emerald-600">{stats.total_diverted_kg} kg</p>
              <p className="text-[11px] text-slate-500 font-medium">{stats.total_carbon_saved_kg} kg CO2e saved</p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-1">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Recycling Depots</p>
              <p className="text-3xl font-black text-indigo-600">{stats.total_recycling_centers}</p>
              <p className="text-[11px] text-slate-500 font-medium">OpenStreetMap listed facilities</p>
            </div>
          </div>

          {/* Top Waste Streams Table */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-black text-base text-slate-900">
              System-Wide Category Breakdown
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-500 uppercase font-bold tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Waste Category</th>
                    <th className="py-3 px-4">Scan Count</th>
                    <th className="py-3 px-4">Recycled Count</th>
                    <th className="py-3 px-4">Proportion</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {stats.top_waste_categories.map((c) => (
                    <tr key={c.category} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-bold text-slate-900">{c.category}</td>
                      <td className="py-3 px-4">{c.count}</td>
                      <td className="py-3 px-4 text-emerald-600 font-bold">{c.recyclable_count}</td>
                      <td className="py-3 px-4">{c.percentage}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Users */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-black text-base text-slate-900">Registered Platform Users</h3>
            <span className="text-xs text-slate-500 font-medium">{usersList.length} total accounts</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 uppercase font-bold tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Score & Tier</th>
                  <th className="py-3 px-4">Scans</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {usersList.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{u.full_name}</div>
                      <div className="text-[11px] text-slate-400">{u.email}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                        u.role === 'ADMIN' ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        u.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${u.is_active ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                        {u.is_active ? 'Active' : 'Deactivated'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-800">{u.sustainability_score} pts</div>
                      <div className="text-[10px] text-slate-500">{u.eco_tier}</div>
                    </td>
                    <td className="py-3 px-4">{u.total_scans_count}</td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => handleUpdateRole(u.id, u.role)}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                      >
                        {u.role === 'ADMIN' ? 'Demote to USER' : 'Promote to ADMIN'}
                      </button>
                      <button
                        onClick={() => handleToggleUserStatus(u.id, u.is_active)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                          u.is_active ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                        }`}
                      >
                        {u.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: AI Model Management */}
      {activeTab === 'model' && modelStatus && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          
          {/* Status Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Engine Status</span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black uppercase bg-emerald-100 text-emerald-800">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  {modelStatus.status}
                </span>
              </div>
              <h3 className="text-xl font-black text-slate-900 mt-2">{modelStatus.model_name}</h3>
              <p className="text-xs text-slate-500 mt-0.5">Version {modelStatus.version} • {modelStatus.architecture}</p>
            </div>

            <div className="space-y-3 pt-2 border-t border-slate-100 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">PyTorch Runtime:</span>
                <span className="font-bold text-slate-800">{modelStatus.is_pytorch_available ? 'Detected (Available)' : 'Fallback (Computer Vision Analyzer Active)'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Custom Weights:</span>
                <span className="font-bold text-slate-800">{modelStatus.custom_weights_loaded ? 'Loaded (.pt checkpoint)' : 'Pre-calibrated Heuristic Features'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Supported Waste Classes:</span>
                <span className="font-bold text-slate-800">{modelStatus.total_classes} Classes</span>
              </div>
            </div>

            {/* Recalibrate / Retrain button */}
            <div className="pt-4 border-t border-slate-100 space-y-2">
              <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">Model Recalibration</p>
              <p className="text-xs text-slate-500">
                Execute re-weighting pipeline across verified user feedback submissions.
              </p>
              <button
                onClick={handleTriggerRetrain}
                className="w-full mt-2 py-3 px-4 rounded-xl font-bold text-xs text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Trigger Model Recalibration
              </button>
            </div>
          </div>

          {/* Threshold Tuning */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
            <div>
              <h3 className="text-lg font-black text-slate-900">Confidence Threshold Tuning</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Set minimum probability score required for automated material sorting classification.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700">Active Threshold:</span>
                <span className="text-base font-black text-indigo-600">{Math.round(threshold * 100)}%</span>
              </div>

              <input
                type="range"
                min="0.20"
                max="0.95"
                step="0.05"
                value={threshold}
                onChange={(e) => setThreshold(parseFloat(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />

              <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
                <span>20% (Permissive)</span>
                <span>60% (Default)</span>
                <span>95% (Strict)</span>
              </div>

              <button
                onClick={handleSaveThreshold}
                className="w-full py-2.5 rounded-xl font-bold text-xs text-white bg-slate-900 hover:bg-slate-800 transition-colors"
              >
                Update Confidence Setting
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-600 space-y-1">
              <p className="font-bold text-slate-800">Supported Waste Classes:</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {modelStatus.supported_categories.map((c) => (
                  <span key={c} className="text-[10px] px-2 py-0.5 rounded bg-white border border-slate-200 font-medium">
                    {c}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Centers */}
      {activeTab === 'centers' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs max-w-2xl mx-auto space-y-6">
          <div>
            <h3 className="font-black text-lg text-slate-900">Register Recycling Depot</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Add a new authorized municipal or certified commercial recycling facility to the map.
            </p>
          </div>

          <form onSubmit={handleCreateCenter} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Facility Name
              </label>
              <input
                type="text"
                required
                value={newCenterName}
                onChange={(e) => setNewCenterName(e.target.value)}
                placeholder="Central Urban Materials Depot"
                className="w-full px-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Street Address
                </label>
                <input
                  type="text"
                  required
                  value={newCenterAddress}
                  onChange={(e) => setNewCenterAddress(e.target.value)}
                  placeholder="24 Circular Way"
                  className="w-full px-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  City
                </label>
                <input
                  type="text"
                  required
                  value={newCenterCity}
                  onChange={(e) => setNewCenterCity(e.target.value)}
                  placeholder="Metropolis"
                  className="w-full px-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Latitude
                </label>
                <input
                  type="text"
                  required
                  value={newCenterLat}
                  onChange={(e) => setNewCenterLat(e.target.value)}
                  placeholder="17.3850"
                  className="w-full px-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Longitude
                </label>
                <input
                  type="text"
                  required
                  value={newCenterLng}
                  onChange={(e) => setNewCenterLng(e.target.value)}
                  placeholder="78.4867"
                  className="w-full px-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Operating Hours
              </label>
              <input
                type="text"
                required
                value={newCenterHours}
                onChange={(e) => setNewCenterHours(e.target.value)}
                placeholder="Mon-Sat: 08:00 - 18:00"
                className="w-full px-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl font-bold text-xs text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-sm"
            >
              Register Facility
            </button>
          </form>
        </div>
      )}

      {/* Tab: Audit Logs */}
      {activeTab === 'logs' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-black text-base text-slate-900">System & AI Event Audit Logs</h3>
            <span className="text-xs text-slate-500 font-medium">{auditLogs.length} recent events</span>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {auditLogs.map((log) => (
              <div key={log.id} className="p-4 hover:bg-slate-50 flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-800 uppercase text-[10px] px-2 py-0.5 rounded bg-slate-100">
                      {log.action}
                    </span>
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-600 font-medium">{log.model_name} ({log.model_version})</span>
                  </div>
                  <p className="text-slate-600 font-medium">{log.details}</p>
                </div>
                <span className="text-[10px] text-slate-400 whitespace-nowrap">
                  {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
