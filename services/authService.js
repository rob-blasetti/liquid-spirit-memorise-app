export const signInWithLiquidSpirit = async () => {
  try {
    // Placeholder API call - not functional yet
    await fetch('https://example.com/api/signin');
    // Return dummy user data
    return { name: 'Liquid Spirit User', grade: 1 };
  } catch (e) {
    console.error('Sign in failed', e);
    throw e;
  }
};
