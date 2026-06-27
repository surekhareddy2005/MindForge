import React, { useContext, useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput,
  TouchableOpacity, 
  SafeAreaView, 
  ScrollView,
  ActivityIndicator,
  Platform,
  StatusBar
} from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useAlert } from '../context/AlertContext';
import { updateProfile, updatePassword as apiUpdatePassword } from '../services/api';
import { Feather } from '@expo/vector-icons';

export default function SettingsScreen() {
  const { user, logout, updateUser } = useContext(AuthContext);
  const { theme } = useTheme();
  const { showAlert, showConfirm: showConfirmAlert } = useAlert();

  // Profile Details Form States
  const [newName, setNewName] = useState('');
  const [isUpdatingName, setIsUpdatingName] = useState(false);
  const [nameSuccess, setNameSuccess] = useState(false);

  // Security Form States
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isUpdatingPass, setIsUpdatingPass] = useState(false);
  const [passSuccess, setPassSuccess] = useState(false);

  useEffect(() => {
    if (user?.name) {
      setNewName(user.name);
    }
  }, [user]);

  const handleUpdateName = async () => {
    if (!newName.trim()) {
      showAlert('Incomplete', 'Please enter a valid full name.', 'error');
      return;
    }
    
    setIsUpdatingName(true);
    try {
      const res = await updateProfile({ name: newName.trim() });
      if (res.data) {
        // Sync context state & AsyncStorage
        const updatedUser = { ...user, name: res.data.name };
        await updateUser(updatedUser);
        
        setNameSuccess(true);
        setTimeout(() => setNameSuccess(false), 3000);
        showAlert('Profile Updated', 'Your profile details have been saved successfully.', 'success');
      }
    } catch (err) {
      console.error('Failed to update name:', err);
      showAlert('Error', err.response?.data?.message || 'Failed to update profile name.', 'error');
    } finally {
      setIsUpdatingName(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!currentPassword) {
      showAlert('Incomplete', 'Please enter your current password.', 'error');
      return;
    }

    if (newPassword.length < 6) {
      showAlert('Incomplete', 'New password must be at least 6 characters long.', 'error');
      return;
    }

    if (newPassword !== confirmPassword) {
      showAlert('Match Error', 'New passwords do not match. Please verify.', 'error');
      return;
    }

    setIsUpdatingPass(true);
    try {
      await apiUpdatePassword({
        currentPassword,
        newPassword
      });

      setPassSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPassSuccess(false), 3000);
      showAlert('Password Updated', 'Your password has been changed successfully.', 'success');
    } catch (err) {
      console.error('Failed to update password:', err);
      showAlert('Error', err.response?.data?.message || 'Failed to change password. Please verify your current password.', 'error');
    } finally {
      setIsUpdatingPass(false);
    }
  };

  const handleLogout = () => {
    showConfirmAlert(
      'Logout',
      'Are you sure you want to log out?',
      logout,
      null,
      { confirmText: 'Log Out', cancelText: 'Cancel' }
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bgMain }]}>
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <Text style={[styles.title, { color: theme.textPrimary }]}>Settings</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Manage your student profile and security settings</Text>

        {/* Profile Card Header with Initials avatar and details */}
        <View style={[styles.profileCard, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
          <View style={[styles.avatarBox, { backgroundColor: theme.primary }]}>
            <Text style={styles.avatarText}>
              {user?.name ? user.name.charAt(0).toUpperCase() : 'S'}
            </Text>
          </View>
          <View style={styles.profileDetails}>
            <Text style={[styles.profileName, { color: theme.textPrimary }]}>{user?.name || 'Student'}</Text>
            <Text style={[styles.profileEmail, { color: theme.textSecondary }]}>{user?.email || 'student@mindforge.com'}</Text>
            <View style={[styles.roleBadge, { backgroundColor: theme.primarySurface }]}>
              <Text style={[styles.roleText, { color: theme.primary }]}>STUDENT PORTAL</Text>
            </View>
          </View>
        </View>

        {/* Profile details form section */}
        <View style={[styles.sectionCard, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
          <View style={styles.sectionHeaderRow}>
            <Feather name="user" size={18} color={theme.primary} style={{ marginRight: 10 }} />
            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Profile Details</Text>
          </View>

          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>FULL NAME</Text>
            <TextInput
              style={[styles.inputField, { borderColor: theme.border, backgroundColor: theme.bgMain, color: theme.textPrimary }]}
              value={newName}
              onChangeText={setNewName}
              placeholder="Full Name"
              placeholderTextColor={theme.textMuted}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>EMAIL ADDRESS (READ-ONLY)</Text>
            <TextInput
              style={[styles.inputField, { borderColor: theme.border, backgroundColor: 'rgba(255,255,255,0.03)', color: theme.textSecondary }]}
              value={user?.email || ''}
              editable={false}
              placeholder="Email Address"
            />
          </View>

          <TouchableOpacity
            style={[
              styles.actionButton, 
              { backgroundColor: theme.primary },
              (isUpdatingName || newName.trim() === user?.name) ? { opacity: 0.5 } : null
            ]}
            onPress={handleUpdateName}
            disabled={isUpdatingName || newName.trim() === user?.name}
            activeOpacity={0.8}
          >
            {isUpdatingName ? (
              <ActivityIndicator color="#0F172A" />
            ) : (
              <View style={styles.buttonContent}>
                <Feather name={nameSuccess ? "check" : "save"} size={16} color="#0F172A" style={{ marginRight: 8 }} />
                <Text style={styles.actionButtonText}>
                  {nameSuccess ? 'Profile Updated' : 'Update Profile'}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Change password section */}
        <View style={[styles.sectionCard, { backgroundColor: theme.bgCard, borderColor: theme.border, marginBottom: 20 }]}>
          <View style={styles.sectionHeaderRow}>
            <Feather name="lock" size={18} color={theme.primary} style={{ marginRight: 10 }} />
            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Change Password</Text>
          </View>

          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>CURRENT PASSWORD</Text>
            <View style={styles.passwordInputContainer}>
              <TextInput
                style={[styles.passwordField, { borderColor: theme.border, backgroundColor: theme.bgMain, color: theme.textPrimary }]}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                secureTextEntry={!showCurrent}
                placeholder="••••••••"
                placeholderTextColor={theme.textMuted}
              />
              <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowCurrent(!showCurrent)}>
                <Feather name={showCurrent ? "eye-off" : "eye"} size={18} color={theme.textMuted} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>NEW PASSWORD</Text>
            <View style={styles.passwordInputContainer}>
              <TextInput
                style={[styles.passwordField, { borderColor: theme.border, backgroundColor: theme.bgMain, color: theme.textPrimary }]}
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry={!showNew}
                placeholder="••••••••"
                placeholderTextColor={theme.textMuted}
              />
              <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowNew(!showNew)}>
                <Feather name={showNew ? "eye-off" : "eye"} size={18} color={theme.textMuted} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>CONFIRM NEW PASSWORD</Text>
            <View style={styles.passwordInputContainer}>
              <TextInput
                style={[styles.passwordField, { borderColor: theme.border, backgroundColor: theme.bgMain, color: theme.textPrimary }]}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirm}
                placeholder="••••••••"
                placeholderTextColor={theme.textMuted}
              />
              <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowConfirm(!showConfirm)}>
                <Feather name={showConfirm ? "eye-off" : "eye"} size={18} color={theme.textMuted} />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.actionButton, 
              { backgroundColor: theme.primary },
              isUpdatingPass ? { opacity: 0.5 } : null
            ]}
            onPress={handleUpdatePassword}
            disabled={isUpdatingPass}
            activeOpacity={0.8}
          >
            {isUpdatingPass ? (
              <ActivityIndicator color="#0F172A" />
            ) : (
              <View style={styles.buttonContent}>
                <Feather name={passSuccess ? "check" : "shield"} size={16} color="#0F172A" style={{ marginRight: 8 }} />
                <Text style={styles.actionButtonText}>
                  {passSuccess ? 'Password Updated' : 'Update Password'}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Actions Section */}
        <TouchableOpacity 
          style={[styles.logoutButton, { borderColor: theme.error }]} 
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <Feather name="log-out" size={18} color={theme.error} style={{ marginRight: 8 }} />
          <Text style={[styles.logoutText, { color: theme.error }]}>Log Out of Account</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  scrollContainer: {
    padding: 20,
    paddingTop: 20,
    paddingBottom: 110,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 24,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
    marginBottom: 24,
  },
  avatarBox: {
    width: 68,
    height: 68,
    borderRadius: 34,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 3,
  },
  avatarText: {
    fontSize: 26,
    fontWeight: '900',
    color: '#0F172A',
  },
  profileDetails: {
    flex: 1,
  },
  profileName: {
    fontSize: 19,
    fontWeight: '800',
    marginBottom: 2,
  },
  profileEmail: {
    fontSize: 13,
    marginBottom: 8,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  roleText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  sectionCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
    marginBottom: 24,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  inputField: {
    borderWidth: 1,
    borderRadius: 14,
    height: 48,
    paddingHorizontal: 14,
    fontSize: 14,
  },
  passwordInputContainer: {
    position: 'relative',
    justifyContent: 'center',
  },
  passwordField: {
    borderWidth: 1,
    borderRadius: 14,
    height: 48,
    paddingLeft: 14,
    paddingRight: 45,
    fontSize: 14,
  },
  eyeIcon: {
    position: 'absolute',
    right: 15,
    padding: 5,
  },
  actionButton: {
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '700',
  },
  logoutButton: {
    flexDirection: 'row',
    height: 48,
    borderWidth: 1.5,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
