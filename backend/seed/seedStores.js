/**
 * Store Seeder Script for Creating New Stores
 *
 * This script is used to generate and register new stores in your system. The script will:
 * - Fetch the geolocation (latitude & longitude) for each store using the OpenStreetMap API.
 * - Create a new store by sending a POST request to a specified API endpoint.
 * 
 * Usage Instructions:
 * 
 * 1. **Customizing the Store List**:
 *    - You can add as many stores as you want by modifying the `sampleStores` array.
 *    - Each store should be an object with the following fields:
 *      - `name`: The name of the store (e.g., "Coop Mega").
 *      - `store_chain`: The chain to which the store belongs (e.g., "Coop Mega").
 *      - `municipality_id`: The ID of the municipality where the store is located (e.g., "b92e88ee-684f-4d5c-b666-dd19078ac60a").
 *      - `address`: The full address of the store, which will be used to fetch geolocation data (e.g., "Lagos, Nigeria").
 *      - `phone_number`: The store's phone number (e.g., "+69 00000000").
 *      - `email`: The store's contact email address (e.g., "no.internet@nigeria.nig").
 *      - `manager_id`: If applicable, the ID of the store manager (can be `null` if no manager is assigned).
 *    - Example of a new store object:
 *      ```javascript
 *      {
 *        name: "New Store Name",
 *        store_chain: "Store Chain Name",
 *        municipality_id: "municipality-id-here",
 *        address: "Store Address Here",
 *        phone_number: "+47 12345678",
 *        email: "contact@newstore.com",
 *        manager_id: null // or the manager's ID if available
 *      }
 *      ```
 *      
 * 2. **Geolocation**:
 *    - The script automatically fetches the latitude and longitude of each store based on the `address` field.
 *    - If no geolocation data is found for a store, a warning will be displayed, and that store will be skipped.
 * 
 * 3. **Running the Script**:
 *    - After customizing the list of stores in the `sampleStores` array, you can run this script to create the stores.
 *    - Run it using the following command in your terminal: 
 *      ```bash
 *      node your_script_name.js
 *      ```
 * 
 * 4. **Error Handling**:
 *    - If an error occurs during the store creation (e.g., bad API response, network issues, etc.), the script will display an error message in the console.
 * 
 * **Important Notes**:
 * - The script uses OpenStreetMap's Nominatim API to fetch coordinates for each store address. If your address is not found, the store will be skipped.
 * - The API for creating a store must be set up correctly on the backend (`POST https://localhost:5001/api/stores/createNewStore`).
 */



process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
import fetch from "node-fetch";

// Sample stores with updated municipalities around Eastern Norway
const sampleStores = [
  {
    name: "Lagos niggeria",
    store_chain: "Coop Mega",
    municipality_id: "b92e88ee-684f-4d5c-b666-dd19078ac60a", // Lillehammer
    address: "Lagos nigeria",
    phone_number: "+69 00000000",
    email: "no.internet@nigeria.nig",
    manager_id: null,
  }
];

async function seedStores() {
  for (const store of sampleStores) {
    try {
      // Get coordinates from OpenStreetMap
      const geoRes = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(store.address)}`
      );
      const geoData = await geoRes.json();

      if (!geoData.length) {
        console.warn(`⚠️ No geocode result for: ${store.name}`);
        continue;
      }

      const latitude = parseFloat(geoData[0].lat);
      const longitude = parseFloat(geoData[0].lon);

      // Send POST request using node-fetch
      const res = await fetch("https://localhost:5001/api/stores/createNewStore", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...store,
          latitude,
          longitude,
        }),
      });

      if (!res.ok) {
        const errorData = await res.text();
        throw new Error(errorData);
      }

      const result = await res.json();
      console.log(`✅ Created store: ${result.name}`);
    } catch (error) {
      console.error(`❌ Failed to create store: ${store.name}`);
      console.error(error.message);
    }
  }
}

seedStores();
