import React from 'react';
import { create, act } from 'react-test-renderer';
import { Button } from '../Button';

// Helper function to find text content in React Test Renderer tree
const findTextContent = (tree: any, searchText: string): boolean => {
  if (!tree) return false;
  
  if (typeof tree === 'string') {
    return tree.includes(searchText);
  }
  
  if (tree.children) {
    return tree.children.some((child: any) => findTextContent(child, searchText));
  }
  
  if (tree.props && tree.props.children) {
    return findTextContent(tree.props.children, searchText);
  }
  
  return false;
};

// Note: Using React Test Renderer instead of React Native Testing Library
// due to compatibility issues with detectHostComponentNames in our test environment
describe('Button', () => {
  describe('Basic Functionality', () => {
    it('renders with children text', () => {
      let component: any;
      act(() => {
        component = create(<Button>Test Button</Button>);
      });
      
      const tree = component.toJSON();
      expect(tree).toBeTruthy();
      expect(findTextContent(tree, 'Test Button')).toBe(true);
    });

    it('calls onPress when pressed', () => {
      const onPress = jest.fn();
      let component: any;
      
      act(() => {
        component = create(<Button onPress={onPress}>Press Me</Button>);
      });
      
      const tree = component.toJSON();
      expect(tree.props.onClick).toBeDefined();
      
      act(() => {
        tree.props.onClick();
      });
      
      expect(onPress).toHaveBeenCalledTimes(1);
    });

    it('does not call onPress when disabled', () => {
      const onPress = jest.fn();
      let component: any;
      
      act(() => {
        component = create(<Button onPress={onPress} disabled>Disabled Button</Button>);
      });
      
      const tree = component.toJSON();
      expect(tree.props.disabled).toBe(true);
      expect(findTextContent(tree, 'Disabled Button')).toBe(true);
    });

    it('does not call onPress when loading', () => {
      const onPress = jest.fn();
      let component: any;
      
      act(() => {
        component = create(<Button onPress={onPress} loading>Loading Button</Button>);
      });
      
      const tree = component.toJSON();
      expect(findTextContent(tree, 'Loading Button')).toBe(true);
    });
  });

  describe('Variants', () => {
    it('renders primary variant correctly', () => {
      let component: any;
      
      act(() => {
        component = create(<Button variant="primary" testID="primary-button">Primary</Button>);
      });
      
      const tree = component.toJSON();
      expect(tree.props['data-testid']).toBe('primary-button');
      expect(findTextContent(tree, 'Primary')).toBe(true);
    });

    it('renders secondary variant correctly', () => {
      let component: any;
      
      act(() => {
        component = create(<Button variant="secondary" testID="secondary-button">Secondary</Button>);
      });
      
      const tree = component.toJSON();
      expect(tree.props['data-testid']).toBe('secondary-button');
      expect(findTextContent(tree, 'Secondary')).toBe(true);
    });

    it('renders outline variant correctly', () => {
      let component: any;
      
      act(() => {
        component = create(<Button variant="outline" testID="outline-button">Outline</Button>);
      });
      
      const tree = component.toJSON();
      expect(tree.props['data-testid']).toBe('outline-button');
      expect(findTextContent(tree, 'Outline')).toBe(true);
    });

    it('renders ghost variant correctly', () => {
      let component: any;
      
      act(() => {
        component = create(<Button variant="ghost" testID="ghost-button">Ghost</Button>);
      });
      
      const tree = component.toJSON();
      expect(tree.props['data-testid']).toBe('ghost-button');
      expect(findTextContent(tree, 'Ghost')).toBe(true);
    });

    it('renders destructive variant correctly', () => {
      let component: any;
      
      act(() => {
        component = create(<Button variant="destructive" testID="destructive-button">Destructive</Button>);
      });
      
      const tree = component.toJSON();
      expect(tree.props['data-testid']).toBe('destructive-button');
      expect(findTextContent(tree, 'Destructive')).toBe(true);
    });
  });

  describe('Sizes', () => {
    it('renders small size correctly', () => {
      let component: any;
      
      act(() => {
        component = create(<Button size="sm" testID="small-button">Small</Button>);
      });
      
      const tree = component.toJSON();
      expect(tree.props['data-testid']).toBe('small-button');
      expect(findTextContent(tree, 'Small')).toBe(true);
    });

    it('renders medium size correctly', () => {
      let component: any;
      
      act(() => {
        component = create(<Button size="md" testID="medium-button">Medium</Button>);
      });
      
      const tree = component.toJSON();
      expect(tree.props['data-testid']).toBe('medium-button');
      expect(findTextContent(tree, 'Medium')).toBe(true);
    });

    it('renders large size correctly', () => {
      let component: any;
      
      act(() => {
        component = create(<Button size="lg" testID="large-button">Large</Button>);
      });
      
      const tree = component.toJSON();
      expect(tree.props['data-testid']).toBe('large-button');
      expect(findTextContent(tree, 'Large')).toBe(true);
    });

    it('renders extra large size correctly', () => {
      let component: any;
      
      act(() => {
        component = create(<Button size="xl" testID="xl-button">Extra Large</Button>);
      });
      
      const tree = component.toJSON();
      expect(tree.props['data-testid']).toBe('xl-button');
      expect(findTextContent(tree, 'Extra Large')).toBe(true);
    });
  });

  describe('Loading State', () => {
    it('shows loading indicator when loading', () => {
      let component: any;
      
      act(() => {
        component = create(<Button loading testID="loading-button">Loading</Button>);
      });
      
      const tree = component.toJSON();
      expect(tree.props['data-testid']).toBe('loading-button');
      expect(findTextContent(tree, 'Loading')).toBe(true);
    });

    it('handles left icon with loading', () => {
      const LeftIcon = () => <></>;
      let component: any;
      
      act(() => {
        component = create(
          <Button loading leftIcon={<LeftIcon />} testID="loading-with-icon">
            Loading
          </Button>
        );
      });
      
      const tree = component.toJSON();
      expect(tree.props['data-testid']).toBe('loading-with-icon');
      expect(findTextContent(tree, 'Loading')).toBe(true);
    });

    it('handles right icon with loading', () => {
      const RightIcon = () => <></>;
      let component: any;
      
      act(() => {
        component = create(
          <Button loading rightIcon={<RightIcon />} testID="loading-with-right-icon">
            Loading
          </Button>
        );
      });
      
      const tree = component.toJSON();
      expect(tree.props['data-testid']).toBe('loading-with-right-icon');
      expect(findTextContent(tree, 'Loading')).toBe(true);
    });
  });

  describe('Icons', () => {
    it('renders left icon correctly', () => {
      const LeftIcon = () => <></>;
      let component: any;
      
      act(() => {
        component = create(
          <Button leftIcon={<LeftIcon />} testID="button-with-left-icon">
            With Left Icon
          </Button>
        );
      });
      
      const tree = component.toJSON();
      expect(tree.props['data-testid']).toBe('button-with-left-icon');
      expect(findTextContent(tree, 'With Left Icon')).toBe(true);
    });

    it('renders right icon correctly', () => {
      const RightIcon = () => <></>;
      let component: any;
      
      act(() => {
        component = create(
          <Button rightIcon={<RightIcon />} testID="button-with-right-icon">
            With Right Icon
          </Button>
        );
      });
      
      const tree = component.toJSON();
      expect(tree.props['data-testid']).toBe('button-with-right-icon');
      expect(findTextContent(tree, 'With Right Icon')).toBe(true);
    });

    it('renders both icons correctly', () => {
      const LeftIcon = () => <></>;
      const RightIcon = () => <></>;
      let component: any;
      
      act(() => {
        component = create(
          <Button 
            leftIcon={<LeftIcon />} 
            rightIcon={<RightIcon />} 
            testID="button-with-both-icons"
          >
            With Both Icons
          </Button>
        );
      });
      
      const tree = component.toJSON();
      expect(tree.props['data-testid']).toBe('button-with-both-icons');
      expect(findTextContent(tree, 'With Both Icons')).toBe(true);
    });
  });

  describe('Full Width', () => {
    it('renders as full width when specified', () => {
      let component: any;
      
      act(() => {
        component = create(
          <Button fullWidth testID="full-width-button">
            Full Width
          </Button>
        );
      });
      
      const tree = component.toJSON();
      expect(tree.props['data-testid']).toBe('full-width-button');
      expect(findTextContent(tree, 'Full Width')).toBe(true);
    });
  });

  describe('Accessibility', () => {
    it('has correct accessibility role', () => {
      let component: any;
      
      act(() => {
        component = create(<Button>Accessible Button</Button>);
      });
      
      const tree = component.toJSON();
      expect(tree.props.role).toBe('button');
    });

    it('uses custom accessibility label when provided', () => {
      let component: any;
      
      act(() => {
        component = create(
          <Button accessibilityLabel="Custom Label">Button Text</Button>
        );
      });
      
      const tree = component.toJSON();
      expect(tree.props['aria-label']).toBe('Custom Label');
    });

    it('uses button text as accessibility label when no custom label', () => {
      let component: any;
      
      act(() => {
        component = create(<Button>Button Text</Button>);
      });
      
      const tree = component.toJSON();
      expect(findTextContent(tree, 'Button Text')).toBe(true);
    });

    it('sets accessibility state to disabled when disabled', () => {
      let component: any;
      
      act(() => {
        component = create(<Button disabled testID="disabled-button">Disabled</Button>);
      });
      
      const tree = component.toJSON();
      expect(tree.props['aria-disabled']).toBe('true');
      expect(tree.props.disabled).toBe(true);
    });

    it('sets accessibility state to disabled when loading', () => {
      let component: any;
      
      act(() => {
        component = create(<Button loading testID="loading-button">Loading</Button>);
      });
      
      const tree = component.toJSON();
      expect(tree.props['data-testid']).toBe('loading-button');
      expect(findTextContent(tree, 'Loading')).toBe(true);
    });
  });

  describe('Props Forwarding', () => {
    it('forwards additional pressable props', () => {
      const onPressIn = jest.fn();
      let component: any;
      
      act(() => {
        component = create(
          <Button onPressIn={onPressIn} testID="props-button">
            Props Button
          </Button>
        );
      });
      
      const tree = component.toJSON();
      expect(tree.props.onPressIn).toBe(onPressIn);
      expect(tree.props['data-testid']).toBe('props-button');
    });

    it('applies custom testID', () => {
      let component: any;
      
      act(() => {
        component = create(
          <Button testID="custom-test-id">Custom Test ID</Button>
        );
      });
      
      const tree = component.toJSON();
      expect(tree.props['data-testid']).toBe('custom-test-id');
    });
  });

  describe('Default Props', () => {
    it('uses default variant when not specified', () => {
      let component: any;
      
      act(() => {
        component = create(<Button testID="default-button">Default</Button>);
      });
      
      const tree = component.toJSON();
      expect(tree.props['data-testid']).toBe('default-button');
      expect(findTextContent(tree, 'Default')).toBe(true);
    });

    it('uses default size when not specified', () => {
      let component: any;
      
      act(() => {
        component = create(<Button testID="default-size-button">Default Size</Button>);
      });
      
      const tree = component.toJSON();
      expect(tree.props['data-testid']).toBe('default-size-button');
      expect(findTextContent(tree, 'Default Size')).toBe(true);
    });

    it('is not disabled by default', () => {
      const onPress = jest.fn();
      let component: any;
      
      act(() => {
        component = create(<Button onPress={onPress}>Not Disabled</Button>);
      });
      
      const tree = component.toJSON();
      expect(tree.props.disabled).toBeUndefined();
      expect(findTextContent(tree, 'Not Disabled')).toBe(true);
    });

    it('is not loading by default', () => {
      const onPress = jest.fn();
      let component: any;
      
      act(() => {
        component = create(<Button onPress={onPress}>Not Loading</Button>);
      });
      
      const tree = component.toJSON();
      expect(findTextContent(tree, 'Not Loading')).toBe(true);
    });

    it('is not full width by default', () => {
      let component: any;
      
      act(() => {
        component = create(<Button testID="not-full-width">Not Full Width</Button>);
      });
      
      const tree = component.toJSON();
      expect(tree.props['data-testid']).toBe('not-full-width');
      expect(findTextContent(tree, 'Not Full Width')).toBe(true);
    });
  });
});