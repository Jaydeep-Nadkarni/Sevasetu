import React, { useState } from 'react'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import { Card } from '../components/UI/Card'
import { Button } from '../components/UI/Button'
import { Bell, Lock, Eye, Shield, Save, AlertCircle } from 'lucide-react'
import { toast } from 'react-hot-toast'
import api from '../utils/api'

const Settings = () => {
  const { isDark } = useTheme()
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  // Account settings state
  const [accountSettings, setAccountSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    twoFactorAuth: false,
    profileVisibility: true,
  })

  // Privacy settings state
  const [privacySettings, setPrivacySettings] = useState({
    allowAnonymousDonations: true,
    showProfile: true,
    showDonationHistory: false,
    allowMessaging: true,
  })

  const [notifications, setNotifications] = useState({
    donations: true,
    events: true,
    levelUp: true,
    certificates: true,
    messages: true,
  })

  // Handle settings change
  const handleSettingChange = (setting, value) => {
    setAccountSettings(prev => ({
      ...prev,
      [setting]: value
    }))
  }

  const handlePrivacyChange = (setting, value) => {
    setPrivacySettings(prev => ({
      ...prev,
      [setting]: value
    }))
  }

  const handleNotificationChange = (setting, value) => {
    setNotifications(prev => ({
      ...prev,
      [setting]: value
    }))
  }

  // Save settings to backend
  const handleSaveSettings = async () => {
    setSaving(true)
    try {
      const response = await api.put('/users/settings', {
        accountSettings,
        privacySettings,
        notifications,
      })

      if (response.data.success) {
        toast.success('Settings saved successfully!')
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      toast.error('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  // Handle logout
  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to logout?')) {
      await logout()
      navigate('/login')
      toast.success('Logged out successfully')
    }
  }

  // Role-specific label
  const getRoleLabel = () => {
    if (!user) return 'User'
    switch (user.role) {
      case 'ngo_admin':
        return 'NGO Admin'
      case 'admin':
        return 'Administrator'
      default:
        return 'User'
    }
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Settings</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your account preferences and privacy settings
          </p>
        </div>

        {/* Settings Grid */}
        <div className="space-y-6">
          {/* Account Settings Card */}
          <Card header="Account Settings" className="dark:bg-gray-800 dark:border-gray-700">
            <div className="space-y-4">
              {/* Account Info */}
              <div className="pb-4 border-b dark:border-gray-700">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Account Information</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {user?.email} • {getRoleLabel()}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => navigate(user?.role === 'ngo_admin' ? '/ngo/profile' : user?.role === 'admin' ? '/profile' : '/profile')}
                  >
                    Edit Profile
                  </Button>
                </div>
              </div>

              {/* Email Notifications */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Email Notifications</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Receive email updates about donations and events
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={accountSettings.emailNotifications}
                    onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                </label>
              </div>

              {/* Push Notifications */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Push Notifications</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Get real-time notifications in your browser
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={accountSettings.pushNotifications}
                    onChange={(e) => handleSettingChange('pushNotifications', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                </label>
              </div>

              {/* Two-Factor Authentication */}
              <div className="flex items-center justify-between pt-2 border-t dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <Lock className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Two-Factor Authentication</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Add an extra layer of security to your account
                    </p>
                  </div>
                </div>
                <Button size="sm" variant="outline">
                  {accountSettings.twoFactorAuth ? 'Disable' : 'Enable'}
                </Button>
              </div>
            </div>
          </Card>

          {/* Notification Preferences */}
          <Card header="Notification Preferences" className="dark:bg-gray-800 dark:border-gray-700">
            <div className="space-y-3">
              {Object.entries({
                donations: 'Donation Updates',
                events: 'Event Notifications',
                levelUp: 'Level Up Achievements',
                certificates: 'Certificate Earned',
                messages: 'Messages from NGOs'
              }).map(([key, label]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-gray-700 dark:text-gray-300">{label}</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifications[key]}
                      onChange={(e) => handleNotificationChange(key, e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                  </label>
                </div>
              ))}
            </div>
          </Card>

          {/* Privacy Settings */}
          <Card header="Privacy Settings" className="dark:bg-gray-800 dark:border-gray-700">
            <div className="space-y-4">
              {/* Profile Visibility */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Eye className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Profile Visibility</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Allow others to see your public profile
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={privacySettings.showProfile}
                    onChange={(e) => handlePrivacyChange('showProfile', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                </label>
              </div>

              {/* Donation History */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Eye className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Show Donation History</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Display your donation history on your public profile
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={privacySettings.showDonationHistory}
                    onChange={(e) => handlePrivacyChange('showDonationHistory', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                </label>
              </div>

              {/* Allow Messaging */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Allow Messaging</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Allow NGOs to contact you about opportunities
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={privacySettings.allowMessaging}
                    onChange={(e) => handlePrivacyChange('allowMessaging', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                </label>
              </div>
            </div>
          </Card>

          {/* Danger Zone */}
          <Card header="Danger Zone" className="dark:bg-gray-800 border-red-200 dark:border-red-900">
            <div className="space-y-4">
              {/* Logout */}
              <div className="flex items-center justify-between pb-4 border-b dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Logout</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Sign out from this account
                    </p>
                  </div>
                </div>
                <Button
                  onClick={handleLogout}
                  className="bg-red-600 hover:bg-red-700 text-white"
                  size="sm"
                >
                  Logout
                </Button>
              </div>

              {/* Delete Account (Future Enhancement) */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Delete Account</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Permanently delete your account and all data
                    </p>
                  </div>
                </div>
                <Button
                  disabled
                  className="opacity-50 cursor-not-allowed"
                  size="sm"
                  variant="outline"
                >
                  Delete
                </Button>
              </div>
            </div>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end gap-4">
            <Button
              variant="outline"
              onClick={() => navigate(-1)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveSettings}
              disabled={saving}
              className="flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings
