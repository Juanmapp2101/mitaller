import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// 🖼️ Carrusel de imágenes
const imagenes = [
  "/imagenes/foto1.jpg",
  "/imagenes/foto2.jpg",
  "/imagenes/foto3.jpg",
];

function Carrusel() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % imagenes.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full flex justify-center mb-6 transition-all duration-500">
      <img
        src={imagenes[index]}
        alt="Taller"
        className="w-full max-w-3xl h-56 sm:h-72 object-cover rounded-2xl shadow-lg transition-all duration-700"
      />
    </div>
  );
}

export default function Vehiculo({ vehiculo }) {
  const [password, setPassword] = useState("");
  const [acceso, setAcceso] = useState(false);
  const [error, setError] = useState("");

  const verificarPassword = async (e) => {
    e.preventDefault();
    setError("");

    if (!vehiculo?.password_hash) {
      setError("No se encontró el vehículo o no tiene contraseña configurada.");
      return;
    }

    const coincide = await bcrypt.compare(password, vehiculo.password_hash);
    if (coincide) setAcceso(true);
    else setError("Contraseña incorrecta.");
  };

  // 🚫 Vehículo no encontrado
  if (!vehiculo) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-[#0A3D62] to-[#1B4F72] text-white text-center p-6">
        <img src="/logo.png" alt="Logo del taller" className="w-40 mb-6" />
        <h2 className="text-2xl font-semibold mb-2">Vehículo no encontrado</h2>
        <p className="text-sm text-gray-200">
          Por favor, revisa la matrícula o contacta con el taller.
        </p>
      </div>
    );
  }

  // 🔒 Pantalla de acceso con contraseña
  if (!acceso) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-[#0A3D62] to-[#1B4F72] p-4 text-white">
        <Carrusel />

        <div className="bg-white text-gray-800 rounded-2xl shadow-2xl p-8 w-full max-w-md text-center">
          <img
            src="/logo.png"
            alt="Logo del taller"
            className="w-40 mx-auto mb-6"
          />
          <h1 className="text-2xl font-bold mb-2 text-[#0A3D62]">
            Acceso al estado de reparación
          </h1>
          <p className="mb-4 text-sm text-gray-600">
            Matrícula: <strong>{vehiculo.matricula}</strong>
          </p>
          <form onSubmit={verificarPassword} className="space-y-4">
            <input
              type="password"
              placeholder="Ingrese su contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-[#F39C12]"
            />
            <button
              type="submit"
              className="w-full bg-[#F39C12] text-white font-semibold py-3 rounded-lg hover:bg-[#D68910] transition-all"
            >
              Entrar
            </button>
          </form>
          {error && <p className="mt-3 text-red-600">{error}</p>}
        </div>
      </div>
    );
  }

  // ✅ Acceso concedido → Mostrar estado
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-[#0A3D62] to-[#1B4F72] p-4 text-white">
      <Carrusel />

      <div className="bg-white text-gray-800 rounded-2xl shadow-2xl p-8 w-full max-w-md text-center">
        <img
          src="/logo.png"
          alt="Logo del taller"
          className="w-40 mx-auto mb-4"
        />
        <h1 className="text-2xl font-bold mb-4 text-[#0A3D62]">
          Estado de reparación
        </h1>
        <div className="space-y-2 text-gray-700">
          <p>
            <strong>Matrícula:</strong> {vehiculo.matricula}
          </p>
          <p>
            <strong>Última actualización:</strong>{" "}
            {vehiculo.fecha_actualizacion || "Sin fecha"}
          </p>
          <p>
            <strong>Estado:</strong>{" "}
            <span className="text-[#0A3D62] font-semibold">
              {vehiculo.estado || "Sin información"}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

// ⚙️ Obtener datos desde Supabase
export async function getServerSideProps({ params }) {
  const { matricula } = params;
  const { data, error } = await supabase
    .from("vehiculos")
    .select("*")
    .eq("matricula", matricula)
    .single();

  if (error || !data) {
    return { props: { vehiculo: null } };
  }

  return { props: { vehiculo: data } };
}
