import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import WelcomeScreen from '../screens/WelcomeScreen.jsx';

describe('WelcomeScreen sign in navigation', () => {
  it('navigates to GuestLogin from Continue as Guest', () => {
    const navigate = jest.fn();
    let instance;
    ReactTestRenderer.act(() => {
      instance = ReactTestRenderer.create(<WelcomeScreen navigation={{ navigate }} />);
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
      instance = ReactTestRenderer.create(<WelcomeScreen navigation={{ navigate }} />);
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
      instance = ReactTestRenderer.create(<WelcomeScreen navigation={{ navigate }} />);
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
      instance = ReactTestRenderer.create(<WelcomeScreen navigation={{ navigate }} />);
    });
    ReactTestRenderer.act(() => {
      instance.root.findByType(require('react-native').TouchableOpacity).props.onPress();
    });
    expect(navigate).toHaveBeenCalledWith('LSLogin');
  });
});
