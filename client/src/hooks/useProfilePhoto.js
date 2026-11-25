import { useCallback, useEffect, useState } from 'react';

export const useProfilePhoto = (loadPhoto, version) => {
  const [photoUrl, setPhotoUrl] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const refreshPhoto = useCallback(() => {
    setRefreshKey((key) => key + 1);
  }, []);

  useEffect(() => {
    let objectUrl;
    let cancelled = false;
    setPhotoUrl('');

    if (!version) return undefined;

    loadPhoto(refreshKey)
      .then((response) => {
        const contentType = response.headers['content-type'] || '';
        if (!contentType.startsWith('image/')) {
          throw new Error('The profile photo endpoint did not return an image.');
        }

        objectUrl = URL.createObjectURL(response.data);
        if (cancelled) {
          URL.revokeObjectURL(objectUrl);
          return;
        }
        setPhotoUrl(objectUrl);
      })
      .catch((error) => {
        console.error('Failed to load profile photo:', error);
      });

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [loadPhoto, refreshKey, version]);

  return [photoUrl, refreshPhoto];
};
