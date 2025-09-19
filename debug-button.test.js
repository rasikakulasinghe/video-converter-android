const React = require('react');
const renderer = require('react-test-renderer');

// Mock React Native components
jest.mock('react-native', () => ({
  Pressable: 'Pressable',
  Text: 'Text', 
  ActivityIndicator: 'ActivityIndicator',
  View: 'View'
}));

// Test the button component
describe('Button Debug', () => {
  it('should load', () => {
    const { Button } = require('./src/components/atoms/Button.tsx');
    console.log('Button loaded:', typeof Button);
    expect(typeof Button).toBe('function');
  });
});