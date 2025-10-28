import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import formStyles from './formStyles';
import themeVariables from '../../stylesheets/theme';

const PasswordInput = React.forwardRef(
  (
    {
      label = 'Password',
      containerStyle,
      labelStyle,
      inputStyle,
      inputContainerStyle,
      showToggle = false,
      editable = true,
      iconColor,
      placeholderTextColor,
      toggleAccessibilityLabelHide = 'Hide password',
      toggleAccessibilityLabelShow = 'Show password',
      ...rest
    },
    ref
  ) => {
    const [visible, setVisible] = useState(false);
    const { secureTextEntry, ...inputProps } = rest;
    const resolvedPlaceholderColor = placeholderTextColor ?? themeVariables.placeholderColor ?? '#666';
    const resolvedIconColor = iconColor ?? themeVariables.primaryColor;
    const resolvedSecureEntry = showToggle ? !visible : secureTextEntry ?? true;

    return (
      <View style={[formStyles.fieldContainer, containerStyle]}>
        {label ? <Text style={[formStyles.label, labelStyle]}>{label}</Text> : null}
        {showToggle ? (
          <View style={[styles.passwordContainer, inputContainerStyle]}>
            <TextInput
              ref={ref}
              style={[styles.passwordInput, inputStyle]}
              secureTextEntry={resolvedSecureEntry}
              editable={editable}
              placeholderTextColor={resolvedPlaceholderColor}
              {...inputProps}
            />
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel={visible ? toggleAccessibilityLabelHide : toggleAccessibilityLabelShow}
              onPress={() => setVisible(prev => !prev)}
              style={styles.toggleIcon}
              disabled={!editable}
            >
              <Ionicons name={visible ? 'eye-off' : 'eye'} size={20} color={resolvedIconColor} />
            </TouchableOpacity>
          </View>
        ) : (
          <TextInput
            ref={ref}
            style={[formStyles.input, inputStyle]}
            secureTextEntry={resolvedSecureEntry}
            editable={editable}
            placeholderTextColor={resolvedPlaceholderColor}
            {...inputProps}
          />
        )}
      </View>
    );
  }
);

PasswordInput.displayName = 'PasswordInput';

const styles = StyleSheet.create({
  passwordContainer: {
    width: '80%',
    marginBottom: 12,
    borderWidth: 1,
    borderRadius: 8,
    borderColor: themeVariables.primaryColor,
    backgroundColor: themeVariables.whiteColor,
    flexDirection: 'row',
    alignItems: 'center',
  },
  passwordInput: {
    flex: 1,
    padding: 10,
  },
  toggleIcon: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
});

export default PasswordInput;
