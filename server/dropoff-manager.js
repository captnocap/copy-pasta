// dropoff-manager.js

// Import the array from the local locations.js file
import uspsDropOffLocations from './locations.js';

/**
 * Parses a time string (e.g., "5:30 pm") into a 24-hour format.
 * @param {string} timeStr The time string to parse.
 * @returns {{hours: number, minutes: number} | null} An object with hours and 
 * minutes, or null if parsing fails.
 */
function parseCollectionTime(timeStr) {
  if (!timeStr || typeof timeStr !== 'string' || timeStr === "Not available") {
    return null;
  }
  const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(am|pm)/i);
  if (!match) return null;
  let [_, hoursStr, minutesStr, period] = match;
  let hours = parseInt(hoursStr, 10);
  const minutes = parseInt(minutesStr, 10);
  if (period.toLowerCase() === 'pm' && hours !== 12) hours += 12;
  if (period.toLowerCase() === 'am' && hours === 12) hours = 0;
  return { hours, minutes };
}

/**
 * Finds available USPS drop-off locations based on the current time.
 * @param {Array<Object>} locations The array of USPS location objects.
 * @param {Date} now The current date and time.
 * @returns {Array<Object>} A sorted array of available locations.
 */
function findAvailableDropOffs(locations, now) {
  const MIN_GAP_MINUTES = 30;
  const earliestPickupTime = new Date(now.getTime() + MIN_GAP_MINUTES * 60 * 1000);
  const earliestPickupTotalMinutes = earliestPickupTime.getHours() * 60 + earliestPickupTime.getMinutes();
  const availableLocations = locations.filter(location => {
    const collectionTime = parseCollectionTime(location.collectionTime);
    if (!collectionTime) return false;
    const collectionTotalMinutes = collectionTime.hours * 60 + collectionTime.minutes;
    return collectionTotalMinutes >= earliestPickupTotalMinutes;
  });
  return availableLocations.sort((a, b) => {
    const totalMinutesA = parseCollectionTime(a.collectionTime).hours * 60 + parseCollectionTime(a.collectionTime).minutes;
    const totalMinutesB = parseCollectionTime(b.collectionTime).hours * 60 + parseCollectionTime(b.collectionTime).minutes;
    return totalMinutesA - totalMinutesB;
  });
}

// --- Main Execution ---
const currentTime = new Date(); // Using the actual current time

// --- Display Results ---
const pstFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone: 'America/Los_Angeles',
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
  timeZoneName: 'short',
});

const upcomingDropOffs = findAvailableDropOffs(uspsDropOffLocations, currentTime);

console.log(`Script run at: ${pstFormatter.format(currentTime)}`);

if (upcomingDropOffs.length > 0) {
  console.log("Found the following available drop-off locations:");
  console.table(upcomingDropOffs);
} else {
  console.log("No available drop-off locations found for the rest of the day.");
}