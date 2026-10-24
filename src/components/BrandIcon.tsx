import { brandFill, brandIcon } from "@/lib/brandIcons";
import "./brand-icon.css";

type Props = { name: string; size?: number; className?: string };

/**
 * Logo de marca de una tecnología, o `null` si la etiqueta no tiene logo.
 * Siempre decorativo (`aria-hidden`): el texto de la etiqueta ya nombra la tecnología.
 */
export default function BrandIcon({ name, size = 14, className }: Props) {
  const icon = brandIcon(name);
  if (!icon) return null;
  const classes = `brand-icon brand-icon--${icon.kind}${className ? ` ${className}` : ""}`;
  if (icon.kind === "si") {
    return (
      <svg className={classes} viewBox="0 0 24 24" width={size} height={size} fill={brandFill(icon.hex)} aria-hidden="true" focusable="false">
        <path d={icon.path} />
      </svg>
    );
  }
  // Los iconos AWS son cuadrados llenos: 2 px menos que la caja para igualar el peso óptico de un glifo de
  // Simple Icons, centrados con un margen entero para que los bordes caigan en píxel exacto.
  const tile = Math.max(size - 2, 8);
  return (
    <img
      className={classes}
      src={icon.src}
      width={tile}
      height={tile}
      style={{ margin: (size - tile) / 2 }}
      alt=""
      aria-hidden="true"
      loading="lazy"
      decoding="async"
      draggable={false}
    />
  );
}
