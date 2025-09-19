// Gallery content management utilities

export interface GalleryContent {
  welcomeText: string;
  coupleNames: string;
  uploadButtonText: string;
  viewGalleryButtonText: string;
  missionTitle: string;
  missionText: string;
  goalText: string;
  countMeInButtonText: string;
  visible: boolean;
}

export const defaultGalleryContent: GalleryContent = {
  welcomeText: "Welcome To",
  coupleNames: "",
  uploadButtonText: "Add Your Photos & Videos Now",
  viewGalleryButtonText: "View Gallery",
  missionTitle: "Dear Guests - We Have An Important Mission For You:",
  missionText: "Like, Follow, And Tag The Amazing Team Behind Today's Magic. Every Click Is A Like A Loud 'Thank You!' To Them!",
  goalText: "Our Goal: 50 New Followers!",
  countMeInButtonText: "COUNT ME IN!",
  visible: true
};

export async function fetchGalleryContent(wwwId: string): Promise<GalleryContent> {
  try {
    const response = await fetch(`/api/event-id/${wwwId}/gallery-content`);
    if (response.ok) {
      const result = await response.json();
      if (result.success && result.data) {
        return { ...defaultGalleryContent, ...result.data };
      }
    }
  } catch (error) {
    console.error('Error fetching gallery content:', error);
  }
  
  // Return default content if fetch fails
  return defaultGalleryContent;
}
