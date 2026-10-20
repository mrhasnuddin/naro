import { useEffect, useRef, useState } from "react";
import { useI18n } from "../context";
import { brandAsset } from "./assets";

export function NaroMascot({
  bubble,
  paused = false,
  small = false,
}: {
  bubble?: string;
  paused?: boolean;
  small?: boolean;
}) {
  const { t } = useI18n();
  const [reaction, setReaction] = useState("");
  const [reduced, setReduced] = useState(
    () => matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const button = useRef<HTMLButtonElement>(null),
    start = useRef<{ x: number; y: number; drag: boolean } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    const query = matchMedia("(prefers-reduced-motion: reduce)");
    const change = () => setReduced(query.matches);
    query.addEventListener("change", change);
    return () => {
      query.removeEventListener("change", change);
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);
  const react = (text: string) => {
    setReaction(text);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setReaction(""), 1800);
  };
  return (
    <div
      className={`naro-character ${small ? "naro-character--small" : ""}`}
      data-paused={paused || reduced}
    >
      {!small && (
        <p className="character-bubble" aria-live="polite">
          {reaction || bubble || t("orig.mascot.hi")}
        </p>
      )}
      <button
        ref={button}
        type="button"
        className="character-touch"
        aria-label={t("orig.mascot.greetAria")}
        onClick={() => {
          if (!start.current?.drag) react(t("orig.mascot.comfy"));
          start.current = null;
        }}
        onPointerDown={(e) => {
          start.current = { x: e.clientX, y: e.clientY, drag: false };
        }}
        onPointerMove={(e) => {
          const p = start.current;
          if (!p || reduced || paused || e.buttons !== 1) return;
          const dx = Math.max(-45, Math.min(45, e.clientX - p.x)),
            dy = Math.max(-18, Math.min(18, e.clientY - p.y));
          if (Math.abs(dx) > 18) {
            p.drag = true;
            button.current!.style.transform = `translate(${dx}px,${dy}px) rotate(${dx / 3}deg)`;
          }
        }}
        onPointerUp={() => {
          if (button.current) button.current.style.transform = "";
          if (start.current?.drag) react(t("orig.mascot.dizzy"));
        }}
        onPointerCancel={() => {
          start.current = null;
          if (button.current) button.current.style.transform = "";
        }}
        onPointerLeave={() => {
          if (button.current) button.current.style.transform = "";
          start.current = null;
        }}
      >
        <img
          src={brandAsset("naro-mascot.svg")}
          width="200"
          height="230"
          alt=""
          draggable={false}
        />
      </button>
      <span className="character-orbit" aria-hidden="true" />
    </div>
  );
}
