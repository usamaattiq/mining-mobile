import { getStateFromPath, type LinkingOptions } from '@react-navigation/native';
import { rememberListingLink } from '@/navigation/pendingListingLink';
import type { RootStackParamList } from '@/navigation/types';
import { useAuthStore } from '@/store/authStore';

/**
 * Deep links used by push / Ping:
 * - miningmobile://home
 * - miningmobile://requests
 * - miningmobile://requests/{externalRef}
 * - miningmobile://conversation/{conversationId}
 * - miningmobile://listing/{category}/{id}
 * - miningmobile://messages
 */
function listingFromPath(path: string): { category: string; id: string } | null {
  const match = path.match(/listing\/(equipment|services|gold)\/([^/?#]+)/);
  if (!match?.[1] || !match[2]) return null;
  return { category: match[1], id: match[2] };
}

export const navigationLinking: LinkingOptions<RootStackParamList> = {
  prefixes: ['miningmobile://', 'https://api.dahabi-sudan.com/open'],
  getStateFromPath(path, options) {
    const listing = listingFromPath(path);
    if (listing && useAuthStore.getState().status !== 'authenticated') {
      rememberListingLink(listing.category, listing.id);
      return { routes: [{ name: 'Login' }] };
    }
    return getStateFromPath(path, options);
  },
  config: {
    screens: {
      // Nested tab paths sit at the root of the scheme (not under /home/...).
      Dashboard: {
        screens: {
          HomeTab: 'home',
          Requests: 'requests/:requestId?',
          MyOffers: 'offers',
          Profile: 'profile',
        },
      },
      Conversation: {
        path: 'conversation/:conversationId',
        parse: {
          conversationId: String,
        },
      },
      Messages: 'messages',
      Notifications: 'notifications',
      CompleteListingDetail: {
        path: 'listing/:category/:id',
        parse: {
          id: String,
          category: (value: string) => {
            if (value === 'equipment' || value === 'services' || value === 'gold') {
              return value;
            }
            return 'equipment';
          },
        },
      },
    },
  },
};
