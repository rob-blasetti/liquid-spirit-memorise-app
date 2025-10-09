import React from 'react';
import { View, Text, TextInput } from 'react-native';
import formStyles from './formStyles';
import themeVariables from '../../styles/theme';

const UsernameInput = React.forwardRef(
  (
    {
      label = 'Username',
      containerStyle,
      labelStyle,
      inputStyle,
      autoCapitalize,
      autoCorrect,
      placeholderTextColor,
      ...rest
    },
    ref
  ) => {
    const resolvedAutoCapitalize = autoCapitalize ?? 'none';
    const resolvedAutoCorrect = autoCorrect ?? false;
    const resolvedPlaceholderColor = placeholderTextColor ?? themeVariables.placeholderColor ?? '#666';

    return (
      <View style={[formStyles.fieldContainer, containerStyle]}>
        {label ? <Text style={[formStyles.label, labelStyle]}>{label}</Text> : null}
        <TextInput
          ref={ref}
          style={[formStyles.input, inputStyle]}
          autoCapitalize={resolvedAutoCapitalize}
          autoCorrect={resolvedAutoCorrect}
          placeholderTextColor={resolvedPlaceholderColor}
          {...rest}
        />
      </View>
    );
  }
);

UsernameInput.displayName = 'UsernameInput';

export default UsernameInput;
