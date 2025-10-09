import React from 'react';
import { View, Text, TextInput } from 'react-native';
import formStyles from './formStyles';
import themeVariables from '../../styles/theme';

const EmailInput = React.forwardRef(
  (
    {
      label = 'Email',
      containerStyle,
      labelStyle,
      inputStyle,
      keyboardType,
      autoCapitalize,
      autoCorrect,
      placeholderTextColor,
      ...rest
    },
    ref
  ) => {
    const resolvedKeyboardType = keyboardType ?? 'email-address';
    const resolvedAutoCapitalize = autoCapitalize ?? 'none';
    const resolvedAutoCorrect = autoCorrect ?? false;
    const resolvedPlaceholderColor = placeholderTextColor ?? themeVariables.placeholderColor ?? '#666';

    return (
      <View style={[formStyles.fieldContainer, containerStyle]}>
        {label ? <Text style={[formStyles.label, labelStyle]}>{label}</Text> : null}
        <TextInput
          ref={ref}
          style={[formStyles.input, inputStyle]}
          keyboardType={resolvedKeyboardType}
          autoCapitalize={resolvedAutoCapitalize}
          autoCorrect={resolvedAutoCorrect}
          placeholderTextColor={resolvedPlaceholderColor}
          {...rest}
        />
      </View>
    );
  }
);

EmailInput.displayName = 'EmailInput';

export default EmailInput;
