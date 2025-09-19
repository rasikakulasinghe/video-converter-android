import { Button, ButtonProps, ButtonVariant, ButtonSize } from '../Button';

describe('Button Component Types and Exports', () => {
  it('should export Button component', () => {
    expect(Button).toBeDefined();
    expect(typeof Button).toBe('function');
  });

  it('should export ButtonProps interface', () => {
    // Test that ButtonProps can be used as a type
    const props: ButtonProps = {
      children: 'Test',
    };
    expect(props.children).toBe('Test');
  });

  it('should export ButtonVariant type', () => {
    // Test that ButtonVariant accepts valid values
    const primaryVariant: ButtonVariant = 'primary';
    const secondaryVariant: ButtonVariant = 'secondary';
    const outlineVariant: ButtonVariant = 'outline';
    const ghostVariant: ButtonVariant = 'ghost';
    const destructiveVariant: ButtonVariant = 'destructive';

    expect(primaryVariant).toBe('primary');
    expect(secondaryVariant).toBe('secondary');
    expect(outlineVariant).toBe('outline');
    expect(ghostVariant).toBe('ghost');
    expect(destructiveVariant).toBe('destructive');
  });

  it('should export ButtonSize type', () => {
    // Test that ButtonSize accepts valid values
    const smSize: ButtonSize = 'sm';
    const mdSize: ButtonSize = 'md';
    const lgSize: ButtonSize = 'lg';
    const xlSize: ButtonSize = 'xl';

    expect(smSize).toBe('sm');
    expect(mdSize).toBe('md');
    expect(lgSize).toBe('lg');
    expect(xlSize).toBe('xl');
  });

  describe('ButtonProps interface', () => {
    it('should require children property', () => {
      const validProps: ButtonProps = {
        children: 'Required children',
      };
      expect(validProps.children).toBe('Required children');
    });

    it('should accept optional properties', () => {
      const fullProps: ButtonProps = {
        children: 'Button Text',
        variant: 'primary',
        size: 'md',
        disabled: false,
        loading: false,
        fullWidth: false,
        leftIcon: undefined,
        rightIcon: undefined,
        accessibilityLabel: 'Test button',
        testID: 'test-button',
        onPress: () => {},
      };

      expect(fullProps.children).toBe('Button Text');
      expect(fullProps.variant).toBe('primary');
      expect(fullProps.size).toBe('md');
      expect(fullProps.disabled).toBe(false);
      expect(fullProps.loading).toBe(false);
      expect(fullProps.fullWidth).toBe(false);
      expect(fullProps.accessibilityLabel).toBe('Test button');
      expect(fullProps.testID).toBe('test-button');
      expect(typeof fullProps.onPress).toBe('function');
    });

    it('should accept partial properties', () => {
      const minimalProps: ButtonProps = {
        children: 'Minimal Button',
      };

      const partialProps: ButtonProps = {
        children: 'Partial Button',
        variant: 'secondary',
        size: 'lg',
      };

      expect(minimalProps.children).toBe('Minimal Button');
      expect(partialProps.children).toBe('Partial Button');
      expect(partialProps.variant).toBe('secondary');
      expect(partialProps.size).toBe('lg');
    });
  });

  describe('Type safety', () => {
    it('should enforce valid variant values', () => {
      // These should compile without errors
      const validVariants: ButtonVariant[] = [
        'primary',
        'secondary', 
        'outline',
        'ghost',
        'destructive'
      ];
      
      expect(validVariants).toHaveLength(5);
      expect(validVariants).toContain('primary');
      expect(validVariants).toContain('secondary');
      expect(validVariants).toContain('outline');
      expect(validVariants).toContain('ghost');
      expect(validVariants).toContain('destructive');
    });

    it('should enforce valid size values', () => {
      // These should compile without errors
      const validSizes: ButtonSize[] = [
        'sm',
        'md',
        'lg', 
        'xl'
      ];
      
      expect(validSizes).toHaveLength(4);
      expect(validSizes).toContain('sm');
      expect(validSizes).toContain('md');
      expect(validSizes).toContain('lg');
      expect(validSizes).toContain('xl');
    });
  });

  describe('Component structure', () => {
    it('should be a React functional component', () => {
      expect(typeof Button).toBe('function');
      expect(Button.prototype).toBeUndefined(); // Functional components don't have prototype
    });

    it('should have displayName or function name', () => {
      expect(Button.name || Button.displayName).toBeDefined();
    });
  });
});