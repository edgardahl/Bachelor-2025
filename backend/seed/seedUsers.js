import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import { supabase } from '../config/supabaseClient.js'; // ✅

dotenv.config();

// Store ID for the store we are assigning the users to
const storeId = '2dd73e94-a0b2-4a0a-9cda-34d9915542ca';
const municipalityId = '15ab914f-da77-4a94-9228-b52e3b805ae5'; // Municipality ID for all users
const availability = 'available'; // All users will have the same availability

// List of employees and one manager, names play on "Edgar"
const usersToCreate = [
  {
    first_name: 'Edgar',
    last_name: 'Johnson',
    email: 'edgar.johnson@example.com',
    role: 'employee',
    store_id: storeId,
    phone_number: '123-456-7890'
  },
  {
    first_name: 'Edgarina',
    last_name: 'Doe',
    email: 'edgarina.doe@example.com',
    role: 'employee',
    store_id: storeId,
    phone_number: '123-456-7891'
  },
  {
    first_name: 'Edgardo',
    last_name: 'Smith',
    email: 'edgardo.smith@example.com',
    role: 'employee',
    store_id: storeId,
    phone_number: '123-456-7892'
  },
  {
    first_name: 'Edgareth',
    last_name: 'Williams',
    email: 'edgareth.williams@example.com',
    role: 'employee',
    store_id: storeId,
    phone_number: '123-456-7893'
  },
  {
    first_name: 'Edgario',
    last_name: 'Miller',
    email: 'edgario.miller@example.com',
    role: 'employee',
    store_id: storeId,
    phone_number: '123-456-7894'
  },
  {
    first_name: 'Edgaro',
    last_name: 'Brown',
    email: 'edgaro.brown@example.com',
    role: 'employee',
    store_id: storeId,
    phone_number: '123-456-7895'
  }
];

const createUsers = async () => {
  try {
    for (const user of usersToCreate) {
      const { first_name, last_name, email, role, store_id, phone_number } = user;
      const password = email; // Password is same as the email
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insert the user into the database
      const { data, error } = await supabase
        .from('users')
        .insert([
          {
            first_name,
            last_name,
            email,
            role,
            store_id,
            phone_number,
            municipality_id: municipalityId,  // Adding the municipality_id
            availability,  // Adding availability
            password: hashedPassword, // Save the hashed password
          }
        ]);

      if (error) {
        console.error(`❌ Failed to insert ${email}:`, error.message);
      } else {
        console.log(`✅ User created for ${email}`);
      }
    }

    console.log('🎉 All users created!');
    process.exit();
  } catch (err) {
    console.error('❌ Error creating users:', err.message);
    process.exit(1);
  }
};

createUsers();
