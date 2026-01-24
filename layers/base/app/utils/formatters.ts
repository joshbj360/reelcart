import { EMediaType, type IMedia } from "~/models";

const formatPrice = (price: number) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(price / 100);
const formatNumber = (num: number) => new Intl.NumberFormat().format(num);

/**
 * Generates a thumbnail URL for a given media item.
 * If the item is a video, it requests an image thumbnail from Cloudinary.
 * @param media The media object from your database.
 * @returns A URL for a static image thumbnail.
 */
 const getMediaThumbnailUrl = (media?: IMedia): string => {
    if (!media || !media.url) {
        return '/assets/images/men.png'; // A fallback image
    }

    // If the media is a video, change the extension to .jpg
    // Cloudinary will automatically generate a thumbnail from the video.
    if (media.type === EMediaType.VIDEO) {
        const urlParts = media.url.split('.');
        urlParts.pop(); // Remove the original extension (e.g., .mp4)
        return `${urlParts.join('.')}.jpg`;
    }

    // If it's already an image, return the original URL.
    return media.url;
};

const formatAvatarUrl = (username: string | null | undefined, gender: string='boy'): string => {
    if (!username) {
        return `https://avatar.iran.liara.run/public/${gender}?username=user`; // A fallback avatar image
    }
    return `https://avatar.iran.liara.run/public/${gender}?username=${username}`;
};

export { formatPrice, formatNumber, getMediaThumbnailUrl, formatAvatarUrl };