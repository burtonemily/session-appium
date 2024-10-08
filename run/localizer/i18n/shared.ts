let mappedBrowserLocaleDisplayed = false;
let initialLocale: Locale | undefined;

/**
 * Logs an i18n message to the console.
 * @param message - The message to log.
 *
 */
export function i18nLog(message: string) {
  // eslint-disable-next-line no-console
  console.log(`i18n: ${message}`);
}

export type Locale = string;

/**
 * Returns the current locale.
 */
export function getLocale(): Locale {
  if (!initialLocale) {
    i18nLog(`getLocale: using initialLocale`);

    throw new Error('initialLocale is unset');
  }
  return initialLocale;
}

/**
 * Returns the closest supported locale by the browser.
 */
export function getBrowserLocale() {
  const userLocaleDashed = getLocale();

  const matchinglocales = Intl.DateTimeFormat.supportedLocalesOf(userLocaleDashed);
  const mappingTo = matchinglocales?.[0] || 'en';

  if (!mappedBrowserLocaleDisplayed) {
    mappedBrowserLocaleDisplayed = true;
    i18nLog(`userLocaleDashed: '${userLocaleDashed}', mapping to browser locale: ${mappingTo}`);
  }

  return mappingTo;
}

export function setInitialLocale(locale: Locale) {
  initialLocale = locale;
}

export function isLocaleSet() {
  return initialLocale !== undefined;
}
