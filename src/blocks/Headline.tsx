import React from "react";
import { random, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { bounce, ease } from "../lib/motion";
import { DISPLAY_FONT } from "../theme/fonts";

/**
 * Estilos de animación de títulos:
 * - rise: sube y aparece (neutro)          - pop: salta con rebote (divertido)
 * - blur: aparece desde desenfocado          - type: máquina de escribir
 * - slam: golpe desde grande con temblor     - mask: emerge desde una ranura
 * - glitch: interferencia digital           - wave: letras en ola
 * - letters: letra por letra                 - shine: brillo que recorre el texto
 */
export const headlineMotions = ["rise", "pop", "blur", "type", "slam", "mask", "glitch", "wave", "letters", "shine"] as const;
export type HeadlineMotion = (typeof headlineMotions)[number];

type Props = {
  /** Las palabras entre *asteriscos* se pintan con el color de acento. */
  text: string;
  motion?: HeadlineMotion;
  /** Cuadros de espera antes de empezar */
  delay?: number;
  /** Tamaño de fuente en px */
  size: number;
  color: string;
  accent: string;
  align?: "left" | "center";
  weight?: number;
  font?: string;
};

type Word = { text: string; hot: boolean };

const parseWords = (text: string): Word[] => {
  let hot = false;
  return text
    .split(/\s+/)
    .filter(Boolean)
    .map((raw) => {
      const opens = /^[¡¿"“(]*\*/.test(raw);
      // cierra aunque después del asterisco venga puntuación: *mes*.  *hoy*!
      const closes = /\*[.,;:!?…")”]*$/.test(raw) && (raw.replace(/[^*]/g, "").length > 1 || !opens);
      if (opens) hot = true;
      const word = { text: raw.replace(/\*/g, ""), hot };
      if (closes) hot = false;
      return word;
    });
};

/** Título animado palabra por palabra (o letra por letra en modo "type"). */
export const Headline: React.FC<Props> = ({
  text,
  motion = "rise",
  delay = 0,
  size,
  color,
  accent,
  align = "center",
  weight = 700,
  font = DISPLAY_FONT,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words = parseWords(text);

  const base: React.CSSProperties = {
    fontFamily: font,
    fontSize: size,
    fontWeight: weight,
    lineHeight: 1.08,
    letterSpacing: "-0.02em",
    color,
    textAlign: align,
    margin: 0,
    textWrap: "balance",
  };

  if (motion === "type") {
    const total = words.reduce((n, w) => n + w.text.length + 1, 0);
    const shown = Math.max(0, Math.floor((frame - delay) * 1.4));
    let budget = shown;
    const cursorOn = Math.floor(frame / 15) % 2 === 0 || shown < total;
    return (
      <p style={base}>
        {words.map((w, i) => {
          const visible = w.text.slice(0, Math.max(0, budget));
          budget -= w.text.length + 1;
          if (!visible) return null;
          return (
            <span key={i} style={{ color: w.hot ? accent : color }}>
              {visible}
              {i < words.length - 1 && visible.length === w.text.length ? " " : ""}
            </span>
          );
        })}
        <span style={{ opacity: cursorOn ? 1 : 0, color: accent }}>▍</span>
      </p>
    );
  }

  // estilos letra por letra
  if (motion === "wave" || motion === "letters") {
    let li = 0;
    return (
      <p style={base}>
        {words.map((w, i) => (
          <React.Fragment key={i}>
            <span style={{ display: "inline-block", whiteSpace: "pre", color: w.hot ? accent : color }}>
              {w.text.split("").map((ch, j) => {
                const d = delay + li++ * (motion === "wave" ? 1.5 : 1.2);
                const p = motion === "wave" ? bounce(frame, fps, d) : ease(frame, fps, d, 10);
                const style: React.CSSProperties = { display: "inline-block", opacity: Math.min(1, p * 2) };
                if (motion === "wave") {
                  const idle = Math.sin(frame / 9 + li * 0.45) * size * 0.025 * Math.min(1, Math.max(0, (frame - d - 20) / 20));
                  style.transform = `translateY(${(1 - p) * size * 0.7 + idle}px)`;
                } else {
                  style.filter = `blur(${(1 - p) * size * 0.08}px)`;
                }
                return (
                  <span key={j} style={style}>
                    {ch}
                  </span>
                );
              })}
            </span>
            {i < words.length - 1 ? " " : null}
          </React.Fragment>
        ))}
      </p>
    );
  }

  const stagger = motion === "pop" ? 3 : motion === "slam" ? 5 : motion === "glitch" ? 2 : 4;
  // temblor general después del último golpe (slam)
  const lastHit = delay + (words.length - 1) * stagger + 6;
  const shake =
    motion === "slam" && frame >= delay + 6
      ? Math.sin((frame - delay) * 2.3) * size * 0.03 * Math.max(0, 1 - (frame - lastHit) / 14)
      : 0;
  return (
    <p style={{ ...base, transform: shake ? `translate(${shake}px, ${shake * 0.4}px)` : undefined }}>
      {words.map((w, i) => {
        const d = delay + i * stagger;
        const wordColor = w.hot ? accent : color;
        const p =
          motion === "pop"
            ? bounce(frame, fps, d)
            : motion === "slam"
              ? spring({ frame: frame - d, fps, config: { damping: 14, stiffness: 260, mass: 0.6 } })
              : ease(frame, fps, d, motion === "mask" ? 22 : 18);
        const style: React.CSSProperties = {
          display: "inline-block",
          color: wordColor,
          whiteSpace: "pre",
          opacity: Math.min(1, p * 1.5),
        };
        if (motion === "rise") style.transform = `translateY(${(1 - p) * size * 0.6}px)`;
        if (motion === "pop") style.transform = `scale(${0.3 + 0.7 * p})`;
        if (motion === "blur") {
          style.filter = `blur(${(1 - p) * size * 0.25}px)`;
          style.transform = `scale(${1.15 - 0.15 * p})`;
        }
        if (motion === "slam") {
          style.opacity = frame >= d ? 1 : 0;
          style.transform = `scale(${2.4 - 1.4 * p})`;
        }
        if (motion === "glitch") {
          const t = frame - d;
          const active = t >= 0 && t < 14;
          const r = (k: string) => random(`g-${i}-${frame}-${k}`) - 0.5;
          const amp = active ? (1 - t / 14) * size * 0.12 : 0;
          style.opacity = t < 0 ? 0 : active && random(`f-${i}-${frame}`) < 0.25 ? 0.3 : 1;
          style.transform = `translate(${r("x") * amp}px, ${r("y") * amp * 0.4}px)`;
          if (active) style.textShadow = `${amp * 0.6}px 0 #ff2bd6, ${-amp * 0.6}px 0 #00e5ff`;
        }
        if (motion === "shine") {
          const sweep = Math.min(1, Math.max(0, (frame - delay - 12 - i * 3) / 30));
          style.backgroundImage = `linear-gradient(105deg, ${wordColor} 42%, #ffffff 50%, ${wordColor} 58%)`;
          style.backgroundSize = "300% 100%";
          style.backgroundPosition = `${100 - sweep * 100}% 0`;
          style.WebkitBackgroundClip = "text";
          style.backgroundClip = "text";
          style.color = "transparent";
        }
        const inner = <span style={style}>{w.text}</span>;
        return (
          <React.Fragment key={i}>
            {motion === "mask" ? (
              <span style={{ display: "inline-block", overflow: "hidden", verticalAlign: "bottom", paddingBottom: "0.08em" }}>
                <span style={{ ...style, opacity: 1, transform: `translateY(${(1 - p) * 110}%)` }}>{w.text}</span>
              </span>
            ) : (
              inner
            )}
            {i < words.length - 1 ? " " : null}
          </React.Fragment>
        );
      })}
    </p>
  );
};
