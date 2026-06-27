import React, { useState, useContext } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar
} from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useAlert } from '../context/AlertContext';
import Logo from '../components/Logo';
import { Feather } from '@expo/vector-icons';

export default function LoginScreen() {
  const { login } = useContext(AuthContext);
  const { theme, isDarkMode, toggleTheme } = useTheme();
  const { showAlert } = useAlert();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      showAlert('Error', 'Please enter both email and password.', 'error');
      return;
    }

    setLoading(true);
    const result = await login(email, password);
    setLoading(false);

    if (!result.success) {
      showAlert('Login Failed', result.message, 'error');
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: theme.bgMain }]}
    >
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        
        {/* Outer Glass Card */}
        <View style={[
          styles.glassCard, 
          { 
            backgroundColor: theme.bgCard,
            borderColor: theme.border,
            shadowColor: isDarkMode ? '#000' : '#0a2351',
          }
        ]}>
          
          {/* Logo Section */}
          <View style={styles.logoSection}>
            <Logo size={50} showText={true} />
            <Text style={[styles.welcomeTitle, { color: theme.textPrimary }]}>Welcome Back</Text>
            <Text style={[styles.welcomeSubtitle, { color: theme.textSecondary }]}>
              Enter your credentials to access your portal
            </Text>
          </View>

          {/* Form */}
          <View style={styles.formContainer}>
            
            {/* Email Field */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>Email Address</Text>
              <View style={[styles.inputWrapper, { borderColor: theme.border, backgroundColor: theme.bgMain }]}>
                <Feather name="mail" size={18} color={theme.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: theme.textPrimary }]}
                  placeholder="name@example.com"
                  placeholderTextColor={theme.textMuted}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            {/* Password Field */}
            <View style={styles.inputGroup}>
              <View style={styles.passwordHeader}>
                <Text style={[styles.label, { color: theme.textSecondary }]}>Password</Text>
                <TouchableOpacity onPress={() => showAlert('Notice', 'Please contact your administrator or mentor to reset your password.', 'info')}>
                  <Text style={[styles.forgotText, { color: theme.primary }]}>Forgot password?</Text>
                </TouchableOpacity>
              </View>
              <View style={[styles.inputWrapper, { borderColor: theme.border, backgroundColor: theme.bgMain }]}>
                <Feather name="lock" size={18} color={theme.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: theme.textPrimary }]}
                  placeholder="••••••••"
                  placeholderTextColor={theme.textMuted}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity 
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}
                >
                  <Feather 
                    name={showPassword ? 'eye-off' : 'eye'} 
                    size={18} 
                    color={theme.textMuted} 
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity 
              style={[
                styles.submitButton, 
                { 
                  backgroundColor: theme.primary,
                  shadowColor: theme.primaryGlow
                }
              ]} 
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color={isDarkMode ? '#000' : '#fff'} />
              ) : (
                <View style={styles.buttonContent}>
                  <Feather name="log-in" size={18} color={isDarkMode ? '#000' : '#fff'} style={{ marginRight: 8 }} />
                  <Text style={[styles.submitButtonText, { color: isDarkMode ? '#000' : '#fff' }]}>Sign In</Text>
                </View>
              )}
            </TouchableOpacity>

          </View>

          {/* Footer */}
          <Text style={[styles.footerText, { color: theme.textSecondary }]}>
            Don't have an account?{' '}
            <Text 
              style={[styles.footerLink, { color: theme.secondary }]}
              onPress={() => showAlert('Contact', 'Please get in touch with your Mentor to create an account.', 'info')}
            >
              Contact your Mentor
            </Text>
          </Text>

        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
    paddingTop: 50,
  },
  glassCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 24,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 28,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: '800',
    marginTop: 16,
    marginBottom: 6,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  welcomeSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 10,
    lineHeight: 20,
  },
  formContainer: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 20,
  },
  passwordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  forgotText: {
    fontSize: 13,
    fontWeight: '600',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    height: 52,
    paddingHorizontal: 14,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    height: '100%',
  },
  eyeIcon: {
    padding: 4,
  },
  submitButton: {
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 3,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
  footerText: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 24,
  },
  footerLink: {
    fontWeight: '600',
  },
});
