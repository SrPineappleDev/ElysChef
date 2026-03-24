// Componente de visualización del saldo de créditos del usuario.
// Muestra un badge con el número de créditos disponibles, coloreado según el nivel de saldo.

import { Coins } from "lucide-react";

interface CreditsDisplayProps {
  credits: number;
}

/**
 * Badge que muestra el saldo de créditos del usuario.
 * Verde si > 100, ámbar si entre 25 y 100, rojo si < 25.
 */
const CreditsDisplay = ({ credits }: CreditsDisplayProps) => {
  const colorClass =
    credits > 100
      ? "bg-green-500/10 text-green-600 border-green-500/20"
      : credits >= 25
      ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
      : "bg-red-500/10 text-red-600 border-red-500/20";

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold ${colorClass}`}>
      <Coins className="w-3.5 h-3.5" />
      {credits} créditos
    </span>
  );
};

export default CreditsDisplay;
