/**
 * Componente de fundo inspirado no design do Google Stitch.
 * Apresenta um padrão de ilustrações culinárias flat sobre um fundo bicolor diagonal.
 */
export function CulinaryPatternBackground() {
  return (
    <div
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden select-none"
      aria-hidden="true"
    >
      {/* Fundo bicolor diagonal */}
      <div className="absolute inset-0 bg-[#a8d5e2] dark:bg-[#1a2b33]">
        <div
          className="absolute inset-0 bg-[#b8e0b8] dark:bg-[#1e331e]"
          style={{ clipPath: "polygon(100% 0, 100% 100%, 0 100%)" }}
        />
      </div>

      {/* Padrão de ícones (Simulado via SVG repetido ou posicionado) */}
      <div className="absolute inset-0 opacity-40 dark:opacity-20">
        <PatternIcons />
      </div>

      {/* Overlay sutil para garantir legibilidade */}
      <div className="absolute inset-0 bg-background/10" />
    </div>
  );
}

function PatternIcons() {
  return (
    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-12 p-8">
      {/* Repetição de ícones para preencher o fundo */}
      {Array.from({ length: 48 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center justify-center rotate-12 opacity-80"
        >
          {renderIcon(i % 10)}
        </div>
      ))}
    </div>
  );
}

function renderIcon(index: number) {
  const size = "size-8 sm:size-10";
  switch (index) {
    case 0: // Tomate
      return (
        <svg
          className={size}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="12" cy="13" r="8" fill="#e57373" />
          <path
            d="M12 5V3M10 4L12 5L14 4"
            stroke="#4caf50"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      );
    case 1: // Banana
      return (
        <svg
          className={size}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M19 5C15 5 8 8 5 17C8 19 15 17 19 14V5Z" fill="#fff176" />
          <path
            d="M19 5L21 3"
            stroke="#8d6e63"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      );
    case 2: // Brócolis
      return (
        <svg
          className={size}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 10C10 7 7 7 5 9C3 11 3 14 5 16C7 18 10 18 12 15V20H14V15C16 18 19 18 21 16C23 14 23 11 21 9C19 7 16 7 14 10V10Z"
            fill="#81c784"
          />
        </svg>
      );
    case 3: // Cenoura
      return (
        <svg
          className={size}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M18 4L6 20C8 21 11 21 13 19L20 7C21 5 20 4 18 4Z"
            fill="#ffb74d"
          />
          <path d="M18 4L20 2" stroke="#4caf50" strokeWidth="2" />
        </svg>
      );
    case 4: // Batedor (Whisk)
      return (
        <svg
          className={size}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 4C9 4 7 7 7 11C7 15 9 18 12 18C15 18 17 15 17 11C17 7 15 4 12 4Z"
            stroke="#9575cd"
            strokeWidth="1.5"
          />
          <path d="M12 18V22" stroke="#9575cd" strokeWidth="2" />
          <path
            d="M9 6C9 6 10 8 12 8C14 8 15 6 15 6"
            stroke="#9575cd"
            strokeWidth="1"
          />
        </svg>
      );
    case 5: // Rolo de massa
      return (
        <svg
          className={size}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect x="5" y="10" width="14" height="4" rx="1" fill="#ffcc80" />
          <rect x="2" y="11" width="3" height="2" rx="0.5" fill="#d7ccc8" />
          <rect x="19" y="11" width="3" height="2" rx="0.5" fill="#d7ccc8" />
        </svg>
      );
    case 6: // Chapéu de Chef
      return (
        <svg
          className={size}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M6 14C4 14 3 12 3 10C3 7 6 5 12 5C18 5 21 7 21 10C21 12 20 14 18 14H6Z"
            fill="#ff8a65"
          />
          <rect x="6" y="14" width="12" height="4" fill="#ff8a65" />
        </svg>
      );
    case 7: // Limão
      return (
        <svg
          className={size}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <ellipse cx="12" cy="12" rx="7" ry="5" fill="#fff176" />
          <path
            d="M5 12C5 12 6 11 7 11M17 13C18 13 19 12 19 12"
            stroke="#fff"
            strokeWidth="1"
          />
        </svg>
      );
    case 8: // Faca
      return (
        <svg
          className={size}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M7 18L18 7L20 9L9 20L7 18Z" fill="#b0bec5" />
          <path d="M4 21L7 18L9 20L6 23L4 21Z" fill="#546e7a" />
        </svg>
      );
    case 9: // Maçã
      return (
        <svg
          className={size}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 20C16 20 19 17 19 13C19 9 16 6 12 6C8 6 5 9 5 13C5 17 8 20 12 20Z"
            fill="#ffcc80"
          />
          <path d="M12 6V4" stroke="#8d6e63" strokeWidth="2" />
        </svg>
      );
    default:
      return null;
  }
}
