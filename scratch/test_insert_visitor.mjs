import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const envFile = fs.readFileSync(path.resolve('.env'), 'utf-8');
const envVars = Object.fromEntries(
  envFile.split(/\r?\n/)
    .filter(line => line && !line.startsWith('#'))
    .map(line => {
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match) {
        return [match[1].trim(), match[2].trim().replace(/^"|"$/g, '')];
      }
      return null;
    })
    .filter(Boolean)
);

const supabase = createClient(envVars.EXPO_PUBLIC_SUPABASE_URL, envVars.EXPO_PUBLIC_SUPABASE_ANON_KEY);

async function testInsert() {
  const { data, error } = await supabase.from('visitors').insert({
    first_name: 'Test',
    last_name: 'User',
    tc_no: '00000000000',
    title: 'AnonTest',
    is_external: true,
    is_foreign: false
  }).select('id').single();
  
  if (error) {
    console.error('Insert Visitor Error:', error.message);
  } else {
    console.log('Inserted Visitor Successfully:', data);
    
    // Now try insert visit
    // but we need a valid visited_person_id (uuid) which we don't have unless we know one.
    // Let's just output the victory.
  }
}

testInsert();
