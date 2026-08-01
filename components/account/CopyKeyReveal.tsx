"use client";

import { useState } from "react";

/**
 * Shows the member's copier access key, masked by default, with reveal + copy.
 * The key is private and tied to their membership, so we don't display it in the
 * clear until the member chooses to.
 */
export function CopyKeyReveal({ accessKey }: { accessKey: string }) {
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);

  const masked = accessKey.slice(0, 12) + "…" + accessKey.slice(-4);

  async function copy() {
    try {
      await navigator.clipboard.writeText(accessKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      setRevealed(true);
    }
  }

  return (
    <div className="notice">
      <strong>Your access key</strong>
      <br />
      <code style={{ wordBreak: "break-all" }}>{revealed ? accessKey : masked}</code>
      <div className="actions" style={{ marginTop: 12 }}>
        <button type="button" className="button secondary" onClick={() => setRevealed((v) => !v)}>
          {revealed ? "Hide" : "Reveal"}
        </button>
        <button type="button" className="button secondary" onClick={copy}>
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <p className="form-note" style={{ marginTop: 10 }}>
        Keep this private. It is tied to your membership and stops working if your add-on lapses.
      </p>
    </div>
  );
}
