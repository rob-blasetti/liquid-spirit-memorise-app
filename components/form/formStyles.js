import { StyleSheet } from 'react-native';
import themeVariables from '../../styles/theme';

const formStyles = StyleSheet.create({
  fieldContainer: {
    width: '100%',
    alignItems: 'center',
  },
  label: {
    alignSelf: 'flex-start',
    width: '80%',
    marginLeft: '10%',
    marginBottom: 4,
    marginTop: 8,
    color: themeVariables.whiteColor,
    fontSize: 14,
  },
  input: {
    width: '80%',
    padding: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: themeVariables.whiteColor,
    borderColor: themeVariables.primaryColor,
  },
});

export default formStyles;
