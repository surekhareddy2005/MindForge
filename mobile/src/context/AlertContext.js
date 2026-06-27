import React, { createContext, useContext, useState } from 'react';
import { 
  View, 
  Text, 
  Modal, 
  StyleSheet, 
  TouchableOpacity, 
  Dimensions, 
  TouchableWithoutFeedback 
} from 'react-native';
import { useTheme } from './ThemeContext';
import { Feather } from '@expo/vector-icons';

const AlertContext = createContext();

export const AlertProvider = ({ children }) => {
  const { theme } = useTheme();
  
  const [visible, setVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState('info'); // info, success, error, confirm
  const [onConfirmCallback, setOnConfirmCallback] = useState(null);
  const [onCancelCallback, setOnCancelCallback] = useState(null);
  const [confirmLabel, setConfirmLabel] = useState('OK');
  const [cancelLabel, setCancelLabel] = useState('Cancel');

  const showAlert = (alertTitle, alertMessage, alertType = 'info', onClose = null) => {
    setTitle(alertTitle);
    setMessage(alertMessage);
    setType(alertType);
    setOnConfirmCallback(() => () => {
      setVisible(false);
      if (onClose) onClose();
    });
    setOnCancelCallback(null);
    setConfirmLabel('OK');
    setVisible(true);
  };

  const showConfirm = (confirmTitle, confirmMessage, onConfirm, onCancel = null, options = {}) => {
    setTitle(confirmTitle);
    setMessage(confirmMessage);
    setType('confirm');
    setOnConfirmCallback(() => () => {
      setVisible(false);
      if (onConfirm) onConfirm();
    });
    setOnCancelCallback(() => () => {
      setVisible(false);
      if (onCancel) onCancel();
    });
    setConfirmLabel(options.confirmText || 'Confirm');
    setCancelLabel(options.cancelText || 'Cancel');
    setVisible(true);
  };

  const handleConfirm = () => {
    if (onConfirmCallback) onConfirmCallback();
  };

  const handleCancel = () => {
    if (onCancelCallback) {
      onCancelCallback();
    } else {
      setVisible(false);
    }
  };

  const getIconConfig = () => {
    switch (type) {
      case 'success':
        return {
          name: 'check-circle',
          color: theme.success || '#10b981',
          bg: 'rgba(16, 185, 129, 0.1)'
        };
      case 'error':
        return {
          name: 'alert-triangle',
          color: theme.error || '#ef4444',
          bg: 'rgba(239, 68, 68, 0.1)'
        };
      case 'confirm':
        return {
          name: 'help-circle',
          color: theme.primary || '#4F46E5',
          bg: theme.primarySurface || 'rgba(79, 70, 229, 0.08)'
        };
      case 'info':
      default:
        return {
          name: 'info',
          color: theme.primary || '#4F46E5',
          bg: theme.primarySurface || 'rgba(79, 70, 229, 0.08)'
        };
    }
  };

  const iconConfig = getIconConfig();

  return (
    <AlertContext.Provider value={{ showAlert, showConfirm }}>
      {children}
      <Modal
        animationType="fade"
        transparent={true}
        visible={visible}
        onRequestClose={handleCancel}
      >
        <TouchableWithoutFeedback onPress={type === 'confirm' ? null : handleConfirm}>
          <View style={styles.overlay}>
            <TouchableWithoutFeedback>
              <View style={[styles.alertCard, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
                {/* Glowing top accent color matching alert state */}
                <View style={[styles.topBorderAccent, { backgroundColor: iconConfig.color }]} />

                {/* Custom Icon Wrapper */}
                <View style={[styles.iconWrapper, { backgroundColor: iconConfig.bg }]}>
                  <Feather name={iconConfig.name} size={28} color={iconConfig.color} />
                </View>

                {/* Title */}
                {title ? (
                  <Text style={[styles.alertTitle, { color: theme.textPrimary }]}>{title}</Text>
                ) : null}

                {/* Message */}
                {message ? (
                  <Text style={[styles.alertMessage, { color: theme.textSecondary }]}>{message}</Text>
                ) : null}

                {/* Buttons deck */}
                <View style={styles.buttonRow}>
                  {type === 'confirm' && (
                    <TouchableOpacity
                      style={[styles.button, styles.secondaryButton, { borderColor: theme.border }]}
                      onPress={handleCancel}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.secondaryButtonText, { color: theme.textSecondary }]}>
                        {cancelLabel}
                      </Text>
                    </TouchableOpacity>
                  )}
                  
                  <TouchableOpacity
                    style={[
                      styles.button, 
                      styles.primaryButton, 
                      { backgroundColor: theme.primary },
                      type !== 'confirm' ? { flex: 1 } : null
                    ]}
                    onPress={handleConfirm}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.primaryButtonText, { color: '#0F172A' }]}>
                      {confirmLabel}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </AlertContext.Provider>
  );
};

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (context === undefined) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  alertCard: {
    width: Math.min(width * 0.85, 340),
    borderRadius: 24,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    position: 'relative',
    overflow: 'hidden',
  },
  topBorderAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
  },
  iconWrapper: {
    width: 56,
    height: 56,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 8,
  },
  alertTitle: {
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  alertMessage: {
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 24,
  },
  buttonRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'center',
    gap: 12,
  },
  button: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButton: {
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 2,
  },
  primaryButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },
  secondaryButton: {
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
