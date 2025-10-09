import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import formStyles from './formStyles';
import themeVariables from '../../styles/theme';

const DEFAULT_GRADES = ['1', '2', '2b', '3', '4', '5'];

const GradeSelector = ({
  label = 'Grade',
  grades = DEFAULT_GRADES,
  disabledGrades = [],
  value,
  onChange,
  containerStyle,
  labelStyle,
  rowStyle,
  buttonStyle,
  activeButtonStyle,
  disabledButtonStyle,
  textStyle,
  activeTextStyle,
  disabledTextStyle,
}) => {
  const handleSelect = grade => {
    if (disabledGrades.includes(grade)) {
      return;
    }
    if (onChange) {
      onChange(grade);
    }
  };

  return (
    <View style={[formStyles.fieldContainer, containerStyle]}>
      {label ? <Text style={[styles.gradeLabel, labelStyle]}>{label}</Text> : null}
      <View style={[styles.gradeRow, rowStyle]}>
        {grades.map(grade => {
          const disabled = disabledGrades.includes(grade);
          const active = String(value) === String(grade);
          return (
            <TouchableOpacity
              key={grade}
              disabled={disabled}
              style={[
                styles.gradeButton,
                buttonStyle,
                active && [styles.gradeButtonActive, activeButtonStyle],
                disabled && [styles.gradeButtonDisabled, disabledButtonStyle],
              ]}
              onPress={() => handleSelect(grade)}
            >
              <Text
                style={[
                  styles.gradeText,
                  textStyle,
                  active && [styles.gradeTextActive, activeTextStyle],
                  disabled && [styles.gradeTextDisabled, disabledTextStyle],
                ]}
              >
                {grade}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  gradeLabel: {
    alignSelf: 'flex-start',
    marginLeft: '10%',
    fontSize: 16,
    marginTop: 12,
    marginBottom: 4,
    color: themeVariables.whiteColor,
  },
  gradeRow: {
    flexDirection: 'row',
    width: '80%',
    borderWidth: 1,
    borderColor: themeVariables.primaryColor,
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 16,
    backgroundColor: themeVariables.whiteColor,
  },
  gradeButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  gradeButtonActive: {
    backgroundColor: themeVariables.primaryColor,
  },
  gradeText: {
    fontSize: 16,
    color: themeVariables.primaryColor,
  },
  gradeTextActive: {
    color: themeVariables.whiteColor,
  },
  gradeButtonDisabled: {
    backgroundColor: themeVariables.buttonDisabledBg,
  },
  gradeTextDisabled: {
    color: themeVariables.buttonDisabledText,
  },
});

export default GradeSelector;
