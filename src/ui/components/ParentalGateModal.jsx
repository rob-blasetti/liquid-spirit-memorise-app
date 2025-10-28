import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { BlurView } from '@react-native-community/blur';
import themeVariables from '../stylesheets/theme';

const ParentalGateModal = ({
  visible,
  challenge,
  onSubmit,
  onCancel,
}) => {
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!visible) return;
    setAnswer('');
    setError('');
  }, [visible, challenge?.prompt]);

  const handleSubmit = () => {
    const response = Number.parseInt(answer, 10);
    if (Number.isNaN(response)) {
      setError('Please enter a number.');
      return;
    }
    const isCorrect = response === challenge?.answer;
    if (!isCorrect) {
      setError('That answer is incorrect. Please try again.');
      setAnswer('');
      return;
    }
    setError('');
    onSubmit?.();
  };

  if (!challenge) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.modalOverlay}>
        <TouchableWithoutFeedback onPress={onCancel}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalContentWrapper}
        >
          <View style={styles.cardWrapper}>
            <BlurView
              style={styles.modalBlur}
              blurType="light"
              blurAmount={24}
              reducedTransparencyFallbackColor="rgba(20, 18, 46, 0.92)"
              pointerEvents="none"
            />
            <View pointerEvents="box-none" style={styles.closeButtonContainer}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={onCancel}
                hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
                activeOpacity={0.7}
              >
                <Ionicons name="close" size={22} color={themeVariables.whiteColor} />
              </TouchableOpacity>
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.title}>Parents Only</Text>
              <Text style={styles.message}>
                To continue, please solve this problem:
              </Text>
              <Text style={styles.prompt}>{challenge.prompt}</Text>
              <TextInput
                value={answer}
                onChangeText={setAnswer}
                keyboardType="number-pad"
                style={styles.input}
                placeholder="Answer"
                placeholderTextColor="rgba(255,255,255,0.5)"
                returnKeyType="done"
                onSubmitEditing={handleSubmit}
              />
              {error ? <Text style={styles.error}>{error}</Text> : null}
              <View style={styles.buttonRow}>
                <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onCancel}>
                  <Text style={[styles.buttonText, styles.cancelText]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.button, styles.confirmButton]} onPress={handleSubmit}>
                  <Text style={styles.buttonText}>Continue</Text>
                </TouchableOpacity>
              </View>
              </View>
            </View>
          </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 24,
    position: 'relative',
  },
  modalContentWrapper: {
    width: '100%',
    alignItems: 'center',
  },
  cardWrapper: {
    width: '100%',
    maxWidth: 420,
    borderRadius: themeVariables.borderRadiusPill,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.35)',
    backgroundColor: 'rgba(20, 18, 46, 0.92)',
    overflow: 'hidden',
    position: 'relative',
  },
  modalBlur: {
    ...StyleSheet.absoluteFillObject,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },
  cardContent: {
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  title: {
    color: themeVariables.whiteColor,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
  },
  message: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 16,
    marginBottom: 8,
  },
  prompt: {
    color: themeVariables.whiteColor,
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    backgroundColor: 'rgba(0,0,0,0.24)',
    color: themeVariables.whiteColor,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 18,
    marginBottom: 12,
  },
  error: {
    color: themeVariables.redColor || '#ff6b6b',
    marginBottom: 12,
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    columnGap: 12,
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  cancelButton: {
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  confirmButton: {
    backgroundColor: themeVariables.whiteColor,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    color: themeVariables.primaryColor,
  },
  cancelText: {
    color: themeVariables.whiteColor,
  },
  closeButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonContainer: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 40,
    height: 40,
  },
});

export default ParentalGateModal;
