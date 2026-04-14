"use client";

import { Plus, Minus, Crosshair } from "lucide-react";
import { cn } from "@/lib/utils";

interface MapControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onCenter: () => void;
}

const glassStyle: React.CSSProperties = {
  background: "rgba(255, 255, 255, 0.9)",
  backdropFilter: "blur(12px)",
  WebkitBackdropFilter: "blur(12px)",
};

function ControlBtn({
  onClick,
  label,
  disabled,
  children,
  active,
}: {
  onClick: () => void;
  label: string;
  disabled?: boolean;
  children: React.ReactNode;
  active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex items-center justify-center w-10 h-10 transition-all duration-150",
        "text-gray-700 border-gray-200",
        active && "text-blue-500",
        disabled
          ? "opacity-30 cursor-not-allowed"
          : "hover:bg-gray-100 hover:text-blue-500 active:scale-95"
      )}
      aria-label={label}
    >
      {children}
    </button>
  );
}

export function MapControls({
  onZoomIn,
  onZoomOut,
  onCenter,
}: MapControlsProps) {

  return (
    <div className="absolute bottom-8 right-5 z-30 flex flex-col items-end gap-3">
      {/* Zoom controls */}
      <div
        className="rounded-xl border border-border/50 overflow-hidden flex flex-col"
        style={glassStyle}
        role="group"
        aria-label="Zoom controls"
      >
        <ControlBtn onClick={onZoomIn} label="Zoom in">
          <Plus size={18} />
        </ControlBtn>

        <ControlBtn onClick={onZoomOut} label="Zoom out">
          <Minus size={18} />
        </ControlBtn>
      </div>

      {/* Center / locate + Live button */}
      <div className="flex flex-col gap-3">
        <div
          className="rounded-xl border border-blue-200 overflow-hidden"
          style={{
            background: "rgba(59, 130, 246, 0.1)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
          }}
        >
          <ControlBtn onClick={onCenter} label="Center map" active>
            <Crosshair size={18} />
          </ControlBtn>
        </div>

        {/* Live indicator */}
        <div
          className="rounded-xl border border-gray-200 overflow-hidden flex items-center justify-center h-10 px-3 gap-2"
          style={{
            background: "rgba(255, 255, 255, 0.9)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
          }}
        >
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" aria-hidden="true" />
          <span className="text-xs text-gray-700 font-medium hidden sm:inline">Live</span>
        </div>
      </div>
    </div>
  );
}
