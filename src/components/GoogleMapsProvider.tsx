/** Using in src/app/layout.tsx
 * [GLOBAL]
 * To: load GG Maps SDK one time, for all page in project
 */
'use client';

import { LoadScript } from '@react-google-maps/api';

// Get API key
const googleApiKey = process.env.NEXT_PUBLIC_GG_MAPS_KEY as string;

export default function GoogleMapsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LoadScript googleMapsApiKey={googleApiKey} libraries={['places']}>
      {children}
    </LoadScript>
  );
}
