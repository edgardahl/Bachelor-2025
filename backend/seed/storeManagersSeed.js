import fetch from "node-fetch";
import bcrypt from "bcrypt";

// Eksempeldata - 1 butikksjef per butikk
const storeIds = [
  "8505fa67-d150-4bb5-9a2c-19dc5dbfae9b",
  "4c2a0510-4874-4a88-8945-2164cb42df63",
  "c809e8ab-f5b6-4ec7-94d3-5fdae9f889a8",
  "21cb7817-c377-47ff-b5d6-e2bd43c8b2f2",
  "01033bfc-e97f-4b10-972d-d1f11b7619de",
  "8152543c-e102-4186-b1b7-6ec7ffca92b1",
  "a47d7c98-873a-4020-8852-6fecf4c43e77",
  "33c72926-a81a-41ab-87a8-4a597e6ccdf2",
  "c6a222e8-16f7-42b6-872d-c54db6a513db",
  "27503e1c-508f-44b1-9748-af644889704b",
  "553c5bad-1d55-4e45-9649-51f760280e30",
  "7d3de769-b84c-4331-bff8-823bfeff5812",
  "1fb8f239-8d0e-431c-a27b-f2436cc3a804",
  "bb501e1c-a4d8-4eea-9610-2170b3de1067",
  "9746a70a-f9ec-481f-9e1c-2a6d6d751248",
  "e7f02bb6-1fed-4ebe-b779-2a24cb337016",
  "f412a629-ad22-489e-8bcb-090eff61ae23",
  "fdda6a2e-5473-4db7-98ae-a0667b58f036",
  "87243282-4ecc-4660-99a7-88a2ad9738b8",
  "d9066028-2628-4534-b26f-1055b2878d5b",
  "9999df5d-0e6c-48e9-9a97-635b02c34d4e",
  "523f361f-a4c2-4785-a49b-b80d5b67884e",
  "d31e6bd5-b606-4fcd-86a6-b6783623a066",
  "ff590ec8-88b6-4a3d-84c9-d33f6c2a7580",
  "a5287e9c-7321-4fc7-a1e1-150df936e58b",
  "2c10e28d-05a5-4c5f-865c-0163b8786a01",
  "dccab746-6772-4086-b943-e8fad40d3ac0",
  "ebebd3bb-b09e-4cc1-9acc-9c8dae8a00c4",
  "90d42702-3fbb-4279-a5bc-1eef1747d806",
];

const municipalities = [
  "2bbd1abf-3c99-402f-b118-152e584410cd",
  "92d7fbd2-cd34-443c-9b84-8168df8d5b9a",
  "42b5388a-cc2a-4989-9554-8650d0af3d8d",
  "233b1e19-ce11-4046-995c-5a5c51095f40",
  "09281dcf-7a0f-4246-bd1c-32b7ba226c86",
  "c0eb3e7d-3da4-453e-b1f8-bd5d6f0ccda0",
  "42e36663-17a3-42f4-a3d0-002a6b8a64c9",
  "c13e20bb-2260-4045-ba78-388b6797e7d1",
  "3d428b00-7445-4611-857b-cb6df80f1830",
  "5addc887-8fd2-4ce6-9139-d00e54f4e57a",
  "1117ee63-64a6-4fa2-9f06-9728489d89f0",
  "89ee70eb-a080-4f09-8e2a-d67be1fee65a",
  "4c97a64a-5dcd-4c61-aafa-78023384326f",
  "72af6db6-6da4-46b7-9999-9b6524929337",
  "163ac50b-091f-41cb-ad72-4ce8642f2960",
];

const firstNames = ["Anna", "Marius", "Silje", "Jonas", "Kari", "Ola", "Ingrid", "Henrik", "Vilde", "Sander", "Emilie", "Lars", "Sofie", "Magnus", "Nora", "Elias", "Maja", "Mathias", "Sara", "Kristoffer", "Tuva"];
const lastNames = ["Johansen", "Hansen", "Larsen", "Nguyen", "Solberg", "Berg", "Andreassen", "Nilsen", "Strand", "Vold", "Karlsen", "Olsen", "Pettersen", "Sather", "Bakken", "Lund", "Eriksen", "Aas", "Haugen", "Moe", "Bjornsen"];

const generateManager = (i) => {
  const firstName = firstNames[i % firstNames.length];
  const lastName = lastNames[i % lastNames.length];
  const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@coop.com`;
  const phone = (94000000 + i).toString(); // Eks: "94000000", "94000001", ...

  return {
    first_name: firstName,
    last_name: lastName,
    email,
    password: email,
    phone_number: phone,
    store_id: storeIds[i],
    municipality_id: municipalities[i % municipalities.length],
  };
};

const seedStoreManagers = async () => {
  for (let i = 0; i < storeIds.length; i++) {
    const manager = generateManager(i);
    try {
      const res = await fetch("http://localhost:5001/api/auth/store_manager/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(manager),
      });

      const result = await res.json();

      if (res.ok) {
        console.log(`✅ Opprettet butikksjef: ${manager.email}`);
      } else {
        console.warn(`⚠️ Feil for ${manager.email}:`, result.error);
      }
    } catch (err) {
      console.error(`❌ Nettverksfeil for ${manager.email}:`, err.message);
    }
  }
};

seedStoreManagers();
