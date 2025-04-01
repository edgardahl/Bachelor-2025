import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import { supabase } from '../config/supabaseClient.js'; // ✅



dotenv.config();

const usersToUpdate = [
  {
    email: 'alice.johnson@example.com',
    password: 'Password123!',
  },
  {
    email: 'john.doe@example.com',
    password: 'Password123!',
  },
  {
    email: 'jane.smith@example.com',
    password: 'Password123!',
  },
];

const setPasswordsForUsers = async () => {
  try {
    for (const user of usersToUpdate) {
      const hashedPassword = await bcrypt.hash(user.password, 10);

      const { data, error } = await supabase
        .from('users')
        .update({ password: hashedPassword })
        .eq('email', user.email);

      if (error) {
        console.error(`❌ Failed to update ${user.email}:`, error.message);
      } else {
        console.log(`✅ Password updated for ${user.email}`);
      }
    }

    console.log('🎉 All passwords set!');
    process.exit();
  } catch (err) {
    console.error('❌ Error updating passwords:', err.message);
    process.exit(1);
  }
};

setPasswordsForUsers();
