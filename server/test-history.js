const { addToHistory } = require('./address-distance-finder.js');

// Add some test entries to history with different dates
const testLocations = [
    {
        address: "200 SW MARKET ST, PORTLAND, OR 97201",
        type: "bluebox",
        collectionTime: "5:00 pm"
    },
    {
        address: "1414 SW 3RD AVE, PORTLAND, OR 97201", 
        type: "bluebox",
        collectionTime: "5:00 pm"
    }
];

// Add to history
testLocations.forEach(location => {
    addToHistory(location);
    console.log(`Added to history: ${location.address}`);
});

console.log("\nHistory updated successfully!");
