import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

export function CopyButton({
  text,
  label = "Copy",
  className,
}: {
  text: string;
  label?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const el = document.createElement("textarea");
      el.value = text;
      el.setAttribute("readonly", "");
      el.style.position = "absolute";
      el.style.left = "-9999px";
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }

  return (
    <button
      type="button"
      onClick={() => void onCopy()}
      className={cn(
        "inline-flex h-11 min-w-11 items-center justify-center gap-2 rounded-md px-3.5",
        "bg-fg text-bg-sunken text-sm font-medium",
        "transition-[opacity,transform] duration-150 ease-out",
        "hover:opacity-90 active:scale-[0.96]",
        className,
      )}
    >
      {copied ? <Check className="size-4" strokeWidth={2} /> : <Copy className="size-4" strokeWidth={2} />}
      <span>{copied ? "Copied" : label}</span>
    </button>
  );
}
