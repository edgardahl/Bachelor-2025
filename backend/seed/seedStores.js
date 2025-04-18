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
