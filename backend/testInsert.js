//testInsert.js
import { createClient } from '@supabase/supabase-js';

// Cliente Supabase con service_role
const supabase = createClient(
  "https://mysqjdsinuwpyojeknfg.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15c3FqZHNpbnV3cHlvamVrbmZnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjUyNzUyOCwiZXhwIjoyMDcyMTAzNTI4fQ.IU0iaqTb-8ANUq-lsms8dVzgc-V6ovc0_GSYbI_t9xU"
);

async function testInsert() {
  const { data, error } = await supabase
  .from("transacciones")
  .insert([
    {
      user_id: null,
      maquina_id: "MAQ001",
      mezcla: { menta: 50, jengibre: 25, limon: 25 },
      monto: 1000
    }
  ]);

  if (error) {
    console.error("Error insertando:", error);
  } else {
    console.log("Transacción insertada:", data);
  }
}

testInsert();
