// Página del panel de administración.
// Muestra KPIs de la aplicación y permite gestionar el catálogo de alergias.

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { Users, ChefHat, Coins, TrendingUp, Trash2, Plus, ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAdminController } from "@/controllers/use-admin-controller";

const PLAN_COLORS = ["#a3a3a3", "#f59e0b"];

const KpiCard = ({ icon: Icon, label, value, sub }: { icon: any; label: string; value: string | number; sub?: string }) => (
  <Card className="p-5 flex items-center gap-4">
    <div className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
      <Icon className="w-5 h-5 text-primary" />
    </div>
    <div>
      <p className="text-xs text-muted-foreground font-medium">{label}</p>
      <p className="font-display font-bold text-2xl text-foreground">{value}</p>
      {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
    </div>
  </Card>
);

const Admin = () => {
  const {
    loading,
    userStats,
    recipeStats,
    allergyStats,
    creditStats,
    catalog,
    newAllergyName,
    setNewAllergyName,
    savingAllergy,
    handleAddAllergy,
    handleDeleteAllergy,
  } = useAdminController();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const planData = [
    { name: "Gratuito", value: userStats?.free || 0 },
    { name: "VIP", value: userStats?.vip || 0 },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl animate-fade-in">
      <div className="flex items-center gap-3 mb-8">
        <ShieldCheck className="w-7 h-7 text-primary" />
        <h1 className="font-display font-bold text-3xl text-foreground">Panel de Administración</h1>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KpiCard icon={Users} label="Usuarios totales" value={userStats?.total || 0} sub={`+${userStats?.newThisWeek || 0} esta semana`} />
        <KpiCard icon={TrendingUp} label="Usuarios VIP" value={userStats?.vip || 0} sub={`${userStats?.free || 0} gratuitos`} />
        <KpiCard icon={ChefHat} label="Recetas generadas" value={recipeStats?.total || 0} />
        <KpiCard icon={Coins} label="Créditos consumidos" value={creditStats?.totalConsumed || 0} sub="estimación" />
      </div>

      {/* Gráficos */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Distribución de planes */}
        <Card className="p-5">
          <h2 className="font-display font-semibold text-base mb-4">Distribución de planes</h2>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={planData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                labelLine={false}
                label={({ cx, cy, midAngle, innerRadius, outerRadius, value }) => {
                  if (value === 0) return null;
                  const RADIAN = Math.PI / 180;
                  const r = innerRadius + (outerRadius - innerRadius) / 2;
                  const x = cx + r * Math.cos(-midAngle * RADIAN);
                  const y = cy + r * Math.sin(-midAngle * RADIAN);
                  return (
                    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={14} fontWeight="bold">
                      {value}
                    </text>
                  );
                }}
              >
                {planData.map((_, i) => <Cell key={i} fill={PLAN_COLORS[i]} />)}
              </Pie>
              <Tooltip formatter={(value, name) => [value, name]} />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* Recetas por categoría */}
        <Card className="p-5">
          <h2 className="font-display font-semibold text-base mb-4">Recetas por categoría</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={recipeStats?.byCategory || []} layout="vertical" margin={{ left: 20 }}>
              <XAxis type="number" allowDecimals={false} />
              <YAxis type="category" dataKey="category" width={80} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Alergias más comunes */}
      {allergyStats.length > 0 && (
        <Card className="p-5 mb-8">
          <h2 className="font-display font-semibold text-base mb-4">Alergias más comunes entre usuarios</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={allergyStats} layout="vertical" margin={{ left: 20 }}>
              <XAxis type="number" allowDecimals={false} />
              <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" fill="hsl(var(--accent))" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Gestión del catálogo de alergias */}
      <Card className="p-5">
        <h2 className="font-display font-semibold text-base mb-4">Catálogo de alergias</h2>

        {/* Formulario para añadir */}
        <div className="flex gap-2 mb-5">
          <Input
            placeholder="Nueva alergia (ej. Kiwi)"
            value={newAllergyName}
            onChange={(e) => setNewAllergyName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddAllergy()}
            className="max-w-xs"
          />
          <Button onClick={handleAddAllergy} disabled={savingAllergy || !newAllergyName.trim()} className="gradient-hero text-primary-foreground font-semibold">
            <Plus className="w-4 h-4 mr-1" /> Añadir
          </Button>
        </div>

        {/* Lista de alergias */}
        <div className="flex flex-wrap gap-2">
          {catalog.map((allergy) => (
            <div key={allergy.id} className="flex items-center gap-1.5 bg-muted rounded-full px-3 py-1.5 text-sm font-medium">
              {allergy.name}
              <button
                onClick={() => handleDeleteAllergy(allergy.id)}
                className="text-muted-foreground hover:text-destructive transition-colors ml-1"
                title="Eliminar"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
          {catalog.length === 0 && (
            <p className="text-sm text-muted-foreground">No hay alergias en el catálogo.</p>
          )}
        </div>
      </Card>
    </div>
  );
};

export default Admin;
