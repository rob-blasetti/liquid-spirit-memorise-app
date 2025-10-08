import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput } from 'react-native';
import { Button } from 'liquid-spirit-styleguide';
import { signInWithLiquidSpirit, loginGuest, registerGuest } from '../services/authService';
import { useUser } from '../contexts/UserContext';
import themeVariables from '../styles/theme';

const StartScreen = ({ onSignIn }) => {
  const [mode, setMode] = useState('menu');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  // For Liquid Spirit login
  const [lsEmail, setLsEmail] = useState('');
  const { setUser, setClasses, setFamily, setChildren } = useUser();

  // Common post-auth context update
  const handleAuthSuccess = (data, isGuest = false) => {
    // Set authenticated user and family in context
    setUser(data);
    setFamily(data.family);
    // Determine raw children list from data.children or data.nuriUsers (for LS login)
    const rawChildren = Array.isArray(data.children)
      ? data.children
      : Array.isArray(data.nuriUsers)
      ? data.nuriUsers
      : [];
    if (rawChildren.length > 0) {
      // Map children entries for context: { child, classes }
      const childrenEntries = rawChildren.map(child => {
        // Derive grade if available on child or from curriculumLesson
        let grade = child.grade;
        if (grade == null && Array.isArray(child.classes)) {
          const cls = child.classes.find(c => c.curriculumLesson && c.curriculumLesson.grade != null);
          grade = cls?.curriculumLesson?.grade;
        }
        // Include grade on child object
        const childWithGrade = { ...child, grade };
        return {
          child: childWithGrade,
          classes: Array.isArray(child.classes) ? child.classes : [],
        };
      });
      setChildren(childrenEntries);
      const allClasses = childrenEntries.reduce((acc, c) => {
        if (Array.isArray(c.classes)) acc.push(...c.classes);
        return acc;
      }, []);
      setClasses(allClasses);
    } else {
      setChildren([]);
      setClasses([]);
    }
    // Trigger sign-in callback with children for profile setup
    onSignIn({ ...data, guest: isGuest, children: rawChildren });
  };

  const handleGuestLogin = async () => {
    try {
      const data = await loginGuest(username, password);
      handleAuthSuccess(data, true);
    } catch (e) {
      console.error('Guest login failed:', e);
    }
  };

  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState('');
  const handleGuestRegister = async () => {
    if (password !== confirmPassword) return;
    setRegError('');
    setRegLoading(true);
    try {
      const data = await registerGuest(username, password);
      handleAuthSuccess(data, true);
    } catch (e) {
      console.error('Guest registration failed:', e);
      setRegError(e.message || 'Registration failed');
    } finally {
      setRegLoading(false);
    }
  };

  const handleLSLogin = async () => {
    try {
      const data = await signInWithLiquidSpirit(lsEmail, password);
      handleAuthSuccess(data, false);
    } catch (e) {
      console.error('LS login failed:', e);
    }
  };

  // Render based on mode
  if (mode === 'login') {
    return (
      <View style={styles.container}>
        <Text style={styles.heading}>Login</Text>
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Username</Text>
          <TextInput
            style={styles.input}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />
        </View>
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Password</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
          />
        </View>
        <View style={styles.buttonRow}>
          <View style={styles.buttonContainer}>
            <Button secondary label='Back' onPress={() => setMode('menu')} />
          </View>
          <View style={styles.buttonContainer}>
            <Button
              primary
              label='Submit'
              onPress={handleGuestLogin}
              style={styles.submitButton}
            />
          </View>
        </View>
      </View>
    );
  }
  if (mode === 'register') {
    return (
      <View style={styles.container}>
        <Text style={styles.heading}>Register</Text>
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Username</Text>
          <TextInput
            style={styles.input}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />
        </View>
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Password</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
          />
        </View>
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Confirm Password</Text>
          <TextInput
            style={styles.input}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            autoCapitalize="none"
          />
        </View>
        {regError ? <Text style={styles.errorText}>{regError}</Text> : null}
        <View style={styles.buttonRow}>
          <View style={styles.buttonContainer}>
            <Button secondary label="Back" onPress={() => setMode('menu')} />
          </View>
          <View style={styles.buttonContainer}>
            <Button
              primary
              label={regLoading ? 'Registering...' : 'Submit'}
              onPress={handleGuestRegister}
              disabled={regLoading}
              style={styles.submitButton}
            />
          </View>
        </View>
      </View>
    );
  }
  if (mode === 'lsLogin') {
    return (
      <View style={styles.container}>
        <Text style={styles.heading}>Liquid Spirit Login</Text>
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Email</Text>
          <TextInput
            style={styles.input}
            value={lsEmail}
            onChangeText={setLsEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Password</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
          />
        </View>
        <View style={styles.buttonRow}>
          <View style={styles.buttonContainer}>
            <Button secondary label="Back" onPress={() => setMode('menu')} />
          </View>
          <View style={styles.buttonContainer}>
            <Button
              primary
              label="Submit"
              onPress={handleLSLogin}
              style={styles.submitButton}
            />
          </View>
        </View>
      </View>
    );
  }
  // Menu
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Nuri</Text>
      <View style={styles.menuRow}>
        <Button
          secondary
          label="Login"
          onPress={() => { setUsername(''); setPassword(''); setMode('login'); }}
        />
        <Button
          secondary
          label="Register"
          onPress={() => { setUsername(''); setPassword(''); setConfirmPassword(''); setMode('register'); }}
        />
      </View>
      <Button
        secondary
        label="Login with Liquid Spirit"
        onPress={() => { setLsEmail(''); setPassword(''); setMode('lsLogin'); }}
        style={styles.lsButton}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: 16,
    backgroundColor: themeVariables.primaryColor,
  },
  heading: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 16,
    color: themeVariables.whiteColor,
  },
  inputContainer: {
    width: '80%',
    marginVertical: 8,
  },
  inputLabel: {
    color: themeVariables.whiteColor,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  input: {
    width: '100%',
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 8,
    backgroundColor: themeVariables.whiteColor,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
    marginTop: 16,
  },
  buttonContainer: {
    flex: 1,
    marginHorizontal: 8,
  },
  menuRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
    marginTop: 16,
  },
  lsButton: {
    marginTop: 32,
  },
  submitButton: {
    borderWidth: 1,
    borderColor: themeVariables.whiteColor,
  },
  errorText: {
    color: themeVariables.redColor || 'red',
    marginBottom: 8,
    textAlign: 'center',
  },
});

export default StartScreen;
