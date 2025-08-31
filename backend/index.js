const express = require("express");
const cors = require("cors");
const { createClient } = require("@supabase/supabase-js");
const five = require("johnny-five");

// Servir archivos estáticos desde la carpeta public
const path = require("path");


// 🔹 Inicializar supabase
const supabase = createClient("https://mysqjdsinuwpyojeknfg.supabase.co",
     "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15c3FqZHNpbnV3cHlvamVrbmZnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjUyNzUyOCwiZXhwIjoyMDcyMTAzNTI4fQ.IU0iaqTb-8ANUq-lsms8dVzgc-V6ovc0_GSYbI_t9xU");

// 🔹 Inicializar arduino
const board = new five.Board();
let servo;
let led;
board.on("ready", () => {
  console.log("Arduino listo 🚀");
  servo = new five.Servo(9);
  led = new five.Led(13); // Inicializamos el LED

  // Posición inicial
  servo.to(0);
  led.on(); // LED encendido al inicio
});

// 🔹 Express
const app = express();
app.use(cors());
app.use(express.json());


app.use(express.static(path.join(__dirname, "../public")));

// API para transacción
app.post("/dispensar", async (req, res) => {
  try {
    const { userId, maquinaId, mezcla } = req.body;

    // 1. Obtener saldo actual
    const { data: user, error: userError } = await supabase
      .from("usuarios")
      .select("saldo")
      .eq("id", userId)
      .maybeSingle();

    if (userError) return res.status(500).json({ error: userError.message });

    // 2. Calcular monto según mezcla
    const monto = 1000; // O función: calcularMonto(mezcla)
    if (user.saldo < monto) return res.status(400).json({ error: "Saldo insuficiente" });

    // 3. Registrar transacción
    await supabase.from("transacciones").insert([{
      user_id: userId,
      maquina_id: maquinaId,
      mezcla,
      monto
    }]);

    // 4. Descontar saldo
    await supabase.from("usuarios").update({ saldo: user.saldo - monto }).eq("id", userId);

    // 5. Activar motor
    if (servo) {
  // Mueve el servo a 90°
  servo.to(90);

  // Apagar el LED cuando empieza el movimiento
  led.off();

  setTimeout(() => {
    // Vuelve a la posición inicial
    servo.to(0);

    // Encender el LED después del movimiento
    led.on();
  }, 2000); // 2 segundos, igual que el servo
}


    res.json({ success: true, nuevoSaldo: user.saldo - monto });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error inesperado" });
  }
});

// Obtener saldo por userId
app.get("/saldo/:id", async (req, res) => {
  const userId = req.params.id;
  console.log("Recibiendo request para userId:", userId); // debug

  try {
    const { data, error } = await supabase
      .from("usuarios")
      .select("saldo")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error en Supabase:", error); // debug completo
      return res.status(500).json({ error: error.message });
    }

    console.log("Saldo encontrado:", data); // debug
    res.json({ saldo: data.saldo });
  } catch (err) {
    console.error("Error interno:", err); // debug
    res.status(500).json({ error: "Error inesperado" });
  }
});



// Redirigir la raíz al login

app.listen(3000, () => console.log("Servidor en http://localhost:3000"));
