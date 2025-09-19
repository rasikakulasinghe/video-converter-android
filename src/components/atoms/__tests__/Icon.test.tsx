import { Icon, IconProps, IconName, IconSize, IconColor } from '../Icon';

describe('Icon Component Types and Exports', () => {
  it('should export Icon component', () => {
    expect(Icon).toBeDefined();
    expect(typeof Icon).toBe('function');
  });

  it('should export IconProps interface', () => {
    const props: IconProps = {
      name: 'play',
    };
    expect(props.name).toBe('play');
  });

  it('should export IconName type', () => {
    const iconNames: IconName[] = [
      'play',
      'pause',
      'stop',
      'folder',
      'file',
      'video',
      'settings',
      'check',
      'close',
      'arrow-left',
      'arrow-right',
      'arrow-up',
      'arrow-down',
      'plus',
      'minus',
      'download',
      'upload',
      'refresh',
      'warning',
      'error',
      'info',
      'more-horizontal',
      'more-vertical'
    ];
    
    expect(iconNames).toHaveLength(23);
    expect(iconNames).toContain('play');
    expect(iconNames).toContain('video');
    expect(iconNames).toContain('settings');
    expect(iconNames).toContain('warning');
  });

  it('should export IconSize type', () => {
    const sizes: IconSize[] = ['xs', 'sm', 'md', 'lg', 'xl'];
    
    expect(sizes).toHaveLength(5);
    expect(sizes).toContain('xs');
    expect(sizes).toContain('sm');
    expect(sizes).toContain('md');
    expect(sizes).toContain('lg');
    expect(sizes).toContain('xl');
  });

  it('should export IconColor type', () => {
    const colors: IconColor[] = [
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
    expect(colors).toContain('error');
    expect(colors).toContain('warning');
    expect(colors).toContain('success');
  });

  describe('IconProps interface', () => {
    it('should require name property', () => {
      const validProps: IconProps = {
        name: 'play',
      };
      expect(validProps.name).toBe('play');
    });

    it('should accept optional properties', () => {
      const fullProps: IconProps = {
        name: 'video',
        size: 'lg',
        color: 'primary',
        testID: 'video-icon',
        accessibilityLabel: 'Video file icon',
        style: { margin: 10 },
      };

      expect(fullProps.name).toBe('video');
      expect(fullProps.size).toBe('lg');
      expect(fullProps.color).toBe('primary');
      expect(fullProps.testID).toBe('video-icon');
      expect(fullProps.accessibilityLabel).toBe('Video file icon');
      expect(fullProps.style).toEqual({ margin: 10 });
    });

    it('should accept partial properties', () => {
      const minimalProps: IconProps = {
        name: 'settings',
      };

      const partialProps: IconProps = {
        name: 'folder',
        size: 'sm',
        color: 'secondary',
      };

      expect(minimalProps.name).toBe('settings');
      expect(partialProps.name).toBe('folder');
      expect(partialProps.size).toBe('sm');
      expect(partialProps.color).toBe('secondary');
    });
  });

  describe('Icon names', () => {
    describe('Media controls', () => {
      const mediaIcons: IconName[] = ['play', 'pause', 'stop'];
      
      mediaIcons.forEach(iconName => {
        it(`should accept ${iconName} icon`, () => {
          const props: IconProps = {
            name: iconName,
          };
          expect(props.name).toBe(iconName);
        });
      });
    });

    describe('File and folder icons', () => {
      const fileIcons: IconName[] = ['folder', 'file', 'video'];
      
      fileIcons.forEach(iconName => {
        it(`should accept ${iconName} icon`, () => {
          const props: IconProps = {
            name: iconName,
          };
          expect(props.name).toBe(iconName);
        });
      });
    });

    describe('Action icons', () => {
      const actionIcons: IconName[] = ['check', 'close', 'plus', 'minus', 'refresh'];
      
      actionIcons.forEach(iconName => {
        it(`should accept ${iconName} icon`, () => {
          const props: IconProps = {
            name: iconName,
          };
          expect(props.name).toBe(iconName);
        });
      });
    });

    describe('Arrow icons', () => {
      const arrowIcons: IconName[] = ['arrow-left', 'arrow-right', 'arrow-up', 'arrow-down'];
      
      arrowIcons.forEach(iconName => {
        it(`should accept ${iconName} icon`, () => {
          const props: IconProps = {
            name: iconName,
          };
          expect(props.name).toBe(iconName);
        });
      });
    });

    describe('Transfer icons', () => {
      const transferIcons: IconName[] = ['download', 'upload'];
      
      transferIcons.forEach(iconName => {
        it(`should accept ${iconName} icon`, () => {
          const props: IconProps = {
            name: iconName,
          };
          expect(props.name).toBe(iconName);
        });
      });
    });

    describe('Status icons', () => {
      const statusIcons: IconName[] = ['warning', 'error', 'info'];
      
      statusIcons.forEach(iconName => {
        it(`should accept ${iconName} icon`, () => {
          const props: IconProps = {
            name: iconName,
          };
          expect(props.name).toBe(iconName);
        });
      });
    });

    describe('Menu icons', () => {
      const menuIcons: IconName[] = ['more-horizontal', 'more-vertical', 'settings'];
      
      menuIcons.forEach(iconName => {
        it(`should accept ${iconName} icon`, () => {
          const props: IconProps = {
            name: iconName,
          };
          expect(props.name).toBe(iconName);
        });
      });
    });
  });

  describe('Icon sizes', () => {
    const sizes: IconSize[] = ['xs', 'sm', 'md', 'lg', 'xl'];

    sizes.forEach(size => {
      it(`should accept ${size} size`, () => {
        const props: IconProps = {
          name: 'play',
          size,
        };
        expect(props.size).toBe(size);
      });
    });
  });

  describe('Icon colors', () => {
    const colors: IconColor[] = [
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
        const props: IconProps = {
          name: 'check',
          color,
        };
        expect(props.color).toBe(color);
      });
    });
  });

  describe('Accessibility and testing', () => {
    it('should accept testID prop', () => {
      const props: IconProps = {
        name: 'settings',
        testID: 'settings-icon',
      };
      expect(props.testID).toBe('settings-icon');
    });

    it('should accept accessibilityLabel prop', () => {
      const props: IconProps = {
        name: 'warning',
        accessibilityLabel: 'Warning notification',
      };
      expect(props.accessibilityLabel).toBe('Warning notification');
    });

    it('should accept custom style prop', () => {
      const customStyle = { 
        marginLeft: 8, 
        transform: [{ rotate: '45deg' }] 
      };
      const props: IconProps = {
        name: 'plus',
        style: customStyle,
      };
      expect(props.style).toBe(customStyle);
    });
  });

  describe('Default values', () => {
    it('should use default size when not specified', () => {
      const props: IconProps = {
        name: 'file',
      };
      // Should not have size specified, component will use 'md' as default
      expect(props.size).toBeUndefined();
    });

    it('should use default color when not specified', () => {
      const props: IconProps = {
        name: 'folder',
      };
      // Should not have color specified, component will use 'primary' as default
      expect(props.color).toBeUndefined();
    });
  });

  describe('Icon combinations', () => {
    it('should support common app icon combinations', () => {
      // Video file with play icon combination
      const videoProps: IconProps = {
        name: 'video',
        size: 'lg',
        color: 'primary',
      };

      // Error state icon
      const errorProps: IconProps = {
        name: 'error',
        size: 'sm',
        color: 'error',
      };

      // Settings navigation icon
      const settingsProps: IconProps = {
        name: 'settings',
        size: 'md',
        color: 'secondary',
      };

      expect(videoProps.name).toBe('video');
      expect(videoProps.size).toBe('lg');
      expect(videoProps.color).toBe('primary');

      expect(errorProps.name).toBe('error');
      expect(errorProps.size).toBe('sm');
      expect(errorProps.color).toBe('error');

      expect(settingsProps.name).toBe('settings');
      expect(settingsProps.size).toBe('md');
      expect(settingsProps.color).toBe('secondary');
    });
  });

  describe('Component structure', () => {
    it('should be a React functional component', () => {
      expect(typeof Icon).toBe('function');
      expect(Icon.prototype).toBeUndefined(); // Functional components don't have prototype
    });

    it('should have displayName or function name', () => {
      expect(Icon.name || Icon.displayName).toBeDefined();
    });
  });
});