export function formatNominatimLocation(result: any): string {
  const address = result.address ?? {};

  const streetNumber = address.house_number;
  const street = address.road;

  const neighborhood =
    address.neighbourhood ||
    address.suburb ||
    address.quarter ||
    address.city_district;

  const city =
    address.city || address.town || address.village || address.municipality;

  const state = address.state;
  const postcode = address.postcode;

  if (streetNumber && street && city && state) {
    return `${streetNumber} ${street}, ${city}, ${state}${postcode ? ` ${postcode}` : ""}`;
  }

  if (street && city && state) {
    return `${street}, ${city}, ${state}${postcode ? ` ${postcode}` : ""}`;
  }

  if (neighborhood && city && state) {
    return `${neighborhood}, ${city}, ${state}`;
  }

  if (city && state) {
    return `${city}, ${state}`;
  }

  return result.display_name || "Location unavailable";
}
