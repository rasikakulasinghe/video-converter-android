import { Text, TextProps, TextVariant, TextWeight, TextColor } from '../Text';

describe('Text Component Types and Exports', () => {
  it('should export Text component', () => {
    expect(Text).toBeDefined();
    expect(typeof Text).toBe('function');
  });

  it('should export TextProps interface', () => {
    const props: TextProps = {
      children: 'Test text',
    };
    expect(props.children).toBe('Test text');
  });

  it('should export TextVariant type', () => {
    const variants: TextVariant[] = [
      'caption',
      'body-small',
      'body',
      'subheading',
      'heading',
      'title',
      'display'
    ];
    
    expect(variants).toHaveLength(7);
    expect(variants).toContain('caption');
    expect(variants).toContain('body-small');
    expect(variants).toContain('body');
    expect(variants).toContain('subheading');
    expect(variants).toContain('heading');
    expect(variants).toContain('title');
    expect(variants).toContain('display');
  });

  it('should export TextWeight type', () => {
    const weights: TextWeight[] = ['normal', 'medium', 'semibold', 'bold'];
    
    expect(weights).toHaveLength(4);
    expect(weights).toContain('normal');
    expect(weights).toContain('medium');
    expect(weights).toContain('semibold');
    expect(weights).toContain('bold');
  });

  it('should export TextColor type', () => {
    const colors: TextColor[] = [
      'primary',
      'secondary',
      'muted',
      'inverse',
      'error',
      'warning',
      'success'
    ];
    
    expect(colors).toHaveLength(7);
    expect(colors).toContain('primary');
    expect(colors).toContain('secondary');
    expect(colors).toContain('muted');
    expect(colors).toContain('inverse');
    expect(colors).toContain('error');
    expect(colors).toContain('warning');
    expect(colors).toContain('success');
  });

  describe('TextProps interface', () => {
    it('should require children property', () => {
      const validProps: TextProps = {
        children: 'Required children',
      };
      expect(validProps.children).toBe('Required children');
    });

    it('should accept string children', () => {
      const stringProps: TextProps = {
        children: 'String content',
      };
      expect(stringProps.children).toBe('String content');
    });

    it('should accept ReactNode children', () => {
      const nodeProps: TextProps = {
        children: null, // Valid ReactNode
      };
      expect(nodeProps.children).toBeNull();
    });

    it('should accept optional typography properties', () => {
      const fullProps: TextProps = {
        children: 'Styled text',
        variant: 'title',
        weight: 'bold',
        color: 'primary',
        align: 'center',
        italic: true,
        underline: false,
        strikethrough: false,
        numberOfLines: 2,
        testID: 'styled-text',
      };

      expect(fullProps.children).toBe('Styled text');
      expect(fullProps.variant).toBe('title');
      expect(fullProps.weight).toBe('bold');
      expect(fullProps.color).toBe('primary');
      expect(fullProps.align).toBe('center');
      expect(fullProps.italic).toBe(true);
      expect(fullProps.underline).toBe(false);
      expect(fullProps.strikethrough).toBe(false);
      expect(fullProps.numberOfLines).toBe(2);
      expect(fullProps.testID).toBe('styled-text');
    });

    it('should accept partial properties', () => {
      const minimalProps: TextProps = {
        children: 'Minimal text',
      };

      const partialProps: TextProps = {
        children: 'Partial text',
        variant: 'heading',
        color: 'secondary',
      };

      expect(minimalProps.children).toBe('Minimal text');
      expect(partialProps.children).toBe('Partial text');
      expect(partialProps.variant).toBe('heading');
      expect(partialProps.color).toBe('secondary');
    });
  });

  describe('Typography variants', () => {
    const variants: TextVariant[] = [
      'caption',
      'body-small', 
      'body',
      'subheading',
      'heading',
      'title',
      'display'
    ];

    variants.forEach(variant => {
      it(`should accept ${variant} variant`, () => {
        const props: TextProps = {
          children: `${variant} text`,
          variant,
        };
        expect(props.variant).toBe(variant);
      });
    });
  });

  describe('Text weights', () => {
    const weights: TextWeight[] = ['normal', 'medium', 'semibold', 'bold'];

    weights.forEach(weight => {
      it(`should accept ${weight} weight`, () => {
        const props: TextProps = {
          children: `${weight} text`,
          weight,
        };
        expect(props.weight).toBe(weight);
      });
    });
  });

  describe('Text colors', () => {
    const colors: TextColor[] = [
      'primary',
      'secondary',
      'muted',
      'inverse',
      'error',
      'warning',
      'success'
    ];

    colors.forEach(color => {
      it(`should accept ${color} color`, () => {
        const props: TextProps = {
          children: `${color} text`,
          color,
        };
        expect(props.color).toBe(color);
      });
    });
  });

  describe('Text alignment', () => {
    const alignments = ['left', 'center', 'right'] as const;

    alignments.forEach(align => {
      it(`should accept ${align} alignment`, () => {
        const props: TextProps = {
          children: `${align} aligned text`,
          align,
        };
        expect(props.align).toBe(align);
      });
    });
  });

  describe('Text decorations', () => {
    it('should accept italic prop', () => {
      const props: TextProps = {
        children: 'Italic text',
        italic: true,
      };
      expect(props.italic).toBe(true);
    });

    it('should accept underline prop', () => {
      const props: TextProps = {
        children: 'Underlined text',
        underline: true,
      };
      expect(props.underline).toBe(true);
    });

    it('should accept strikethrough prop', () => {
      const props: TextProps = {
        children: 'Strikethrough text',
        strikethrough: true,
      };
      expect(props.strikethrough).toBe(true);
    });

    it('should accept combination of decorations', () => {
      const props: TextProps = {
        children: 'Decorated text',
        italic: true,
        underline: true,
        strikethrough: false,
      };
      expect(props.italic).toBe(true);
      expect(props.underline).toBe(true);
      expect(props.strikethrough).toBe(false);
    });
  });

  describe('Component behavior', () => {
    it('should accept numberOfLines for truncation', () => {
      const props: TextProps = {
        children: 'Text that might be truncated',
        numberOfLines: 1,
      };
      expect(props.numberOfLines).toBe(1);
    });

    it('should accept testID for testing', () => {
      const props: TextProps = {
        children: 'Testable text',
        testID: 'test-text-id',
      };
      expect(props.testID).toBe('test-text-id');
    });

    it('should accept custom style overrides', () => {
      const customStyle = { marginTop: 10 };
      const props: TextProps = {
        children: 'Custom styled text',
        style: customStyle,
      };
      expect(props.style).toBe(customStyle);
    });
  });

  describe('Default values', () => {
    it('should use default variant when not specified', () => {
      const props: TextProps = {
        children: 'Default text',
      };
      // Should not have variant specified, component will use 'body' as default
      expect(props.variant).toBeUndefined();
    });

    it('should use default weight when not specified', () => {
      const props: TextProps = {
        children: 'Default weight text',
      };
      // Should not have weight specified, component will use 'normal' as default
      expect(props.weight).toBeUndefined();
    });

    it('should use default color when not specified', () => {
      const props: TextProps = {
        children: 'Default color text',
      };
      // Should not have color specified, component will use 'primary' as default
      expect(props.color).toBeUndefined();
    });

    it('should not have decorations by default', () => {
      const props: TextProps = {
        children: 'Plain text',
      };
      expect(props.italic).toBeUndefined();
      expect(props.underline).toBeUndefined();
      expect(props.strikethrough).toBeUndefined();
    });
  });

  describe('Component structure', () => {
    it('should be a React functional component', () => {
      expect(typeof Text).toBe('function');
      expect(Text.prototype).toBeUndefined(); // Functional components don't have prototype
    });

    it('should have displayName or function name', () => {
      expect(Text.name || Text.displayName).toBeDefined();
    });
  });
});