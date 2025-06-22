import { Font } from '@react-pdf/renderer';

// Use paths relative to the public directory for Turbopack compatibility
export function registerFonts() {
  // Register Inter font family
  Font.register({
    family: 'Inter',
    fonts: [
      {
        src: '/fonts/Inter-Regular.ttf',
        fontWeight: 400,
      },
      {
        src: '/fonts/Inter-SemiBold.ttf',
        fontWeight: 600,
      },
      {
        src: '/fonts/Inter-Bold.ttf',
        fontWeight: 700,
      },
    ],
  });
}
