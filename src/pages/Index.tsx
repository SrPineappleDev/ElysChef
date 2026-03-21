// Página principal (landing page) de la aplicación.
// Muestra la sección hero con imagen de fondo, la sección de características
// y una sección de llamada a la acción (CTA) para invitar al usuario a empezar.

import { Link } from "react-router-dom";
import { Camera, Type, Sparkles, Flame, ChefHat, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-food.png";

// Lista de características de la aplicación para la sección "¿Cómo funciona?"
const features = [
  {
    icon: Camera,
    title: "Reconocimiento por Imagen",
    desc: "Sube una foto de tus ingredientes y la IA los detectará automáticamente.",
  },
  {
    icon: Type,
    title: "Entrada por Texto",
    desc: "Escribe manualmente los ingredientes que tienes disponibles.",
  },
  {
    icon: Sparkles,
    title: "Recetas con IA",
    desc: "Genera recetas personalizadas basadas en tus ingredientes.",
  },
  {
    icon: Flame,
    title: "Cálculo Calórico",
    desc: "Obtén información nutricional detallada de cada receta.",
  },
];

/**
 * Página de inicio con tres secciones:
 * 1. Hero: imagen de fondo con titular y botón de acción principal.
 * 2. Features: cuadrícula con las 4 funcionalidades principales.
 * 3. CTA: tarjeta de llamada a la acción para animar al usuario a comenzar.
 */
const Index = () => {
  return (
    <div className="min-h-screen">
      {/* Sección hero con imagen de fondo y degradado oscuro */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImage} alt="Ingredientes frescos" className="w-full h-full object-cover" />
          {/* Degradado para mejorar la legibilidad del texto sobre la imagen */}
          <div className="absolute inset-0 bg-gradient-to-r from-foreground/80 via-foreground/60 to-foreground/30" />
        </div>
        <div className="relative container mx-auto px-4 py-24 md:py-36">
          <div className="max-w-xl space-y-6">
            <h1 className="font-display font-bold text-4xl md:text-5xl lg:text-6xl text-primary-foreground leading-tight">
              Cocina inteligente con lo que tienes
            </h1>
            <p className="text-lg text-primary-foreground/80 leading-relaxed">
              Sube una foto de tus ingredientes o escríbelos. Ely's Chef genera recetas personalizadas con toda la información nutricional que necesitas.
            </p>
            {/* Botón principal que lleva a la página de análisis de ingredientes */}
            <div className="flex flex-wrap gap-3 pt-2">
              <Link to="/analyze">
                <Button className="gradient-hero text-primary-foreground h-12 px-6 font-display font-semibold text-base">
                  <Camera className="w-5 h-5 mr-2" />
                  Empezar Ahora
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Sección de características: explica las funcionalidades principales */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="font-display font-bold text-3xl text-foreground">¿Cómo funciona?</h2>
          <p className="text-muted-foreground mt-2 max-w-md mx-auto">
            Desde tus ingredientes hasta un plato delicioso en segundos.
          </p>
        </div>
        {/* Cuadrícula de tarjetas de características con animación de entrada escalonada */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <div
              key={i}
              className="bg-card border border-border rounded-2xl p-6 text-center hover:shadow-lg transition-shadow animate-fade-in"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="w-14 h-14 rounded-xl gradient-hero flex items-center justify-center mx-auto mb-4">
                <f.icon className="w-7 h-7 text-primary-foreground" />
              </div>
              <h3 className="font-display font-semibold text-foreground mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Sección CTA: invita al usuario a comenzar a usar la aplicación */}
      <section className="container mx-auto px-4 pb-20">
        <div className="gradient-warm rounded-2xl p-8 md:p-12 text-center">
          <ChefHat className="w-12 h-12 text-primary mx-auto mb-4" />
          <h2 className="font-display font-bold text-2xl text-foreground mb-2">
            ¿Listo para cocinar?
          </h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Descubre recetas saludables adaptadas a los ingredientes que ya tienes en casa.
          </p>
          <Link to="/analyze">
            <Button className="gradient-hero text-primary-foreground h-12 px-8 font-display font-semibold">
              Analizar Ingredientes
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Index;
