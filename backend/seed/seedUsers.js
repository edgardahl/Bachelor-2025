import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import { supabase } from '../config/supabaseClient.js'; // Adjust path if needed

dotenv.config();

const updatePassword = async () => {
  const email = 'edgardahl@gmail.com';
  const plainPassword = 'edgardahl@gmail.com';

  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    // Update the user in Supabase
    const { data, error } = await supabase
      .from('users')
      .update({ password: hashedPassword })
      .eq('email', email)
      .select('user_id, email')
      .single();

    if (error) {
      console.error('❌ Failed to update password:', error.message);
    } else {
      console.log(`✅ Password updated for ${data.email}`);
    }

    process.exit();
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
};

updatePassword();
