import fs from "fs";
import csv from "csv-parser";
import { createClient } from "@supabase/supabase-js";

// 🔧 CONFIGURACIÓN SUPABASE
const SUPABASE_URL = "https://efkmmvhcihoylowfqkzf.supabase.co"; // tu URL real
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVma21tdmhjaWhveWxvd2Zxa3pmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjU5Mzc2MiwiZXhwIjoyMDc4MTY5NzYyfQ.rKf4-d1Rj8sDQaVsEvdMpJEn-oLqibucNGk9nvYpsK4";    // ⚠️ tu clave service_role completa
const RUTA_CSV = "C:\\proyectos\\mitaller\\vehiculos_contraseñas.csv"; // ruta al archivo que generaste

// Crear conexión
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function importarCSV() {
  console.log("🚗 Iniciando importación a Supabase...");

  // 1️⃣ Borrar todos los registros existentes
  console.log("🧹 Eliminando registros anteriores...");
  const { error: deleteError } = await supabase
    .from("vehiculos")
    .delete()
    .neq("matricula", "ASESOR");

  if (deleteError) {
    console.error("❌ Error al borrar:", deleteError.message);
    return;
  }
  console.log("✅ Tabla limpia.");

// 2️⃣ Leer el CSV generado
if (!fs.existsSync(RUTA_CSV)) {
  console.error("❌ No se encontró el archivo CSV:", RUTA_CSV);
  return;
}

const registros = [];

// 🔍 Forzar separador punto y coma
const separador = ",";

console.log(`📎 Usando separador fijo: punto y coma (;)`);

fs.createReadStream(RUTA_CSV)
  .pipe(csv({ separator: separador }))
  .on("data", (row) => {
    console.log("➡️  Línea leída:", row);
    if (row.matricula && row.telefono) {
      registros.push({
        matricula: row.matricula.trim(),
        fecha_actualizacion: row.fecha_actualizacion?.trim() || "",
        estado: row.estado?.trim() || "",
        telefono: row.telefono.trim(),
        password_hash: row.password_hash?.trim() || "",
      });
    }
  })
  .on("end", async () => {
    console.log(`📄 ${registros.length} registros leídos. Subiendo...`);

    const { error } = await supabase.from("vehiculos").insert(registros);

    if (error) {
      console.error("❌ Error al subir:", error.message);
    } else {
      console.log("✅ Registros importados correctamente a Supabase.");
    }
  });
}

// Ejecutar el proceso principal
importarCSV();
