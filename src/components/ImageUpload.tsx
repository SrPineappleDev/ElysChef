// Componente de subida de imágenes.
// Permite al usuario subir una imagen arrastrándola o haciendo clic para seleccionarla.
// Muestra una vista previa de la imagen seleccionada y gestiona la memoria liberando
// las URLs de objeto creadas cuando ya no son necesarias.

import { useRef, useState, useCallback, useEffect } from "react";
import { Camera, Upload, Image as ImageIcon } from "lucide-react";

// Props del componente
interface ImageUploadProps {
  onImageSelected: (file: File, preview: string) => void; // Callback al seleccionar una imagen
}

/**
 * Componente de zona de carga de imágenes con soporte para arrastrar y soltar.
 * Libera automáticamente las URLs de objeto previas para evitar fugas de memoria.
 * Muestra la imagen seleccionada como preview con opción de cambiarla.
 */
const ImageUpload = ({ onImageSelected }: ImageUploadProps) => {
  const fileRef = useRef<HTMLInputElement>(null);         // Referencia al input de archivo oculto
  const [preview, setPreview] = useState<string | null>(null); // URL de previsualización de la imagen
  const [dragOver, setDragOver] = useState(false);       // Estado visual cuando se arrastra un archivo

  // Almacena la URL de objeto anterior para liberarla cuando se seleccione una nueva imagen
  const prevUrlRef = useRef<string | null>(null);

  // Libera la URL de objeto al desmontar el componente para evitar fugas de memoria
  useEffect(() => {
    return () => {
      if (prevUrlRef.current) URL.revokeObjectURL(prevUrlRef.current);
    };
  }, []);

  /**
   * Procesa un archivo de imagen seleccionado.
   * Libera la URL previa, crea una nueva URL de objeto para la previsualización
   * y llama al callback del padre con el archivo y la URL.
   */
  const handleFile = useCallback((file: File) => {
    if (prevUrlRef.current) URL.revokeObjectURL(prevUrlRef.current);
    const url = URL.createObjectURL(file);
    prevUrlRef.current = url;
    setPreview(url);
    onImageSelected(file, url);
  }, [onImageSelected]);

  /**
   * Maneja el evento de soltar un archivo en la zona de carga.
   * Solo procesa archivos de tipo imagen.
   */
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file?.type.startsWith("image/")) handleFile(file);
  }, [handleFile]);

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      onClick={() => fileRef.current?.click()} // Abre el selector de archivos al hacer clic
      className={`relative cursor-pointer rounded-xl border-2 border-dashed transition-all duration-300 overflow-hidden ${
        dragOver
          ? "border-primary bg-primary/5 scale-[1.01]"   // Estilo al arrastrar sobre la zona
          : preview
          ? "border-border"                               // Estilo con imagen cargada
          : "border-border hover:border-primary/50 hover:bg-muted/50" // Estilo vacío por defecto
      }`}
    >
      {/* Input de archivo oculto; acepta cualquier tipo de imagen */}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
        }}
      />

      {/* Muestra la imagen seleccionada o el placeholder de carga */}
      {preview ? (
        // Vista previa de la imagen con overlay al pasar el ratón para cambiarla
        <div className="relative aspect-video">
          <img src={preview} alt="Preview" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-foreground/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
            <div className="flex items-center gap-2 text-primary-foreground font-medium">
              <Camera className="w-5 h-5" />
              Cambiar imagen
            </div>
          </div>
        </div>
      ) : (
        // Placeholder cuando no hay imagen seleccionada
        <div className="flex flex-col items-center justify-center py-12 px-6 text-center gap-3">
          <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center">
            <ImageIcon className="w-8 h-8 text-muted-foreground" />
          </div>
          <div>
            <p className="font-display font-semibold text-foreground">
              Sube una foto de tus ingredientes
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Arrastra una imagen o haz clic para seleccionar
            </p>
          </div>
          <div className="flex gap-2 mt-2">
            <span className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-full bg-muted text-muted-foreground">
              <Upload className="w-3 h-3" /> Subir archivo
            </span>
            <span className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-full bg-muted text-muted-foreground">
              <Camera className="w-3 h-3" /> Cámara
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
