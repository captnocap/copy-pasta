// address-distance-finder.js

const { generateFromAddress } = require('./generate.js');
const uspsDropOffLocations = require('./locations.js');
const fs = require('fs');
const path = require('path');

/**
 * Calculates the distance between two geographic coordinates using the Haversine formula.
 * @param {number} lat1 - Latitude of the first point
 * @param {number} lon1 - Longitude of the first point
 * @param {number} lat2 - Latitude of the second point
 * @param {number} lon2 - Longitude of the second point
 * @returns {number} Distance in miles
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 3959; // Radius of the Earth in miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

/**
 * Geocodes an address using the Nominatim API and returns coordinates.
 * @param {string} address - The full address to geocode
 * @returns {Promise<{lat: number, lon: number} | null>} Coordinates or null if not found
 */
async function geocodeAddress(address) {
    const baseUrl = "https://nominatim.openstreetmap.org/search";
    const fullAddress = address.includes("PORTLAND") ? address : `${address}, PORTLAND, OR`;
    
    const headers = {
        "User-Agent": "AddressDistanceFinder/0.1 (your-email@example.com)"
    };
    
    const params = new URLSearchParams({
        q: fullAddress,
        format: "json",
        limit: "1"
    });
    
    // Respect Nominatim's rate limit: 1 request per second
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    try {
        const response = await fetch(`${baseUrl}?${params.toString()}`, { headers });
        if (!response.ok) {
            console.error(`Error geocoding address: Status ${response.status}`);
            return null;
        }
        
        const data = await response.json();
        if (data && data.length > 0) {
            return {
                lat: parseFloat(data[0].lat),
                lon: parseFloat(data[0].lon)
            };
        }
        return null;
    } catch (error) {
        console.error("Error during geocoding:", error);
        return null;
    }
}

/**
 * Parses a time string (e.g., "5:30 pm") into a 24-hour format.
 * @param {string} timeStr The time string to parse.
 * @returns {{hours: number, minutes: number} | null} An object with hours and minutes, or null if parsing fails.
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

/**
 * History file path for tracking drop-off usage
 */
const HISTORY_FILE = path.join(__dirname, 'dropoff-history.json');

/**
 * Loads the drop-off history from file
 * @returns {Object} History object with array of used locations
 */
function loadHistory() {
    try {
        if (fs.existsSync(HISTORY_FILE)) {
            const data = fs.readFileSync(HISTORY_FILE, 'utf8');
            return JSON.parse(data);
        }
    } catch (error) {
        console.error('Error loading history:', error);
    }
    return { history: [] };
}

/**
 * Saves the drop-off history to file
 * @param {Object} history - History object to save
 */
function saveHistory(history) {
    try {
        fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2));
    } catch (error) {
        console.error('Error saving history:', error);
    }
}

/**
 * Adds a selected drop-off location to history
 * @param {Object} location - The selected drop-off location
 */
function addToHistory(location) {
    const history = loadHistory();
    history.history.push({
        address: location.address,
        type: location.type,
        selectedDate: new Date().toISOString(),
        collectionTime: location.collectionTime
    });
    saveHistory(history);
}

/**
 * Filters out locations used within the last N days
 * @param {Array<Object>} locations - Array of all locations
 * @param {number} days - Number of days to exclude (default 14)
 * @returns {Array<Object>} Filtered array of locations
 */
function filterRecentlyUsedLocations(locations, days = 14) {
    const history = loadHistory();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    // Get addresses used within the last N days
    const recentlyUsedAddresses = new Set(
        history.history
            .filter(entry => new Date(entry.selectedDate) > cutoffDate)
            .map(entry => entry.address)
    );
    
    // Filter out recently used locations
    const availableLocations = locations.filter(
        location => !recentlyUsedAddresses.has(location.address)
    );
    
    console.log(`\nFiltering history: ${recentlyUsedAddresses.size} locations used in last ${days} days`);
    if (recentlyUsedAddresses.size > 0) {
        console.log("Recently used addresses (excluded):");
        recentlyUsedAddresses.forEach(addr => console.log(`  - ${addr}`));
    }
    
    return availableLocations;
}

/**
 * Gets the usage history for the last N days
 * @param {number} days - Number of days to look back
 * @returns {Array<Object>} Array of history entries
 */
function getRecentHistory(days = 14) {
    const history = loadHistory();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return history.history
        .filter(entry => new Date(entry.selectedDate) > cutoffDate)
        .sort((a, b) => new Date(b.selectedDate) - new Date(a.selectedDate));
}

/**
 * Finds the closest drop-off location from a generated address using optimized approach.
 * @param {Object} generatedAddress - The generated address object
 * @param {Array<Object>} dropOffLocations - Array of drop-off locations
 * @returns {Promise<Object>} The closest location with distance information
 */
async function findClosestDropOff(generatedAddress, dropOffLocations) {
    console.log("\nGeocoding generated address...");
    const fromCoords = await geocodeAddress(generatedAddress["From Address1"] + ", " + generatedAddress["From City"] + ", " + generatedAddress["From State/Province"]);
    
    if (!fromCoords) {
        throw new Error("Could not geocode the generated address");
    }
    
    console.log(`Generated address coordinates: ${fromCoords.lat}, ${fromCoords.lon}`);
    console.log("\nOptimized search: Testing closest locations first...");
    
    // Use a smarter approach: test a sample of locations first to find the general area
    const sampleSize = Math.min(15, dropOffLocations.length);
    const sampleLocations = [];
    
    // Take every nth location to get a good geographical spread
    const step = Math.floor(dropOffLocations.length / sampleSize);
    for (let i = 0; i < dropOffLocations.length; i += step) {
        if (sampleLocations.length < sampleSize) {
            sampleLocations.push(dropOffLocations[i]);
        }
    }
    
    console.log(`Sampling ${sampleLocations.length} locations for initial distance estimates...`);
    
    const sampleResults = [];
    for (const location of sampleLocations) {
        process.stdout.write(`  Testing ${location.address}... `);
        const coords = await geocodeAddress(location.address);
        
        if (coords) {
            const distance = calculateDistance(fromCoords.lat, fromCoords.lon, coords.lat, coords.lon);
            sampleResults.push({
                ...location,
                distance: distance.toFixed(2),
                coordinates: coords
            });
            process.stdout.write(`${distance.toFixed(2)} miles\n`);
        } else {
            process.stdout.write(`Failed to geocode\n`);
        }
    }
    
    // Sort sample results and find the closest
    sampleResults.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
    
    if (sampleResults.length > 0) {
        console.log(`\nBest sample result: ${sampleResults[0].address} at ${sampleResults[0].distance} miles`);
        return sampleResults; // Return all sample results for now
    } else {
        throw new Error("Could not geocode any locations");
    }
}

/**
 * Main function to generate an address and find the closest drop-off location.
 * @param {boolean} autoSelect - If true, automatically selects and saves the closest location
 */
async function main(autoSelect = false) {
    try {
        // Show recent history
        console.log("=== RECENT DROP-OFF HISTORY (Last 14 Days) ===");
        const recentHistory = getRecentHistory(14);
        if (recentHistory.length > 0) {
            console.log("Recently used locations:");
            recentHistory.forEach(entry => {
                const date = new Date(entry.selectedDate);
                const daysAgo = Math.floor((new Date() - date) / (1000 * 60 * 60 * 24));
                console.log(`  - ${entry.address} (${daysAgo} days ago)`);
            });
        } else {
            console.log("No locations used in the last 14 days.");
        }
        
        // Generate a random address
        console.log("\n=== STEP 1: Generating Random Address ===");
        const generatedAddress = await generateFromAddress();
        
        console.log("\n--- Generated Valid Address ---");
        console.log(`From Name:             ${generatedAddress["From Name"]}`);
        console.log(`From Address1:         ${generatedAddress["From Address1"]}`);
        console.log(`From City:             ${generatedAddress["From City"]}`);
        console.log(`From State/Province:   ${generatedAddress["From State/Province"]}`);
        console.log(`From Zip/Postal Code:  ${generatedAddress["From Zip/Postal Code"]}`);
        
        // Get current time for filtering available locations
        const currentTime = new Date();
        const pstFormatter = new Intl.DateTimeFormat('en-US', {
            timeZone: 'America/Los_Angeles',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
            timeZoneName: 'short',
        });
        
        console.log(`\nCurrent time: ${pstFormatter.format(currentTime)}`);
        
        // Find available drop-off locations
        console.log("\n=== STEP 2: Finding Available Drop-off Locations ===");
        let availableLocations = findAvailableDropOffs(uspsDropOffLocations, currentTime);
        
        if (availableLocations.length === 0) {
            console.log("No available drop-off locations found for the rest of the day.");
            return;
        }
        
        console.log(`Found ${availableLocations.length} available drop-off locations.`);
        
        // Filter out recently used locations
        console.log("\n=== STEP 3: Filtering Recently Used Locations ===");
        const filteredLocations = filterRecentlyUsedLocations(availableLocations, 14);
        
        if (filteredLocations.length === 0) {
            console.log("\n⚠️  WARNING: All available locations have been used in the last 14 days!");
            console.log("Proceeding with all available locations...");
            // Fall back to all available locations if none are unused
        } else {
            console.log(`${filteredLocations.length} locations available after filtering.`);
            availableLocations = filteredLocations;
        }
        
        // Find closest drop-off location
        console.log("\n=== STEP 4: Finding Closest Drop-off Location ===");
        const locationsWithDistance = await findClosestDropOff(generatedAddress, availableLocations);
        
        if (locationsWithDistance.length > 0) {
            console.log("\n--- RESULTS: Closest Drop-off Locations ---");
            console.log("(Sorted by distance from generated address)\n");
            
            // Display top 5 closest locations
            const topLocations = locationsWithDistance.slice(0, 5);
            topLocations.forEach((location, index) => {
                console.log(`${index + 1}. ${location.type.toUpperCase()} - ${location.distance} miles`);
                console.log(`   Address: ${location.address}`);
                console.log(`   Collection Time: ${location.collectionTime}`);
                console.log("");
            });
            
            console.log("--- SELECTED LOCATION ---");
            const closest = locationsWithDistance[0];
            console.log(`Type: ${closest.type.toUpperCase()}`);
            console.log(`Address: ${closest.address}`);
            console.log(`Distance: ${closest.distance} miles`);
            console.log(`Collection Time: ${closest.collectionTime}`);
            console.log(`Coordinates: ${closest.coordinates.lat}, ${closest.coordinates.lon}`);
            
            // Auto-select and save to history if flag is set
            if (autoSelect || process.argv.includes('--select')) {
                addToHistory(closest);
                console.log("\n✅ Location has been selected and saved to history!");
                console.log("This location will be excluded from selection for the next 14 days.");
            } else {
                console.log("\n💡 To select and save this location, run with --select flag");
            }
            
            return { generatedAddress, selectedLocation: closest };
        } else {
            console.log("Could not calculate distances to any drop-off locations.");
        }
        
    } catch (error) {
        console.error("\nAn error occurred:", error);
    }
}

// Export functions for use in other modules
module.exports = {
    calculateDistance,
    geocodeAddress,
    findClosestDropOff,
    findAvailableDropOffs,
    parseCollectionTime,
    filterRecentlyUsedLocations,
    addToHistory,
    loadHistory,
    saveHistory,
    getRecentHistory
};

// Run main function if executed directly
if (require.main === module) {
    main();
}