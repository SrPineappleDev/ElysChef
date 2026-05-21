// Página del panel de administración.
// Muestra KPIs de la aplicación y permite gestionar el catálogo de alergias.

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { Users, ChefHat, Coins, TrendingUp, Trash2, Plus, ShieldCheck, Archive, ArchiveRestore, FileSpreadsheet } from "lucide-react";
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
    countries,
    newCountry,
    setNewCountry,
    savingCountry,
    handleAddCountry,
    handleArchiveCountry,
    handleRestoreCountry,
    categories,
    newCategory,
    setNewCategory,
    savingCategory,
    handleAddCategory,
    handleArchiveCategory,
    handleRestoreCategory,
    diets,
    newDiet,
    setNewDiet,
    savingDiet,
    handleAddDiet,
    handleArchiveDiet,
    handleRestoreDiet,
    downloadingExcel,
    handleDownloadExcel,
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
        <Button onClick={handleDownloadExcel} disabled={downloadingExcel} variant="outline" className="ml-auto">
          <FileSpreadsheet className="w-4 h-4 mr-2" />
          {downloadingExcel ? "Generando..." : "Descargar Excel"}
        </Button>
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

      {/* Recetas por país y por dieta */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Recetas por país */}
        <Card className="p-5">
          <h2 className="font-display font-semibold text-base mb-4">Recetas por país (top 10)</h2>
          {(recipeStats?.byCountry || []).length === 0 ? (
            <p className="text-sm text-muted-foreground">Sin datos aún.</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={recipeStats?.byCountry || []} layout="vertical" margin={{ left: 20 }}>
                <XAxis type="number" allowDecimals={false} />
                <YAxis type="category" dataKey="country" width={90} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* Recetas por dieta */}
        <Card className="p-5">
          <h2 className="font-display font-semibold text-base mb-4">Recetas por dieta (VIP)</h2>
          {(recipeStats?.byDiet || []).length === 0 ? (
            <p className="text-sm text-muted-foreground">Sin datos aún.</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={recipeStats?.byDiet || []} layout="vertical" margin={{ left: 20 }}>
                <XAxis type="number" allowDecimals={false} />
                <YAxis type="category" dataKey="diet" width={90} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(var(--accent))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
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

      {/* Gestión de catálogos */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">

        {/* Catálogo de alergias */}
        <Card className="p-5">
          <h2 className="font-display font-semibold text-base mb-4">Catálogo de alergias</h2>
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
          <div className="flex flex-wrap gap-2">
            {catalog.map((allergy) => (
              <div key={allergy.id} className="flex items-center gap-1.5 bg-muted rounded-full px-3 py-1.5 text-sm font-medium">
                {allergy.name}
                <button onClick={() => handleDeleteAllergy(allergy.id)} className="text-muted-foreground hover:text-destructive transition-colors ml-1" title="Eliminar">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
            {catalog.length === 0 && <p className="text-sm text-muted-foreground">No hay alergias en el catálogo.</p>}
          </div>
        </Card>

        {/* Catálogo de países */}
        <Card className="p-5">
          <h2 className="font-display font-semibold text-base mb-4">Catálogo de países</h2>
          <div className="flex gap-2 mb-4">
            <Input
              placeholder="Nuevo país (ej. Brasil)"
              value={newCountry}
              onChange={(e) => setNewCountry(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddCountry()}
              className="max-w-xs"
            />
            <Button onClick={handleAddCountry} disabled={savingCountry || !newCountry.trim()} className="gradient-hero text-primary-foreground font-semibold">
              <Plus className="w-4 h-4 mr-1" /> Añadir
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
            {countries.filter((c) => !c.archived).map((c) => (
              <div key={c.id} className="flex items-center gap-1.5 bg-muted rounded-full px-3 py-1.5 text-sm font-medium">
                {c.name}
                <button onClick={() => handleArchiveCountry(c.id)} className="text-muted-foreground hover:text-amber-500 transition-colors ml-1" title="Archivar">
                  <Archive className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
            {countries.filter((c) => !c.archived).length === 0 && <p className="text-sm text-muted-foreground">No hay países activos.</p>}
          </div>
          {countries.some((c) => c.archived) && (
            <div className="mt-3 pt-3 border-t border-border">
              <p className="text-xs text-muted-foreground mb-2">Archivados</p>
              <div className="flex flex-wrap gap-2">
                {countries.filter((c) => c.archived).map((c) => (
                  <div key={c.id} className="flex items-center gap-1.5 bg-muted/50 rounded-full px-3 py-1.5 text-sm font-medium text-muted-foreground">
                    {c.name}
                    <button onClick={() => handleRestoreCountry(c.id)} className="hover:text-primary transition-colors ml-1" title="Restaurar">
                      <ArchiveRestore className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>

        {/* Catálogo de categorías */}
        <Card className="p-5">
          <h2 className="font-display font-semibold text-base mb-4">Catálogo de categorías</h2>
          <div className="flex gap-2 mb-4">
            <Input
              placeholder="Nueva categoría (ej. Brunch)"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddCategory()}
              className="max-w-xs"
            />
            <Button onClick={handleAddCategory} disabled={savingCategory || !newCategory.trim()} className="gradient-hero text-primary-foreground font-semibold">
              <Plus className="w-4 h-4 mr-1" /> Añadir
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.filter((c) => !c.archived).map((c) => (
              <div key={c.id} className="flex items-center gap-1.5 bg-muted rounded-full px-3 py-1.5 text-sm font-medium">
                {c.label}
                <button onClick={() => handleArchiveCategory(c.id)} className="text-muted-foreground hover:text-amber-500 transition-colors ml-1" title="Archivar">
                  <Archive className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
            {categories.filter((c) => !c.archived).length === 0 && <p className="text-sm text-muted-foreground">No hay categorías activas.</p>}
          </div>
          {categories.some((c) => c.archived) && (
            <div className="mt-3 pt-3 border-t border-border">
              <p className="text-xs text-muted-foreground mb-2">Archivadas</p>
              <div className="flex flex-wrap gap-2">
                {categories.filter((c) => c.archived).map((c) => (
                  <div key={c.id} className="flex items-center gap-1.5 bg-muted/50 rounded-full px-3 py-1.5 text-sm font-medium text-muted-foreground">
                    {c.label}
                    <button onClick={() => handleRestoreCategory(c.id)} className="hover:text-primary transition-colors ml-1" title="Restaurar">
                      <ArchiveRestore className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>

        {/* Catálogo de dietas (VIP) */}
        <Card className="p-5">
          <h2 className="font-display font-semibold text-base mb-4">Catálogo de dietas <span className="text-xs text-muted-foreground font-normal">(solo VIP)</span></h2>
          <div className="flex gap-2 mb-4">
            <Input
              placeholder="Nueva dieta (ej. 🫀 Sin sodio)"
              value={newDiet}
              onChange={(e) => setNewDiet(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddDiet()}
              className="max-w-xs"
            />
            <Button onClick={handleAddDiet} disabled={savingDiet || !newDiet.trim()} className="gradient-hero text-primary-foreground font-semibold">
              <Plus className="w-4 h-4 mr-1" /> Añadir
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {diets.filter((d) => !d.archived).map((d) => (
              <div key={d.id} className="flex items-center gap-1.5 bg-muted rounded-full px-3 py-1.5 text-sm font-medium">
                {d.label}
                <button onClick={() => handleArchiveDiet(d.id)} className="text-muted-foreground hover:text-amber-500 transition-colors ml-1" title="Archivar">
                  <Archive className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
            {diets.filter((d) => !d.archived).length === 0 && <p className="text-sm text-muted-foreground">No hay dietas activas.</p>}
          </div>
          {diets.some((d) => d.archived) && (
            <div className="mt-3 pt-3 border-t border-border">
              <p className="text-xs text-muted-foreground mb-2">Archivadas</p>
              <div className="flex flex-wrap gap-2">
                {diets.filter((d) => d.archived).map((d) => (
                  <div key={d.id} className="flex items-center gap-1.5 bg-muted/50 rounded-full px-3 py-1.5 text-sm font-medium text-muted-foreground">
                    {d.label}
                    <button onClick={() => handleRestoreDiet(d.id)} className="hover:text-primary transition-colors ml-1" title="Restaurar">
                      <ArchiveRestore className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>

      </div>
    </div>
  );
};

export default Admin;
