/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
jest.mock(
  '@react-native-async-storage/async-storage',
  () => ({
    getItem: jest.fn(() => Promise.resolve(null)),
    setItem: jest.fn(() => Promise.resolve()),
    getAllKeys: jest.fn(() => Promise.resolve([])),
    multiGet: jest.fn(() => Promise.resolve([])),
    removeItem: jest.fn(() => Promise.resolve()),
    multiRemove: jest.fn(() => Promise.resolve()),
  }),
  { virtual: true },
);
jest.mock('react-native-config', () => ({ DEV_API: 'http://localhost' }));
jest.mock('react-native-fast-image', () => {
  const React = require('react');
  const FastImage = props => React.createElement('FastImage', props);
  FastImage.preload = jest.fn();
  return FastImage;
}, { virtual: true });
// Mock external styleguide UI library
jest.mock('liquid-spirit-styleguide', () => {
  const React = require('react');
  const { Text, TouchableOpacity } = require('react-native');
  const Button = ({ label, onPress, disabled, style }) => (
    React.createElement(
      TouchableOpacity,
      { onPress, disabled, style },
      React.createElement(Text, null, label)
    )
  );
  return { Button };
}, { virtual: true });

import App from '../App';

test('renders correctly', async () => {
  await ReactTestRenderer.act(() => {
    ReactTestRenderer.create(<App />);
  });
});
