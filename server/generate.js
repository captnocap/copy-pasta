// --- Import Data from variables.js ---
const { FIRST_NAMES, LAST_NAMES, STREET_NAMES } = require('./variables.js');


// --- Helper Functions ---

/**
 * Generates a random street number.
 * @param {string} streetName - The name of the street.
 * @returns {number} A randomly generated street number.
 */
function getStreetNumber(streetName) {
    const match = streetName.toLowerCase().match(/^(\d+)(st|nd|rd|th)$/);
    if (match) {
        const streetNumber = parseInt(match[1], 10);
        const startRange = streetNumber * 100;
        const endRange = startRange + 99;
        return Math.floor(Math.random() * (endRange - startRange + 1)) + startRange;
    } else {
        return Math.floor(Math.random() * 11800) + 1;
    }
}

/**
 * Generates a random full name from the imported lists.
 * @returns {string} A randomly generated name.
 */
function generateFromName() {
    const firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
    const lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
    return `${firstName} ${lastName}`;
}

/**
 * Uses the Nominatim API to validate an address and retrieve its ZIP code.
 * @param {string} address - The street address (e.g., "123 SE Ash St").
 * @returns {Promise<string>} A promise that resolves to the ZIP code or an error string.
 */
async function getZipCode(address) {
    const baseUrl = "https://nominatim.openstreetmap.org/search";
    const city = "Portland";
    const state = "OR";
    const fullAddress = `${address}, ${city}, ${state}`;

    // IMPORTANT: Per Nominatim's usage policy, replace this with a valid email.
    const headers = {
        "User-Agent": "OrderAutoGeocode/0.1 (your-email@example.com)"
    };

    const params = new URLSearchParams({
        q: fullAddress,
        format: "json",
        addressdetails: "1"
    });

    // Policy: No more than 1 request per second.
    await new Promise(resolve => setTimeout(resolve, 1000));

    try {
        const response = await fetch(`${baseUrl}?${params.toString()}`, { headers });
        if (!response.ok) {
            console.error(`Error fetching ZIP from Nominatim: Status ${response.status}`);
            return `Error: ${response.status}`;
        }

        const data = await response.json();
        if (data && data.length > 0) {
            const zipCode = data[0]?.address?.postcode;
            if (zipCode) {
                return zipCode.split('-')[0];
            }
        }
        return "ZIP code not found";
    } catch (error) {
        console.error("An error occurred during the fetch operation:", error);
        return "Error: Fetch failed";
    }
}


// --- Main Generator Function ---

/**
 * Generates a complete, validated random address object.
 * @returns {Promise<object>} A promise that resolves to the final address object.
 */
async function generateFromAddress() {
    console.log("Generating a valid random 'From Address' in Portland, OR...");
    while (true) {
        const streetName = STREET_NAMES[Math.floor(Math.random() * STREET_NAMES.length)];
        const streetNumber = getStreetNumber(streetName);
        const randomAddress = `${streetNumber} ${streetName}`;
        process.stdout.write(`  Attempting to validate: ${randomAddress}... `);

        const zipCode = await getZipCode(randomAddress);

        if (!zipCode.startsWith("Error") && zipCode !== "ZIP code not found") {
            process.stdout.write(`Success! ZIP: ${zipCode}\n`);
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
            process.stdout.write(`Failed. Retrying...\n`);
        }
    }
}


// --- Exports ---
module.exports = {
    generateFromAddress,
    generateFromName,
    getZipCode
};

// --- Execution Block ---

/**
 * IIFE to run the generator and print the output to the console.
 * Only runs when the file is executed directly, not when imported.
 */
if (require.main === module) {
    (async () => {
        try {
            const address = await generateFromAddress();
            console.log("\n--- Generated Valid Address ---");
            console.log(`From Name:           ${address["From Name"]}`);
            console.log(`From Address1:       ${address["From Address1"]}`);
            console.log(`From City:           ${address["From City"]}`);
            console.log(`From State/Province:   ${address["From State/Province"]}`);
            console.log(`From Zip/Postal Code:  ${address["From Zip/Postal Code"]}`);
            console.log("-------------------------------");
        } catch (error) {
            console.error("\nAn unexpected error occurred during execution:", error);
        }
    })();
}