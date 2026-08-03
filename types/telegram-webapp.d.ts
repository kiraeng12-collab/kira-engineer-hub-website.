// Shared ambient type for the Telegram WebApp SDK surface used by the Mini App
// components (calculator + dashboard). Declared once here so multiple
// components don't each augment `Window.Telegram` with clashing shapes.

interface TelegramWebAppUser {
  id?: number;
  first_name?: string;
  last_name?: string;
  username?: string;
}

interface TelegramWebApp {
  initData: string;
  initDataUnsafe?: { user?: TelegramWebAppUser };
  colorScheme?: "light" | "dark";
  themeParams?: Record<string, string>;
  ready: () => void;
  expand: () => void;
}

interface Window {
  Telegram?: { WebApp?: TelegramWebApp };
}
