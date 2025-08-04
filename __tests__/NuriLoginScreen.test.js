import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  getAllKeys: jest.fn(() => Promise.resolve([])),
  multiGet: jest.fn(() => Promise.resolve([])),
  removeItem: jest.fn(() => Promise.resolve()),
  multiRemove: jest.fn(() => Promise.resolve()),
}), { virtual: true });
jest.mock('react-native-config', () => ({ DEV_API: 'http://localhost' }));
jest.mock('react-native-keychain', () => ({
  getGenericPassword: jest.fn(() => Promise.resolve({ username: 'user@example.com', password: 'secret' })),
  setGenericPassword: jest.fn(() => Promise.resolve()),
}), { virtual: true });

import NuriLoginScreen from '../screens/NuriLoginScreen.jsx';

it('prefills stored credentials', async () => {
  let instance;
  await ReactTestRenderer.act(async () => {
    instance = ReactTestRenderer.create(<NuriLoginScreen onSignIn={jest.fn()} />);
  });
  const emailInput = instance.root.findByProps({ placeholder: 'Email' });
  const passInput = instance.root.findByProps({ placeholder: 'Password' });
  expect(emailInput.props.value).toBe('user@example.com');
  expect(passInput.props.value).toBe('secret');
});
