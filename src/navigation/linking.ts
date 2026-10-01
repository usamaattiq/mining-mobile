import type { LinkingOptions } from '@react-navigation/native';
import type { RootStackParamList } from '@/navigation/types';

/**
 * Deep links used by push / Ping:
 * - miningmobile://home
 * - miningmobile://requests
 * - miningmobile://requests/{externalRef}
 * - miningmobile://conversation/{conversationId}
 * - miningmobile://listing/{category}/{id}
 * - miningmobile://messages
 */
export const navigationLinking: LinkingOptions<RootStackParamList> = {
  prefixes: ['miningmobile://'],
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
