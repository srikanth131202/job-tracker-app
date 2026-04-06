/**
 * Settings Page
 * User settings and Gmail connection management
 */

import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { syncApi } from '../services/api';

const Settings = () => {
  const { user, updateUserPreferences } = useAuth();
  const [syncStatus, setSyncStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);

  const [preferences, setPreferences] = useState({
    syncEnabled: true,
    syncInterval: 15,
    emailFilters: []
  });

  const fetchSyncStatus = useCallback(async () => {
    try {
      const response = await syncApi.getStatus();
      setSyncStatus(response.data.data);
      if (user?.preferences) {
        setPreferences({
          syncEnabled: user.preferences.syncEnabled ?? true,
          syncInterval: user.preferences.syncInterval ?? 15,
          emailFilters: user.preferences.emailFilters ?? []
        });
      }
    } catch (error) {
      console.error('Error fetching sync status:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchSyncStatus();
  }, [fetchSyncStatus]);

  // eslint-disable-next-line no-unused-vars
  const handleSavePreferences = useCallback(async () => {
    try {
      await updateUserPreferences(preferences);
      setMessage({ type: 'success', text: 'Preferences saved successfully' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save preferences' });
    }
    setTimeout(() => setMessage(null), 3000);
  }, [preferences, updateUserPreferences]);

  const handleToggleSync = async () => {
    const newEnabled = !preferences.syncEnabled;
    setPreferences(prev => ({ ...prev, syncEnabled: newEnabled }));
    try {
      await syncApi.toggle(newEnabled);
      setMessage({ type: 'success', text: newEnabled ? 'Sync enabled' : 'Sync disabled' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setPreferences(prev => ({ ...prev, syncEnabled: !newEnabled }));
      setMessage({ type: 'error', text: 'Failed to update sync setting' });
    }
  };

  const handleAddFilter = (e) => {
    e.preventDefault();
    const filter = e.target.filter.value.trim();
    if (filter && !preferences.emailFilters.includes(filter)) {
      setPreferences(prev => ({
        ...prev,
        emailFilters: [...prev.emailFilters, filter]
      }));
      e.target.filter.value = '';
    }
  };

  const handleRemoveFilter = (filterToRemove) => {
    setPreferences(prev => ({
      ...prev,
      emailFilters: prev.emailFilters.filter(f => f !== filterToRemove)
    }));
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="w-full space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>

        {/* Message */}
        {message && (
          <div className={`px-4 py-3 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-50 text-green-700'
              : 'bg-red-50 text-red-700'
          }`}>
            {message.text}
          </div>
        )}

        {/* Gmail Connection */}
        <div className="card mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Gmail Connection
          </h2>

          {syncStatus?.gmailConnected ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <div>
                  <p className="font-medium text-green-800">Gmail Connected</p>
                  <p className="text-sm text-green-600">
                    Connected as {user?.email}
                  </p>
                </div>
              </div>

              <div className="text-sm text-gray-500">
                <p>Last sync: {syncStatus.lastSyncAt ? new Date(syncStatus.lastSyncAt).toLocaleString() : 'Never'}</p>
              </div>

              <button
                onClick={() => window.open(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/auth/google`, '_blank')}
                className="px-4 py-2 text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors text-sm font-medium"
              >
                Re-connect Gmail
              </button>
            </div>
          ) : (
            <div className="text-center py-8">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <p className="text-gray-500 mb-4">Connect your Gmail account to automatically sync job applications</p>
              <a
                href={`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/auth/google`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Connect with Google
              </a>
            </div>
          )}
        </div>

        {/* Sync Settings */}
        <div className="card mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Sync Settings
          </h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Auto-sync</p>
                <p className="text-sm text-gray-500">
                  Automatically sync Gmail every 15 minutes
                </p>
              </div>
              <button
                onClick={handleToggleSync}
                disabled={!syncStatus?.gmailConnected}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  preferences.syncEnabled ? 'bg-primary-600' : 'bg-gray-200'
                } ${!syncStatus?.gmailConnected ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    preferences.syncEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sync Interval (minutes)
              </label>
              <select
                value={preferences.syncInterval}
                onChange={(e) => setPreferences(prev => ({ ...prev, syncInterval: Number(e.target.value) }))}
                className="input-field max-w-xs"
                disabled={!syncStatus?.gmailConnected}
              >
                <option value={5}>5 minutes</option>
                <option value={15}>15 minutes</option>
                <option value={30}>30 minutes</option>
                <option value={60}>1 hour</option>
              </select>
            </div>
          </div>
        </div>

        {/* Email Filters */}
        <div className="card mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Email Filters
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            Keywords to identify job-related emails
          </p>

          <div className="flex flex-wrap gap-2 mb-4">
            {preferences.emailFilters.map((filter) => (
              <span
                key={filter}
                className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm"
              >
                {filter}
                <button
                  onClick={() => handleRemoveFilter(filter)}
                  className="hover:text-primary-900"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            ))}
          </div>

          <form onSubmit={handleAddFilter} className="flex gap-2">
            <input
              type="text"
              name="filter"
              placeholder="Add a keyword (e.g., 'hiring', 'recruiter')"
              className="input-field flex-1"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Add
            </button>
          </form>
        </div>

        {/* Account Info */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Account Information
          </h2>

          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">Name</p>
              <p className="font-medium text-gray-900">{user?.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-medium text-gray-900">{user?.email}</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Settings;
