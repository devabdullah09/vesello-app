'use client';
import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function PartyDayRedirect() {
  const params = useParams();
  const router = useRouter();
  const wwwId = params?.wwwId as string;

  useEffect(() => {
    if (wwwId) {
      router.replace(`/${wwwId}/gallery/album/party-day`);
    }
  }, [wwwId, router]);

  return null;
}