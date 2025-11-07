'use client';
import Image from 'next/image';
import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import EventHeader from '@/components/layout/EventHeader';
import EventFooter from '@/components/layout/EventFooter';
import { useLanguage } from '@/components/language-context';
import { useEvent } from '@/components/event-context';

interface CustomAlbum {
  id: string;
  name: string;
  description?: string;
  coverImageUrl?: string;
  cover_image_url?: string;
}

export default function EventUploadPage() {
  const router = useRouter();
  const params = useParams();
  const { t } = useLanguage();
  const { setCoupleNames } = useEvent();
  const wwwId = params?.wwwId as string;
  const [eventData, setEventData] = useState<{galleryEnabled: boolean, rsvpEnabled: boolean} | null>(null);
  const [customAlbums, setCustomAlbums] = useState<CustomAlbum[]>([]);
  const [defaultAlbumMap, setDefaultAlbumMap] = useState<Record<string, any>>({});

  useEffect(() => {
    if (wwwId) {
      fetchEventData();
      fetchCustomAlbums();
    }
  }, [wwwId]);

  const weddingAlbum = defaultAlbumMap['wedding-day'];
  const partyAlbum = defaultAlbumMap['party-day'];
  const showWeddingAlbum = weddingAlbum ? !(weddingAlbum.isHidden || weddingAlbum.isDeleted) : true;
  const showPartyAlbum = partyAlbum ? !(partyAlbum.isHidden || partyAlbum.isDeleted) : true;

  const fetchEventData = async () => {
    try {
      const response = await fetch(`/api/${wwwId}/gallery-content`);
      if (response.ok) {
        const result = await response.json();
        setEventData({
          galleryEnabled: result.eventData.galleryEnabled,
          rsvpEnabled: result.eventData.rsvpEnabled
        });
        if (result.eventData.coupleNames) {
          setCoupleNames(result.eventData.coupleNames);
        }
      }
    } catch (error) {
      console.error('Error fetching event data:', error);
    }
  };

  const fetchCustomAlbums = async () => {
    try {
      const albumsResponse = await fetch(`/api/${wwwId}/gallery/albums`);
      if (albumsResponse.ok) {
        const albumsResult = await albumsResponse.json();
        const albumsData = Array.isArray(albumsResult.data) ? albumsResult.data : [];
        const defaultStates = Array.isArray(albumsResult.meta?.defaultAlbums)
          ? albumsResult.meta.defaultAlbums
          : [];

        const defaultMap = defaultStates.reduce((acc: Record<string, any>, album: any) => {
          if (album?.key) {
            acc[album.key] = album;
          }
          return acc;
        }, {});

        setDefaultAlbumMap(defaultMap);

        const customs = albumsData.filter((album: any) => !(album.albumType === 'default'));
        setCustomAlbums(customs);
        console.log('Custom albums loaded:', customs);
      } else {
        console.error('Failed to fetch albums:', albumsResponse.status);
      }
    } catch (albumsError) {
      console.error('Error fetching custom albums:', albumsError);
      // Don't fail the whole page if custom albums fail to load
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <EventHeader 
        eventId={wwwId}
        galleryEnabled={eventData?.galleryEnabled || false}
        rsvpEnabled={eventData?.rsvpEnabled || false}
        currentPage="gallery"
      />
      <div className="flex-1 flex flex-col items-center justify-center bg-white py-10 px-2 md:px-0 relative overflow-x-hidden pt-20" style={{ fontFamily: 'Montserrat, Arial, Helvetica, sans-serif' }}>
        <div className="relative w-full max-w-4xl bg-white rounded-2xl border border-[#C7B299] p-8 md:p-16 shadow-md mx-auto z-10" style={{ minHeight: 700 }}>
        {/* Decorative Corners and Sparkles (inside card) */}
        <Image src="/images/Gallery/leaf-left.png" alt="left leaf" width={190} height={280} className="absolute left-[0px] top-[160px] z-0" />
        <Image src="/images/Gallery/leaf-right.png" alt="right leaf" width={170} height={120} className="absolute right-[0px] bottom-[29px] z-0" />
        <Image src="/images/Gallery/bottom-left-sparkle.png" alt="bottom left sparkle" width={202} height={32} className="absolute left-3 bottom-4 z-0" />
        <Image src="/images/Gallery/bottom-right-sparkle.png" alt="bottom right sparkle" width={202} height={32} className="absolute right-4 bottom-4 z-0" />
        <Image src="/images/Gallery/middle-right-sparkle.png" alt="middle right sparkle" width={280} height={42} className="absolute right-5 top-1/4 z-0" />
        <Image src="/images/Gallery/over-leaf-sparkle.png" alt="over leaf sparkle" width={252} height={32} className="absolute left-5 top-20 z-0" />

        {/* Main Content */}
        <div className="flex flex-col items-center justify-center relative z-10">
          <div className="text-center mt-2 mb-8">
            <div className="text-4xl md:text-5xl font-sail" style={{ fontWeight: 400, letterSpacing: '0.5px', lineHeight: 1.1 }}>
              <span style={{ fontFamily: 'Sail, cursive', fontWeight: 400 }}>{t.gallery.signYour} <span style={{ fontFamily: 'Montserrat', fontWeight: 500 }}>{t.gallery.your}</span></span>
              <span className="block" style={{ background: 'linear-gradient(90deg, #E5B574 0%, #C18037 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontFamily: 'Sail, cursive', fontWeight: 400 }}>{t.gallery.masterpiece}!</span>
            </div>
            <div className="text-base md:text-lg mt-2" style={{ fontFamily: 'Montserrat', fontWeight: 400 }}>
              {t.gallery.rememberWhoLeft}
            </div>
          </div>
          <div className="w-full flex justify-center mb-8">
            <div className="border border-[#E5B574] rounded-md py-8 px-8 flex flex-col items-center bg-white" style={{ minWidth: 340, maxWidth: '100%' }}>
              <div className="text-center text-[#08080A] mb-6" style={{ fontFamily: 'Montserrat', fontWeight: 500, fontSize: '1.1rem' }}>
                {t.gallery.selectAlbumToUpload}
              </div>
              <div className="flex flex-row flex-wrap gap-8 justify-center">
                {/* Predefined Albums */}
                {showWeddingAlbum && (
                  <button className="flex flex-col items-center px-6 py-4" style={{ minWidth: 120 }} onClick={() => router.push(`/${wwwId}/gallery/wedding-day`)}>
                    <Image src="/images/Gallery/weddingDay.png" alt={t.gallery.weddingDay} width={78} height={78} className="mb-2" />
                    <span className="mt-2" style={{ fontFamily: 'Montserrat', fontWeight: 500 }}>{weddingAlbum?.name || t.gallery.weddingDay}</span>
                  </button>
                )}
                {showPartyAlbum && (
                  <button className="flex flex-col items-center px-6 py-4" style={{ minWidth: 120 }} onClick={() => router.push(`/${wwwId}/gallery/party-day`)}>
                    <Image src="/images/Gallery/afterPArty.png" alt={t.gallery.afterParty} width={78} height={78} className="mb-2" />
                    <span className="mt-2" style={{ fontFamily: 'Montserrat', fontWeight: 500 }}>{partyAlbum?.name || t.gallery.afterParty}</span>
                  </button>
                )}
                {/* Custom Albums */}
                {customAlbums.map((album) => {
                  const coverUrl = album.coverImageUrl || album.cover_image_url;
                  return (
                    <button 
                      key={album.id} 
                      className="flex flex-col items-center px-6 py-4" 
                      style={{ minWidth: 120 }} 
                      onClick={() => router.push(`/${wwwId}/gallery/album/custom-${album.id}`)}
                    >
                      {coverUrl ? (
                        <div className="relative w-[78px] h-[78px] mb-2 rounded-full overflow-hidden">
                          <Image 
                            src={coverUrl} 
                            alt={album.name} 
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-[78px] h-[78px] mb-2 rounded-full bg-gradient-to-br from-[#E5B574] to-[#C18037] flex items-center justify-center">
                          <span style={{ fontFamily: 'Montserrat', fontWeight: 600, fontSize: '24px', color: '#fff' }}>
                            {album.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <span className="mt-2 text-center" style={{ fontFamily: 'Montserrat', fontWeight: 500, maxWidth: 120 }}>
                        {album.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
      
      {/* Event Footer - Sticky to bottom */}
      <div className="mt-auto">
        <EventFooter />
      </div>
    </div>
  );
}