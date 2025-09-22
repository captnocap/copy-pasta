/**
 * As requested, 'first', 'last', and 'street_address' are defined here as
 * arrays and exported. In a real application, you might load these from
 * files or a database.
 */
export const first = [
    "Alex", "Jordan", "Taylor", "Morgan", "Casey", "Riley", "Jessie", "Jamie"
];

export const last = [
    "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis"
];

// In the original script, this was loaded from 'street_names.txt'.
export const street_address = [
    "Main St", "Oak Ave", "Pine St", "Maple Ave", "Washington St", "Elm St",
    "2nd St", "3rd Ave", "10th St", "Park Ave"
];

/**
 * Helper function to pick a random item from an array.
 * @param {any[]} arr The array to pick an item from.
 * @returns {any} A random item from the array.
 */
const getRandomItem = (arr) => {
    if (!arr || arr.length === 0) {
        // This would have been a failure at load time in the original script.
        throw new Error("Cannot select a random item from an empty array.");
    }
    return arr[Math.floor(Math.random() * arr.length)];
};

/**
 * Generates a random street number. If the street name is numeric (e.g., "10th"),
 * it generates a number within the corresponding block (1000-1099).
 * Otherwise, it returns a random number in a broader range.
 * @param {string} streetName - The name of the street.
 * @returns {number} A randomly generated street number.
 */
function getStreetNumber(streetName) {
    const match = streetName.toLowerCase().match(/^(\d+)(st|nd|rd|th)$/);
    if (match) {
        const streetNumber = parseInt(match[1], 10);
        const startRange = streetNumber * 100;
        const endRange = startRange + 99;
        // random integer between startRange and endRange (inclusive)
        return Math.floor(Math.random() * (endRange - startRange + 1)) + startRange;
    } else {
        // random integer between 1 and 11800 (inclusive)
        return Math.floor(Math.random() * 11800) + 1;
    }
}

/**
 * Fetches a ZIP code for a given street address in Portland, OR using the
 * Nominatim API. It waits 1 second before each request to respect rate limits.
 * @param {string} address - The street address (e.g., "123 Main St").
 * @returns {Promise<[string, string]>} A promise that resolves to an array
 * containing the ZIP code and the full address string used for the query.
 */
async function getZipCode(address) {
    console.log(`Fetching ZIP code for address: ${address}`);
    const baseUrl = "https://nominatim.openstreetmap.org/search";
    const city = "Portland";
    const state = "OR";
    const fullAddress = `${address}, ${city}, ${state}`;

    const headers = {
        "User-Agent": "OrderAutoGeocode/0.1 (your-email@example.com)"
    };

    const params = new URLSearchParams({
        q: fullAddress,
        format: "json",
        addressdetails: "1"
    });
    const url = `${baseUrl}?${params.toString()}`;

    console.log(`Nominatim API request: GET ${url}`);

    // Wait for 1 second to respect API rate limits.
    await new Promise(resolve => setTimeout(resolve, 1000));

    try {
        const response = await fetch(url, { headers });
        console.log(`Nominatim API response status: ${response.status}`);

        if (response.ok) { // status is in the range 200-299
            const data = await response.json();
            if (data && data.length > 0) {
                const addressDetails = data[0].address || {};
                const zipCode = addressDetails.postcode;
                if (zipCode) {
                    const mainZip = zipCode.split('-')[0];
                    console.log(`Found ZIP: ${mainZip} for ${fullAddress}`);
                    return [mainZip, fullAddress];
                } else {
                    const responseInfo = JSON.stringify(data[0] || 'No data');
                    console.log(`ZIP code not found for ${fullAddress}. Response: ${responseInfo}`);
                    return ["ZIP code not found", fullAddress];
                }
            } else {
                console.log(`No data in Nominatim response for ${fullAddress}`);
                return ["ZIP code not found", fullAddress];
            }
        } else {
            console.log(`Error fetching ZIP: Status ${response.status} for ${fullAddress}`);
            return [`Error: ${response.status}`, fullAddress];
        }
    } catch (error) {
        console.error(`Network or other error for ${fullAddress}:`, error);
        return [`Error: ${error.message}`, fullAddress];
    }
}

/**
 * Generates a random full name from the first and last name lists.
 * @returns {string} A randomly generated full name.
 */
function generateFromName() {
    console.log("Generating 'From Name'...");
    const name = `${getRandomItem(first)} ${getRandomItem(last)}`;
    console.log(`Generated 'From Name': ${name}`);
    return name;
}

/**
 * Generates a complete 'From' address object with a name, a valid address
 * in Portland, OR, and a verified ZIP code. It retries until a valid
 * ZIP code is found.
 * @returns {Promise<object>} A promise that resolves to the address object.
 */
export async function generateFromAddress() {
    console.log("Generating 'From Address'...");
    while (true) {
        const streetName = getRandomItem(street_address);
        const streetNumber = getStreetNumber(streetName);
        const randomAddress = `${streetNumber} ${streetName}`;
        console.log(`Generated random address for ZIP check: ${randomAddress}`);

        const [zipCode] = await getZipCode(randomAddress);

        if (zipCode && !zipCode.startsWith("Error") && zipCode !== "ZIP code not found") {
            console.log(`Successfully found ZIP for address: ${randomAddress}, ZIP: ${zipCode}`);
            return {
                "From Name": generateFromName(),
                "From Address1": randomAddress,
                "From Address2": "",
                "From City": "Portland",
                "From State/Province": "OR",
                "From Zip/Postal Code": zipCode,
                "From Country": "",
                "From Phone Number": ""
            };
        } else {
            console.log(`Failed to get valid ZIP for ${randomAddress}. Retrying...`);
        }
    }
}