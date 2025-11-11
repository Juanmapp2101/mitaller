import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

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
    if (coincide) {
      setAcceso(true);
    } else {
      setError("Contraseña incorrecta.");
    }
  };

  if (!vehiculo) {
    return <p>Vehículo no encontrado</p>;
  }

  if (!acceso) {
    return (
      <div style={{ padding: 40, fontFamily: "sans-serif" }}>
        <h2>Acceso al estado de su reparación</h2>
        <p>Matrícula: <strong>{vehiculo.matricula}</strong></p>
        <form onSubmit={verificarPassword}>
          <input
            type="password"
            placeholder="Ingrese su contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ padding: 8, marginRight: 10 }}
          />
          <button type="submit">Entrar</button>
        </form>
        {error && <p style={{ color: "red" }}>{error}</p>}
      </div>
    );
  }

  return (
    <div style={{ padding: 40, fontFamily: "sans-serif" }}>
      <h2>Estado de reparación</h2>
      <p><strong>Matrícula:</strong> {vehiculo.matricula}</p>
      <p><strong>Última actualización:</strong> {vehiculo.fecha_actualizacion}</p>
      <p><strong>Estado:</strong> {vehiculo.estado}</p>
    </div>
  );
}

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

