import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { bounce, ease } from "../lib/motion";
import { DISPLAY_FONT } from "../theme/fonts";

export type HeadlineMotion = "rise" | "pop" | "blur" | "type";
export const headlineMotions = ["rise", "pop", "blur", "type"] as const;

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
      const opens = raw.startsWith("*");
      const closes = raw.endsWith("*") && (raw.length > 1 || !opens);
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

  const stagger = motion === "pop" ? 3 : 4;
  return (
    <p style={base}>
      {words.map((w, i) => {
        const d = delay + i * stagger;
        const p = motion === "pop" ? bounce(frame, fps, d) : ease(frame, fps, d, 18);
        const style: React.CSSProperties = {
          display: "inline-block",
          color: w.hot ? accent : color,
          whiteSpace: "pre",
          opacity: Math.min(1, p * 1.5),
        };
        if (motion === "rise") style.transform = `translateY(${(1 - p) * size * 0.6}px)`;
        if (motion === "pop") style.transform = `scale(${0.3 + 0.7 * p})`;
        if (motion === "blur") {
          style.filter = `blur(${(1 - p) * size * 0.25}px)`;
          style.transform = `scale(${1.15 - 0.15 * p})`;
        }
        return (
          <React.Fragment key={i}>
            <span style={style}>{w.text}</span>
            {i < words.length - 1 ? " " : null}
          </React.Fragment>
        );
      })}
    </p>
  );
};
