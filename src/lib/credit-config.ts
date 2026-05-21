// Costes de créditos y saldos iniciales del lado del cliente.
// Usados por la UI para validación previa y visualización; las Edge Functions
// aplican sus propias comprobaciones de créditos de forma independiente en el servidor.
export const CREDITS = {
  COST_GENERATE: 50,
  COST_ANALYZE_IMAGE: 25,
  INITIAL_FREE: 200,
  INITIAL_VIP: 500,
} as const;
