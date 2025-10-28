import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
jest.mock('liquid-spirit-styleguide', () => {
  const React = require('react');
  const Button = ({ label, onPress, ...props }) =>
    React.createElement('Button', { label, onPress, ...props });
  return { Button };
}, { virtual: true });
import Start from '../src/modules/auth/screens/Start.jsx';

describe('Start sign in navigation', () => {
  it('navigates to GuestLogin from Continue as Guest', () => {
    const navigate = jest.fn();
    let instance;
    ReactTestRenderer.act(() => {
      instance = ReactTestRenderer.create(<Start navigation={{ navigate }} />);
    });
    ReactTestRenderer.act(() => {
      instance.root.findByProps({ label: 'Continue as Guest' }).props.onPress();
    });
    expect(navigate).toHaveBeenCalledWith('GuestLogin');
  });

  it('navigates to NuriRegister from Register button', () => {
    const navigate = jest.fn();
    let instance;
    ReactTestRenderer.act(() => {
      instance = ReactTestRenderer.create(<Start navigation={{ navigate }} />);
    });
    ReactTestRenderer.act(() => {
      instance.root.findByProps({ label: 'Register' }).props.onPress();
    });
    expect(navigate).toHaveBeenCalledWith('NuriRegister');
  });

  it('navigates to NuriLogin from Login button', () => {
    const navigate = jest.fn();
    let instance;
    ReactTestRenderer.act(() => {
      instance = ReactTestRenderer.create(<Start navigation={{ navigate }} />);
    });
    ReactTestRenderer.act(() => {
      instance.root.findByProps({ label: 'Login' }).props.onPress();
    });
    expect(navigate).toHaveBeenCalledWith('NuriLogin');
  });

  it('navigates to LSLogin from Liquid Spirit button', () => {
    const navigate = jest.fn();
    let instance;
    ReactTestRenderer.act(() => {
      instance = ReactTestRenderer.create(<Start navigation={{ navigate }} />);
    });
    ReactTestRenderer.act(() => {
      instance.root.findByType(require('react-native').TouchableOpacity).props.onPress();
    });
    expect(navigate).toHaveBeenCalledWith('LSLogin');
  });
});
