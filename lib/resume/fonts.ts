import { Font } from '@react-pdf/renderer';

let fontsRegistered = false;

// Use paths relative to the public directory for Turbopack compatibility
export function registerFonts() {
  if (fontsRegistered) return;
  
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
  
  fontsRegistered = true;
}
