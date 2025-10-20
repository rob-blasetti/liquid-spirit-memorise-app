import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
jest.mock('../services/authService', () => ({
  loginNuriUser: jest.fn(),
}));
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
jest.mock('liquid-spirit-styleguide', () => {
  const React = require('react');
  const Button = ({ label, onPress, ...props }) =>
    React.createElement('Button', { label, onPress, ...props });
  return { Button };
}, { virtual: true });

import Login from '../screens/auth/Login.jsx';
import { loginNuriUser } from '../services/authService';

beforeEach(() => {
  loginNuriUser.mockReset();
});

it('prefills stored credentials', async () => {
  let instance;
  await ReactTestRenderer.act(async () => {
    instance = ReactTestRenderer.create(<Login onSignIn={jest.fn()} />);
  });
  const emailInput = instance.root.findByProps({ placeholder: 'Email' });
  const passInput = instance.root.findByProps({ placeholder: 'Password' });
  expect(emailInput.props.value).toBe('user@example.com');
  expect(passInput.props.value).toBe('secret');
});

it('shows a helpful error message when credentials are incorrect', async () => {
  const signInSpy = jest.fn();
  const authError = Object.assign(new Error('Incorrect password'), { status: 401 });
  loginNuriUser.mockRejectedValueOnce(authError);

  let instance;
  await ReactTestRenderer.act(async () => {
    instance = ReactTestRenderer.create(<Login onSignIn={signInSpy} />);
  });

  const loginButton = instance.root.findByProps({ label: 'Log In' });
  await ReactTestRenderer.act(async () => {
    await loginButton.props.onPress();
  });

  expect(loginNuriUser).toHaveBeenCalledWith('user@example.com', 'secret');
  const collectText = node => {
    if (!node) {
      return [];
    }
    if (typeof node === 'string') {
      return [node];
    }
    if (Array.isArray(node)) {
      return node.flatMap(collectText);
    }
    return collectText(node.children);
  };
  const messages = collectText(instance.toJSON());
  expect(messages).toContain('Incorrect username/email or password.');
  expect(signInSpy).not.toHaveBeenCalled();
});

it('informs the user when the account cannot be found', async () => {
  const signInSpy = jest.fn();
  const notFoundError = Object.assign(new Error('User not found'), { status: 404 });
  loginNuriUser.mockRejectedValueOnce(notFoundError);

  let instance;
  await ReactTestRenderer.act(async () => {
    instance = ReactTestRenderer.create(<Login onSignIn={signInSpy} />);
  });

  const loginButton = instance.root.findByProps({ label: 'Log In' });
  await ReactTestRenderer.act(async () => {
    await loginButton.props.onPress();
  });

  expect(loginNuriUser).toHaveBeenCalledWith('user@example.com', 'secret');
  const collectText = node => {
    if (!node) {
      return [];
    }
    if (typeof node === 'string') {
      return [node];
    }
    if (Array.isArray(node)) {
      return node.flatMap(collectText);
    }
    return collectText(node.children);
  };
  const messages = collectText(instance.toJSON());
  const notFoundCopy = "We couldn't find an account with that username/email.";
  expect(messages).toContain(notFoundCopy);
  expect(signInSpy).not.toHaveBeenCalled();
});
