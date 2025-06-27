import Config from 'react-native-config';

//Set the API URL
export const API_URL = Config.PROD_API;

// Removed debug log to prevent console output during tests
console.log(API_URL);
