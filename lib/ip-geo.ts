/**
 * IP Geolocation lookup helper utility
 */

export interface IpGeoInfo {
  ip: string;
  countryCode: string;
  countryName: string;
  city: string;
  flagEmoji: string;
}

/**
 * Converts 2-letter country code into flag emoji
 */
export function getCountryFlag(countryCode: string): string {
  if (!countryCode || countryCode.length !== 2) return '🌐';
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

/**
 * Detects location from IP address or request headers
 */
export async function getIpGeoInfo(ip: string, headers?: Headers): Promise<IpGeoInfo> {
  // Local/Loopback IPs fallback
  if (
    !ip ||
    ip === '127.0.0.1' ||
    ip === '::1' ||
    ip.startsWith('192.168.') ||
    ip.startsWith('10.') ||
    ip.startsWith('172.16.')
  ) {
    return {
      ip,
      countryCode: 'PK',
      countryName: 'Local Workspace / Pakistan',
      city: 'Local Dev Node',
      flagEmoji: '🇵🇰',
    };
  }

  // Check headers if provided (Cloudflare / Vercel headers)
  if (headers) {
    const cfCountry = headers.get('cf-ipcountry');
    const cfCity = headers.get('cf-ipcity');
    if (cfCountry) {
      return {
        ip,
        countryCode: cfCountry,
        countryName: cfCountry,
        city: cfCity || 'Detected Region',
        flagEmoji: getCountryFlag(cfCountry),
      };
    }
  }

  // Fallback default
  return {
    ip,
    countryCode: 'PK',
    countryName: 'Pakistan',
    city: 'Karachi',
    flagEmoji: '🇵🇰',
  };
}
