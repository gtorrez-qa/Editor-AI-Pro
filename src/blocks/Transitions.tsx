import { linearTiming, springTiming, TransitionSeries } from "@remotion/transitions";
import { clockWipe } from "@remotion/transitions/clock-wipe";
import { cube } from "@remotion/transitions/cube";
import { fade } from "@remotion/transitions/fade";
import { flip } from "@remotion/transitions/flip";
import { iris } from "@remotion/transitions/iris";
import { slide } from "@remotion/transitions/slide";
import { wipe } from "@remotion/transitions/wipe";
import React from "react";

/** Transiciones disponibles (todas funcionan sin aceleración gráfica). */
export const transitionNames = [
  "fundido",
  "deslizar-izq",
  "deslizar-der",
  "deslizar-arriba",
  "deslizar-abajo",
  "barrido-izq",
  "barrido-der",
  "barrido-diagonal",
  "giro",
  "reloj",
  "iris",
  "cubo",
] as const;
export type TransitionName = (typeof transitionNames)[number];

type Options = {
  name: TransitionName;
  width: number;
  height: number;
  durationInFrames?: number;
  /** "spring" da una sensación más física; "linear" es parejo */
  feel?: "linear" | "spring";
  key?: React.Key;
};

/** Devuelve un <TransitionSeries.Transition> listo para poner entre dos escenas. */
export const makeTransition = ({ name, width, height, durationInFrames = 15, feel = "linear", key }: Options) => {
  const timing =
    feel === "spring"
      ? springTiming({ config: { damping: 200 }, durationInFrames })
      : linearTiming({ durationInFrames });
  const T = TransitionSeries.Transition;
  switch (name) {
    case "fundido":
      return <T key={key} timing={timing} presentation={fade()} />;
    case "deslizar-izq":
      return <T key={key} timing={timing} presentation={slide({ direction: "from-right" })} />;
    case "deslizar-der":
      return <T key={key} timing={timing} presentation={slide({ direction: "from-left" })} />;
    case "deslizar-arriba":
      return <T key={key} timing={timing} presentation={slide({ direction: "from-bottom" })} />;
    case "deslizar-abajo":
      return <T key={key} timing={timing} presentation={slide({ direction: "from-top" })} />;
    case "barrido-izq":
      return <T key={key} timing={timing} presentation={wipe({ direction: "from-right" })} />;
    case "barrido-der":
      return <T key={key} timing={timing} presentation={wipe({ direction: "from-left" })} />;
    case "barrido-diagonal":
      return <T key={key} timing={timing} presentation={wipe({ direction: "from-top-left" })} />;
    case "giro":
      return <T key={key} timing={timing} presentation={flip({ direction: "from-right" })} />;
    case "reloj":
      return <T key={key} timing={timing} presentation={clockWipe({ width, height })} />;
    case "iris":
      return <T key={key} timing={timing} presentation={iris({ width, height })} />;
    case "cubo":
      return <T key={key} timing={timing} presentation={cube({ direction: "from-right" })} />;
  }
};

/** Elige una transición de la lista de forma rotativa, para variar entre escenas. */
export const rotatingTransition = (list: readonly TransitionName[], index: number) => list[index % list.length];
