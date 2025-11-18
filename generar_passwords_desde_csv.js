import fs from "fs";
import bcrypt from "bcryptjs";

// 🔧 Ruta al archivo CSV original
const archivoCSV = "vehiculos.csv";

// Leer el archivo
const data = fs.readFileSync(archivoCSV, "utf8").trim();

// Detectar separador (coma, punto y coma o tabulador)
const separador = data.includes(";") ? ";" : data.includes("\t") ? "\t" : ",";

// Dividir en líneas
const filas = data.split("\n");

// Encabezados
const headers = filas[0].split(separador).map((h) => h.trim().toLowerCase());

// Índices de cada columna
const idxMatricula = headers.indexOf("matricula");
const idxFecha = headers.indexOf("fecha_actualizacion");
const idxEstado = headers.indexOf("estado");
const idxTelefono = headers.indexOf("telefono");

if (idxTelefono === -1) {
  console.error("❌ No se encontró la columna 'telefono' en el CSV.");
  process.exit(1);
}

let salida = "matricula,fecha_actualizacion,estado,telefono,password,password_hash\n";

// Procesar cada fila (a partir de la 2ª)
for (let i = 1; i < filas.length; i++) {
  const valores = filas[i].split(separador).map((v) => v.trim());

  if (valores.length < 4 || !valores[idxTelefono]) continue;

  const matricula = valores[idxMatricula];
  const fecha = valores[idxFecha];
  const estado = valores[idxEstado];
  const telefono = valores[idxTelefono];

  // Contraseña = últimos 5 dígitos del teléfono
  const password = telefono.slice(-5);
  const password_hash = bcrypt.hashSync(password, 10);

  salida += `${matricula},${fecha},${estado},${telefono},${password},${password_hash}\n`;
}

fs.writeFileSync("vehiculos_contraseñas.csv", salida, { encoding: "utf8" });
console.log("✅ Archivo generado correctamente: vehiculos_contraseñas.csv");
