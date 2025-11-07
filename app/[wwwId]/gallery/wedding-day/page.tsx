'use client';
import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function WeddingDayRedirect() {
  const params = useParams();
  const router = useRouter();
  const wwwId = params?.wwwId as string;

  useEffect(() => {
    if (wwwId) {
      router.replace(`/${wwwId}/gallery/album/wedding-day`);
    }
  }, [wwwId, router]);

  return null;
}