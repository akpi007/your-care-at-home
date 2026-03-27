export interface CountryCode {
  country: string;
  code: string;
  flag: string;
  iso: string;
}

export const countryCodes: CountryCode[] = [
  { country: "Zambia", code: "+260", flag: "🇿🇲", iso: "ZM" },
  { country: "South Africa", code: "+27", flag: "🇿🇦", iso: "ZA" },
  { country: "Kenya", code: "+254", flag: "🇰🇪", iso: "KE" },
  { country: "Nigeria", code: "+234", flag: "🇳🇬", iso: "NG" },
  { country: "Tanzania", code: "+255", flag: "🇹🇿", iso: "TZ" },
  { country: "Zimbabwe", code: "+263", flag: "🇿🇼", iso: "ZW" },
  { country: "Ghana", code: "+233", flag: "🇬🇭", iso: "GH" },
  { country: "Uganda", code: "+256", flag: "🇺🇬", iso: "UG" },
  { country: "Rwanda", code: "+250", flag: "🇷🇼", iso: "RW" },
  { country: "Ethiopia", code: "+251", flag: "🇪🇹", iso: "ET" },
  { country: "Mozambique", code: "+258", flag: "🇲🇿", iso: "MZ" },
  { country: "Botswana", code: "+267", flag: "🇧🇼", iso: "BW" },
  { country: "Malawi", code: "+265", flag: "🇲🇼", iso: "MW" },
  { country: "Cameroon", code: "+237", flag: "🇨🇲", iso: "CM" },
  { country: "Senegal", code: "+221", flag: "🇸🇳", iso: "SN" },
  { country: "Congo (DRC)", code: "+243", flag: "🇨🇩", iso: "CD" },
  { country: "United States", code: "+1", flag: "🇺🇸", iso: "US" },
  { country: "United Kingdom", code: "+44", flag: "🇬🇧", iso: "GB" },
  { country: "Canada", code: "+1", flag: "🇨🇦", iso: "CA" },
  { country: "India", code: "+91", flag: "🇮🇳", iso: "IN" },
  { country: "Australia", code: "+61", flag: "🇦🇺", iso: "AU" },
];

export const findCountryByIso = (iso: string): CountryCode | undefined =>
  countryCodes.find((c) => c.iso.toLowerCase() === iso.toLowerCase());
