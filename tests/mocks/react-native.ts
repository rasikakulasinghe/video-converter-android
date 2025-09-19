import React from 'react';

export const Pressable = (props: any) => {
  const { children, onPress, testID, style, ...restProps } = props;
  
  // Handle style as function (React Native pattern for pressed state)
  let computedStyle = style;
  if (typeof style === 'function') {
    computedStyle = style({ pressed: false });
  }
  
  return React.createElement('button', {
    'data-testid': testID,
    onClick: onPress,
    style: computedStyle,
    ...restProps
  }, children);
};

export const Text = (props: any) => {
  const { children, testID, ...restProps } = props;
  return React.createElement('span', {
    'data-testid': testID,
    ...restProps
  }, children);
};

export const View = (props: any) => {
  const { children, testID, ...restProps } = props;
  return React.createElement('div', {
    'data-testid': testID,
    ...restProps
  }, children);
};

export const ActivityIndicator = (props: any) => {
  const { testID, ...restProps } = props;
  return React.createElement('div', {
    'data-testid': testID,
    ...restProps
  }, 'Loading...');
};

export const Platform = {
  OS: 'android' as const,
  Version: 30,
  select: jest.fn((spec: any) => spec.android || spec.default),
  isTV: false,
  isTesting: true,
};

export const StyleSheet = {
  create: jest.fn((styles) => styles),
  flatten: jest.fn((style) => style),
  compose: jest.fn((style1, style2) => [style1, style2]),
  hairlineWidth: 1,
};

export default {
  Pressable,
  Text,
  View,
  ActivityIndicator,
  Platform,
  StyleSheet,
};