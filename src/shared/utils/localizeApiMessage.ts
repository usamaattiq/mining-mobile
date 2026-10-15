import { i18n } from '@/i18n';

const EXACT: Record<string, string> = {
  'Request timed out': 'apiErrors.timeout',
  'Network request failed': 'apiErrors.network',
  'Received an invalid response from the server': 'apiErrors.invalidResponse',
  'This request type is turned off': 'apiErrors.requestTypeOff',
  'Auction service is down': 'apiErrors.auctionDown',
  'RFQ Management System Down': 'apiErrors.rfqDown',
  'Listing not found': 'apiErrors.listingNotFound',
  'Only the listing owner can edit it': 'apiErrors.ownerEditOnly',
  'Listing category cannot be changed': 'apiErrors.categoryLocked',
  'You cannot offer on your own listing': 'apiErrors.ownListingOffer',
  'Offers are not available for this listing': 'apiErrors.offersUnavailable',
  'No units left on this listing': 'apiErrors.noUnitsLeft',
  'Choose rent or sale for this offer': 'apiErrors.chooseRentOrSale',
  'Choose onsite or online for this offer': 'apiErrors.chooseOnsiteOrOnline',
  'Enter a bid of at least 1': 'apiErrors.bidAtLeastOne',
  'Only the listing owner can decide offers': 'apiErrors.ownerDecideOnly',
  'The listing owner cannot confirm this offer': 'apiErrors.ownerCannotConfirm',
  'Only the listing owner can delete it': 'apiErrors.ownerDeleteOnly',
  'Units cannot be less than those already rented or sold': 'apiErrors.unitsBelowCommitted',
  'Rented units were not found': 'apiErrors.rentedNotFound',
  'The listing owner cannot update this offer': 'apiErrors.ownerCannotUpdate',
  'Enter a valid amount': 'apiErrors.validAmount',
  'Offer not found': 'apiErrors.offerNotFound',
  'This offer can no longer be updated': 'apiErrors.offerLocked',
  'This listing cannot take offers': 'apiErrors.listingNoOffers',
  'Only the buyer can update this offer': 'apiErrors.buyerUpdateOnly',
  'Only the listing owner can manage units': 'apiErrors.ownerManageUnits',
  'A setting value is required': 'apiErrors.settingRequired',
  'User not found': 'apiErrors.userNotFound',
  'You cannot change your own status': 'apiErrors.ownStatus',
  'Parent category not found': 'apiErrors.parentCategoryNotFound',
  'Category not found': 'apiErrors.categoryNotFound',
  'Delete subcategories first': 'apiErrors.deleteChildrenFirst',
  'Unit not found': 'apiErrors.unitNotFound',
  Forbidden: 'apiErrors.forbidden',
  'Conversation not found': 'apiErrors.conversationNotFound',
  'Cannot message your own listing': 'apiErrors.cannotMessageOwn',
  'Messaging opens after an offer is sent': 'apiErrors.messagingAfterOffer',
  'This phone number is already registered': 'apiErrors.phoneRegistered',
  'MPIN must be 4 digits': 'apiErrors.mpinFourDigits',
  'This email is already in use': 'apiErrors.emailInUse',
  'Company name is required': 'apiErrors.companyRequired',
  'No account found for this phone number': 'apiErrors.noAccount',
  'Invalid MPIN': 'apiErrors.invalidMpin',
  'Invalid phone number or MPIN': 'apiErrors.invalidPhoneOrMpin',
  'New MPIN must be different': 'apiErrors.mpinMustDiffer',
  'MPIN is not set for this account': 'apiErrors.mpinNotSet',
  'Current MPIN is incorrect': 'apiErrors.currentMpinWrong',
  'Account is suspended': 'apiErrors.accountSuspended',
  'Account is deactivated': 'apiErrors.accountDeactivated',
  'Account is temporarily locked': 'apiErrors.accountLocked',
  'Invalid or expired session': 'apiErrors.sessionInvalid',
  'WhatsApp OTP delivery is not configured': 'apiErrors.whatsappNotConfigured',
  'Failed to send WhatsApp OTP': 'apiErrors.whatsappSendFailed',
  'You have reached your OTP request limit. Please wait 10 minutes and try again.':
    'apiErrors.otpLimit',
  'OTP delivery is not configured': 'apiErrors.otpNotConfigured',
  'Invalid or expired OTP': 'apiErrors.otpInvalid',
  'OTP has expired': 'apiErrors.otpExpired',
  'Too many OTP attempts': 'apiErrors.otpAttempts',
  'Phone number is not verified': 'apiErrors.phoneNotVerified',
  'Phone verification expired. Request a new OTP.': 'apiErrors.phoneVerificationExpired',
  'Notification not found': 'apiErrors.notificationNotFound',
  Unauthorized: 'apiErrors.unauthorized',
  'Admin access required': 'apiErrors.adminRequired',
  'Validation failed': 'apiErrors.validationFailed',
  'Session has been revoked': 'apiErrors.sessionRevoked',
  'Too many requests. Please try again shortly.': 'apiErrors.rateLimited',
  'Route not found': 'apiErrors.routeNotFound',
  'Something went wrong': 'apiErrors.somethingWrong',
};

/** Server messages are English. Show the matching translation when Arabic is active. */
export function localizeApiMessage(message: string): string {
  if (!i18n.language.startsWith('ar')) return message;

  const key = EXACT[message];
  if (key) return i18n.t(key);

  const units = /^Only (\d+) units are still available$/.exec(message);
  if (units) return i18n.t('apiErrors.onlyUnitsAvailable', { count: Number(units[1]) });

  if (message.startsWith('Request failed:')) return i18n.t('apiErrors.requestFailed');

  return i18n.t('apiErrors.somethingWrong');
}
