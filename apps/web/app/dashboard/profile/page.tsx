'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  User,
  Shield,
  Building2,
  Phone,
  Mail,
  Calendar,
  CheckCircle2,
  Clock,
  Sparkles,
  Camera,
  Upload,
  Trash2,
  Plus,
  Save,
  MapPin,
  Heart,
  Stethoscope,
  Briefcase,
  Award,
  DollarSign,
  AlertCircle,
  Settings,
  Layers,
  Copy,
  Check,
  RefreshCw,
} from 'lucide-react';
import { normalizeRoleCode } from '@medinexa/validation';
import { getAuthenticatedUser, fetchCurrentAuthenticatedUser, updateAuthenticatedProfile } from '@/lib/auth-session';

interface CustomDetailItem {
  id: string;
  label: string;
  value: string;
  category: string;
}

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const PRESET_AVATARS = [
  { id: 'doc_m', label: 'Doctor (Male)', url: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80' },
  { id: 'doc_f', label: 'Doctor (Female)', url: 'https://images.unsplash.com/photo-1594824813583-e18e698ea437?w=150&auto=format&fit=crop&q=80' },
  { id: 'nurse_f', label: 'Staff Nurse', url: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=150&auto=format&fit=crop&q=80' },
  { id: 'admin_m', label: 'Hospital Admin', url: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150&auto=format&fit=crop&q=80' },
  { id: 'staff_m', label: 'Clinical Lead', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80' },
];

export default function DashboardUserProfilePage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'personal' | 'address' | 'professional' | 'custom'>('overview');
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState(false);

  // Profile Picture state
  const [profilePic, setProfilePic] = useState<string>('');

  // Personal Information (Strictly loaded from verified authenticated session)
  const [personalInfo, setPersonalInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    alternatePhone: '',
    dateOfBirth: '',
    gender: '',
    bloodGroup: '',
    maritalStatus: '',
  });

  // Complete Address
  const [addressInfo, setAddressInfo] = useState({
    houseNumber: '',
    street: '',
    landmark: '',
    city: '',
    state: '',
    pinCode: '',
    country: 'India',
  });

  // Emergency Contacts
  const [emergencyInfo, setEmergencyInfo] = useState({
    contactName: '',
    relationship: '',
    phone: '',
    doctorNotes: '',
  });

  // Professional & Clinical Information (Role-specific)
  const [roleCode, setRoleCode] = useState('STAFF');
  const [professionalInfo, setProfessionalInfo] = useState({
    staffId: '',
    designation: '',
    department: '',
    hospitalName: '',
    licenseNumber: '',
    qualifications: '',
    experienceYears: '',
    consultationFee: '',
    shift: '',
    station: '',
    joiningDate: '',
  });

  // Dynamic Custom Details
  const [customFields, setCustomFields] = useState<CustomDetailItem[]>([]);

  // New Custom Detail Form
  const [isAddingCustom, setIsAddingCustom] = useState(false);
  const [newCustomLabel, setNewCustomLabel] = useState('');
  const [newCustomValue, setNewCustomValue] = useState('');
  const [newCustomCategory, setNewCustomCategory] = useState('Personal');

  // Load authoritative authenticated user profile on mount
  useEffect(() => {
    const applyUser = (u: any) => {
      if (!u) return;
      const r = normalizeRoleCode(u.roleCode || u.role?.code || u.role || 'STAFF');
      setRoleCode(r);

      if (u.profilePic || u.avatar) {
        setProfilePic(u.profilePic || u.avatar);
      }

      setPersonalInfo({
        firstName: u.firstName || (u.name ? u.name.split(' ')[0] : ''),
        lastName: u.lastName || (u.name ? u.name.split(' ').slice(1).join(' ') : ''),
        email: u.email || '',
        phone: u.phone || '',
        alternatePhone: u.alternatePhone || '',
        dateOfBirth: u.dateOfBirth || '',
        gender: u.gender || '',
        bloodGroup: u.bloodGroup || '',
        maritalStatus: u.maritalStatus || '',
      });

      if (u.address && typeof u.address === 'object') {
        setAddressInfo((prev) => ({ ...prev, ...u.address }));
      }

      if (u.emergencyContact && typeof u.emergencyContact === 'object') {
        setEmergencyInfo((prev) => ({ ...prev, ...u.emergencyContact }));
      } else if (typeof u.emergencyContact === 'string') {
        try {
          const parsed = JSON.parse(u.emergencyContact);
          setEmergencyInfo((prev) => ({ ...prev, ...parsed }));
        } catch {
          setEmergencyInfo((prev) => ({ ...prev, contactName: u.emergencyContact }));
        }
      }

      setProfessionalInfo({
        staffId: u.staffId || u.id?.slice(0, 8)?.toUpperCase() || 'Not provided',
        designation: u.designation || u.role?.name || r.replace('_', ' '),
        department: u.department || 'Not provided',
        hospitalName: u.facility?.name || u.facilityName || 'MediNexa Healthcare System',
        licenseNumber: u.licenseNumber || u.doctorProfile?.licenseNumber || 'Not provided',
        qualifications: u.qualifications || 'Not provided',
        experienceYears: u.experienceYears || 'Not provided',
        consultationFee: u.consultationFee ? String(u.consultationFee) : 'Not provided',
        shift: u.shift || 'Standard Hospital Shift',
        station: u.station || 'Main Medical Complex',
        joiningDate: u.joiningDate ? new Date(u.joiningDate).toLocaleDateString() : 'Not provided',
      });

      if (Array.isArray(u.customFields) && u.customFields.length > 0) {
        setCustomFields(u.customFields);
      }
    };

    // 1. Initial sync from verified local storage
    const current = getAuthenticatedUser();
    if (current) applyUser(current);

    // 2. Authoritative backend refresh
    fetchCurrentAuthenticatedUser().then((serverUser) => {
      if (serverUser) applyUser(serverUser);
    });

    const onUserUpdated = (e: any) => {
      if (e.detail) applyUser(e.detail);
    };
    window.addEventListener('medinexa:user-updated', onUserUpdated);
    return () => window.removeEventListener('medinexa:user-updated', onUserUpdated);
  }, []);

  // Sync to localStorage
  const syncToStorage = (updatedFields: Record<string, any>) => {
    if (typeof window !== 'undefined') {
      const rawUser = localStorage.getItem('medinexa_user');
      let currentObj: Record<string, any> = {};
      if (rawUser) {
        try {
          currentObj = JSON.parse(rawUser);
        } catch {}
      }

      const merged = {
        ...currentObj,
        ...updatedFields,
        updatedAt: new Date().toISOString(),
      };

      localStorage.setItem('medinexa_user', JSON.stringify(merged));
      window.dispatchEvent(new CustomEvent('medinexa:user-updated', { detail: merged }));
      window.dispatchEvent(new Event('storage'));
    }
  };

  // Handle Photo File Upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setSaveError('Please select a valid image file (PNG, JPG, WebP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setSaveError('Image file size must be less than 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setProfilePic(dataUrl);
      syncToStorage({ profilePic: dataUrl, avatar: dataUrl });
      setSaveSuccess('Profile picture updated successfully!');
      setTimeout(() => setSaveSuccess(null), 3500);
    };
    reader.readAsDataURL(file);
  };

  // Remove Photo
  const handleRemovePhoto = () => {
    setProfilePic('');
    syncToStorage({ profilePic: '', avatar: '' });
    setSaveSuccess('Profile picture removed.');
    setTimeout(() => setSaveSuccess(null), 3000);
  };

  // Select Preset Avatar
  const handleSelectPreset = (url: string) => {
    setProfilePic(url);
    syncToStorage({ profilePic: url, avatar: url });
    setSaveSuccess('Preset avatar applied successfully!');
    setTimeout(() => setSaveSuccess(null), 3500);
  };

  // Add Custom Detail Item
  const handleAddCustomDetail = () => {
    if (!newCustomLabel.trim() || !newCustomValue.trim()) {
      setSaveError('Please fill in both field name and value.');
      setTimeout(() => setSaveError(null), 3000);
      return;
    }

    const newItem: CustomDetailItem = {
      id: `cf_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      label: newCustomLabel.trim(),
      value: newCustomValue.trim(),
      category: newCustomCategory,
    };

    const updated = [...customFields, newItem];
    setCustomFields(updated);
    syncToStorage({ customFields: updated });

    setNewCustomLabel('');
    setNewCustomValue('');
    setIsAddingCustom(false);
    setSaveSuccess(`Custom detail "${newItem.label}" added successfully!`);
    setTimeout(() => setSaveSuccess(null), 3500);
  };

  // Delete Custom Detail Item
  const handleDeleteCustomDetail = (id: string) => {
    const updated = customFields.filter((item) => item.id !== id);
    setCustomFields(updated);
    syncToStorage({ customFields: updated });
    setSaveSuccess('Custom detail removed.');
    setTimeout(() => setSaveSuccess(null), 2500);
  };

  const [isSaving, setIsSaving] = useState(false);

  // Save All Changes through authoritative backend API
  const handleSaveAll = async () => {
    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(null);

    const fullName = `${personalInfo.firstName} ${personalInfo.lastName}`.trim();

    const fullProfileData = {
      firstName: personalInfo.firstName,
      lastName: personalInfo.lastName,
      name: fullName,
      phone: personalInfo.phone,
      alternatePhone: personalInfo.alternatePhone,
      dateOfBirth: personalInfo.dateOfBirth,
      gender: personalInfo.gender,
      bloodGroup: personalInfo.bloodGroup,
      maritalStatus: personalInfo.maritalStatus,
      profilePic,
      avatar: profilePic,
      address: addressInfo,
      emergencyContact: emergencyInfo,
      customFields,
    };

    // Save through verified backend profile endpoint
    const result = await updateAuthenticatedProfile(fullProfileData);
    setIsSaving(false);

    if (result.success) {
      setSaveSuccess('Profile successfully updated and saved to server!');
      setTimeout(() => setSaveSuccess(null), 4000);
    } else {
      setSaveError(result.error || 'Failed to save profile changes to server. Please try again.');
      setTimeout(() => setSaveError(null), 5000);
    }
  };

  const displayName = `${personalInfo.firstName} ${personalInfo.lastName}`.trim() || personalInfo.email || 'Authenticated User';
  const initials = personalInfo.firstName
    ? `${personalInfo.firstName[0] || ''}${personalInfo.lastName?.[0] || ''}`.toUpperCase()
    : 'U';

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Toast Feedback */}
      {saveSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{saveSuccess}</span>
          </div>
          <button onClick={() => setSaveSuccess(null)} className="text-emerald-500 hover:text-emerald-700 font-black cursor-pointer">
            &times;
          </button>
        </div>
      )}

      {saveError && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs font-bold flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600" />
            <span>{saveError}</span>
          </div>
          <button onClick={() => setSaveError(null)} className="text-rose-500 hover:text-rose-700 font-black cursor-pointer">
            &times;
          </button>
        </div>
      )}

      {/* Top Banner & Header */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
            {/* Profile Avatar / Photo */}
            <div className="relative group shrink-0">
              {profilePic ? (
                <img
                  src={profilePic}
                  alt={displayName}
                  className="w-24 h-24 rounded-3xl object-cover border-2 border-blue-500/40 shadow-lg shadow-blue-500/10"
                />
              ) : (
                <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-teal-500 text-white font-black text-2xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                  {initials}
                </div>
              )}

              {/* Camera Upload Trigger Overlay */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-1.5 -right-1.5 p-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md border-2 border-white dark:border-slate-900 transition hover:scale-110 cursor-pointer"
                title="Upload Profile Picture"
              >
                <Camera className="w-4 h-4" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </div>

            {/* Identity Info */}
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-0.5 rounded-full border border-blue-200 dark:border-blue-900">
                  {roleCode.replace(/_/g, ' ')}
                </span>
                <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-900 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Verified Staff
                </span>
                <span className="text-[10px] font-black text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded-full border border-rose-200 dark:border-rose-900">
                  Blood Group: {personalInfo.bloodGroup}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                {displayName}
              </h1>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-slate-500 dark:text-slate-400 font-medium">
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400" /> {personalInfo.email}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400" /> {personalInfo.phone}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" /> {professionalInfo.hospitalName}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2.5 shrink-0">
            <button
              type="button"
              onClick={handleSaveAll}
              disabled={isSaving}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Save className={`w-4 h-4 ${isSaving ? 'animate-spin' : ''}`} />
              <span>{isSaving ? 'Saving to Server...' : 'Save Changes'}</span>
            </button>

            <Link
              href="/dashboard/settings"
              className="px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition flex items-center gap-1.5"
            >
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </Link>
          </div>
        </div>

        {/* Preset Avatar Selector & Photo Controls */}
        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Preset Avatars:
            </span>
            <div className="flex items-center gap-1.5">
              {PRESET_AVATARS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleSelectPreset(p.url)}
                  className="w-7 h-7 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 hover:border-blue-500 transition cursor-pointer"
                  title={p.label}
                >
                  <img src={p.url} alt={p.label} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-2.5 py-1 rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload File</span>
            </button>

            {profilePic && (
              <button
                type="button"
                onClick={handleRemovePhoto}
                className="px-2.5 py-1 rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex overflow-x-auto gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
            activeTab === 'overview'
              ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          📋 Overview & Credentials
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('personal')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
            activeTab === 'personal'
              ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          👤 Personal & Contact Info
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('address')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
            activeTab === 'address'
              ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          📍 Address & Emergency Contact
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('professional')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
            activeTab === 'professional'
              ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          🏥 Professional & Hospital Details
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('custom')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 flex items-center gap-1.5 ${
            activeTab === 'custom'
              ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>Custom Details ({customFields.length})</span>
        </button>
      </div>

      {/* Tab 1: Overview & Identity Badges */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Employee Staff ID</div>
              <div className="text-base font-black text-slate-900 dark:text-white font-mono">{professionalInfo.staffId}</div>
              <div className="text-[11px] text-slate-500 font-medium">Canonical System Login</div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Blood Group</div>
              <div className="text-base font-black text-rose-600 dark:text-rose-400">{personalInfo.bloodGroup}</div>
              <div className="text-[11px] text-slate-500 font-medium">Medical Telemetry Verified</div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Assigned Duty Shift</div>
              <div className="text-base font-black text-blue-600 dark:text-blue-400 truncate">{professionalInfo.shift}</div>
              <div className="text-[11px] text-slate-500 font-medium">{professionalInfo.station}</div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Emergency Contact</div>
              <div className="text-base font-black text-slate-900 dark:text-white truncate">{emergencyInfo.contactName}</div>
              <div className="text-[11px] text-emerald-600 font-semibold">{emergencyInfo.phone}</div>
            </div>
          </div>

          {/* Quick Summary Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-blue-600" />
                <span>Clinical & Operational Role</span>
              </h3>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">Designation:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{professionalInfo.designation}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">Department:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{professionalInfo.department}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">License / Reg. No:</span>
                  <span className="font-mono font-bold text-blue-600">{professionalInfo.licenseNumber}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">Experience:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{professionalInfo.experienceYears} Years</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-500">Qualifications:</span>
                  <span className="font-bold text-slate-900 dark:text-white truncate max-w-[200px]">{professionalInfo.qualifications}</span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-600" />
                <span>Contact & Residence Address</span>
              </h3>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">Street Address:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{addressInfo.houseNumber}, {addressInfo.street}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">City / State:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{addressInfo.city}, {addressInfo.state}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">PIN Code:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{addressInfo.pinCode}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">Primary Phone:</span>
                  <span className="font-bold text-blue-600">{personalInfo.phone}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-500">Emergency Contact:</span>
                  <span className="font-bold text-rose-600">{emergencyInfo.contactName} ({emergencyInfo.phone})</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Personal Information Form */}
      {activeTab === 'personal' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                Personal & Contact Details
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Update your canonical name, primary mobile number, email, and biological blood group.
              </p>
            </div>
            <button
              type="button"
              onClick={handleSaveAll}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 text-xs">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 dark:text-slate-300">First Name</label>
              <input
                type="text"
                value={personalInfo.firstName}
                onChange={(e) => setPersonalInfo({ ...personalInfo, firstName: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 dark:text-slate-300">Last Name</label>
              <input
                type="text"
                value={personalInfo.lastName}
                onChange={(e) => setPersonalInfo({ ...personalInfo, lastName: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 dark:text-slate-300">Email Address</label>
              <input
                type="email"
                value={personalInfo.email}
                onChange={(e) => setPersonalInfo({ ...personalInfo, email: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 dark:text-slate-300">Primary Phone (+91)</label>
              <input
                type="text"
                value={personalInfo.phone}
                onChange={(e) => setPersonalInfo({ ...personalInfo, phone: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 dark:text-slate-300">Alternate Phone</label>
              <input
                type="text"
                value={personalInfo.alternatePhone}
                onChange={(e) => setPersonalInfo({ ...personalInfo, alternatePhone: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 dark:text-slate-300">Date of Birth</label>
              <input
                type="date"
                value={personalInfo.dateOfBirth}
                onChange={(e) => setPersonalInfo({ ...personalInfo, dateOfBirth: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 dark:text-slate-300">Gender</label>
              <select
                value={personalInfo.gender}
                onChange={(e) => setPersonalInfo({ ...personalInfo, gender: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 dark:text-slate-300">Blood Group</label>
              <select
                value={personalInfo.bloodGroup}
                onChange={(e) => setPersonalInfo({ ...personalInfo, bloodGroup: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold text-rose-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {BLOOD_GROUPS.map((bg) => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 dark:text-slate-300">Marital Status</label>
              <select
                value={personalInfo.maritalStatus}
                onChange={(e) => setPersonalInfo({ ...personalInfo, maritalStatus: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Single">Single</option>
                <option value="Married">Married</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Complete Address & Emergency Contact */}
      {activeTab === 'address' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Residential & Official Address
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Complete postal address for official hospital staff records and emergency dispatch.
                </p>
              </div>
              <button
                type="button"
                onClick={handleSaveAll}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300">House / Flat / Building No.</label>
                <input
                  type="text"
                  value={addressInfo.houseNumber}
                  onChange={(e) => setAddressInfo({ ...addressInfo, houseNumber: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300">Street / Sector / Area</label>
                <input
                  type="text"
                  value={addressInfo.street}
                  onChange={(e) => setAddressInfo({ ...addressInfo, street: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300">Landmark</label>
                <input
                  type="text"
                  value={addressInfo.landmark}
                  onChange={(e) => setAddressInfo({ ...addressInfo, landmark: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300">City</label>
                <input
                  type="text"
                  value={addressInfo.city}
                  onChange={(e) => setAddressInfo({ ...addressInfo, city: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300">State</label>
                <input
                  type="text"
                  value={addressInfo.state}
                  onChange={(e) => setAddressInfo({ ...addressInfo, state: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300">Postal / PIN Code</label>
                <input
                  type="text"
                  value={addressInfo.pinCode}
                  onChange={(e) => setAddressInfo({ ...addressInfo, pinCode: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-5">
            <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Phone className="w-4 h-4 text-rose-600" />
              <span>Primary Emergency Contact</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300">Contact Person Name</label>
                <input
                  type="text"
                  value={emergencyInfo.contactName}
                  onChange={(e) => setEmergencyInfo({ ...emergencyInfo, contactName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300">Relationship</label>
                <input
                  type="text"
                  value={emergencyInfo.relationship}
                  onChange={(e) => setEmergencyInfo({ ...emergencyInfo, relationship: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300">Emergency Phone Number</label>
                <input
                  type="text"
                  value={emergencyInfo.phone}
                  onChange={(e) => setEmergencyInfo({ ...emergencyInfo, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Professional & Hospital Credentials */}
      {activeTab === 'professional' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                Hospital Credentials & Clinical Workstation
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Medical licensing, clinical department, assigned duty station, and qualifications.
              </p>
            </div>
            <button
              type="button"
              onClick={handleSaveAll}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 text-xs">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 dark:text-slate-300">Staff / Employee Code</label>
              <input
                type="text"
                value={professionalInfo.staffId}
                onChange={(e) => setProfessionalInfo({ ...professionalInfo, staffId: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono font-bold focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 dark:text-slate-300">Designation / Role Title</label>
              <input
                type="text"
                value={professionalInfo.designation}
                onChange={(e) => setProfessionalInfo({ ...professionalInfo, designation: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 dark:text-slate-300">Assigned Department</label>
              <input
                type="text"
                value={professionalInfo.department}
                onChange={(e) => setProfessionalInfo({ ...professionalInfo, department: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 dark:text-slate-300">Medical Registration / License No.</label>
              <input
                type="text"
                value={professionalInfo.licenseNumber}
                onChange={(e) => setProfessionalInfo({ ...professionalInfo, licenseNumber: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-blue-600 font-mono font-bold focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 dark:text-slate-300">Highest Qualifications / Degrees</label>
              <input
                type="text"
                value={professionalInfo.qualifications}
                onChange={(e) => setProfessionalInfo({ ...professionalInfo, qualifications: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 dark:text-slate-300">Years of Experience</label>
              <input
                type="text"
                value={professionalInfo.experienceYears}
                onChange={(e) => setProfessionalInfo({ ...professionalInfo, experienceYears: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 dark:text-slate-300">Duty Shift Timings</label>
              <input
                type="text"
                value={professionalInfo.shift}
                onChange={(e) => setProfessionalInfo({ ...professionalInfo, shift: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 dark:text-slate-300">Assigned Station / Ward</label>
              <input
                type="text"
                value={professionalInfo.station}
                onChange={(e) => setProfessionalInfo({ ...professionalInfo, station: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 dark:text-slate-300">Primary Hospital Facility</label>
              <input
                type="text"
                value={professionalInfo.hospitalName}
                onChange={(e) => setProfessionalInfo({ ...professionalInfo, hospitalName: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold focus:outline-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Dynamic Custom Details (Unlimited Additions) */}
      {activeTab === 'custom' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500 animate-pulse" />
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Custom Details & Additional Information
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
                Apne hisaab se jo bhi information add karna chahein (jaise Passport No., Preferred Language, Special Shifts, Keycard Access), yahan add kar sakte hain. <strong className="text-blue-600 dark:text-blue-400">Aap chahein jitni baar bhi new detail add kar sakte hain!</strong>
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsAddingCustom(!isAddingCustom)}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition flex items-center gap-2 cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>{isAddingCustom ? 'Close Form' : 'Add Detail Column'}</span>
            </button>
          </div>

          {/* Inline Add Form */}
          {isAddingCustom && (
            <div className="p-5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 space-y-4 animate-in slide-in-from-top-2">
              <div className="flex items-center gap-2 text-xs font-bold text-blue-700 dark:text-blue-300">
                <Plus className="w-4 h-4" />
                <span>Add a New Custom Attribute / Field</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Detail Title / Field Name</label>
                  <input
                    type="text"
                    value={newCustomLabel}
                    onChange={(e) => setNewCustomLabel(e.target.value)}
                    placeholder="e.g. Passport Number, Diet, Pager"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold focus:outline-none"
                  />
                </div>

                <div className="space-y-1 sm:col-span-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Detail Value / Content</label>
                  <input
                    type="text"
                    value={newCustomValue}
                    onChange={(e) => setNewCustomValue(e.target.value)}
                    placeholder="e.g. Z-8192034, Pure Vegetarian"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Category Tag</label>
                  <select
                    value={newCustomCategory}
                    onChange={(e) => setNewCustomCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold focus:outline-none"
                  >
                    <option value="Personal">Personal Detail</option>
                    <option value="Clinical">Medical / Clinical</option>
                    <option value="Contact">Contact & Address</option>
                    <option value="Administrative">Hospital & Work</option>
                    <option value="Preferences">Preferences</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddingCustom(false)}
                  className="px-3.5 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAddCustomDetail}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition cursor-pointer"
                >
                  Save Detail to Profile
                </button>
              </div>
            </div>
          )}

          {/* List of Custom Details */}
          {customFields.length === 0 ? (
            <div className="p-8 text-center rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 space-y-2">
              <Sparkles className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs font-bold text-slate-600 dark:text-slate-400">
                Abhi koi custom detail add nahi ki gayi hai.
              </p>
              <p className="text-[11px] text-slate-400">
                Upar diye gaye "Add Detail Column" button par click karke aap jitni chahein utni details add kar sakte hain.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {customFields.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 flex flex-col justify-between gap-3 shadow-xs hover:border-blue-300 dark:hover:border-blue-800 transition"
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                        {item.category}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDeleteCustomDetail(item.id)}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded-lg transition cursor-pointer"
                        title="Delete Detail"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200 pt-1">
                      {item.label}
                    </div>
                    <div className="text-xs font-mono font-semibold text-slate-900 dark:text-white break-all">
                      {item.value}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

