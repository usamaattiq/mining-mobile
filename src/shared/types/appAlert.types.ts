export type AppAlertButtonStyle = 'default' | 'cancel' | 'destructive';

export type AppAlertButton = {
  text: string;
  onPress?: () => void;
  style?: AppAlertButtonStyle;
};

export type AppAlertLink = {
  text: string;
  onPress?: () => void;
};

export type AppAlertRequest = {
  title: string;
  message?: string;
  buttons: AppAlertButton[];
  links?: AppAlertLink[];
};
