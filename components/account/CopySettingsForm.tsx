"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { updateCopySettings, type SaveState } from "@/app/account/copy-trading/actions";
import type { CopySettings } from "@/lib/copy-bridge/settings";

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="button" disabled={pending}>
      {pending ? "Saving…" : "Save settings"}
    </button>
  );
}

export function CopySettingsForm({
  settings,
  ceilings,
}: {
  settings: CopySettings;
  ceilings: { maxMultiplier: number; maxLot: number };
}) {
  const [state, action] = useActionState<SaveState, FormData>(updateCopySettings, { ok: true, message: "" });

  return (
    <form action={action} className="copy-settings-form">
      <div className="field">
        <label htmlFor="lotSizingMode">Lot rule</label>
        <select id="lotSizingMode" name="lotSizingMode" defaultValue={settings.lotSizingMode}>
          <option value="SAME">Exact — copy the master&apos;s lot</option>
          <option value="MULTIPLY">Multiply — master lot × multiplier</option>
          <option value="REDUCE">Reduce — master lot × a fraction</option>
        </select>
      </div>

      <div className="field">
        <label htmlFor="lotMultiplier">Multiplier</label>
        <input
          id="lotMultiplier"
          name="lotMultiplier"
          type="number"
          step="0.01"
          min="0.01"
          max={ceilings.maxMultiplier}
          defaultValue={settings.lotMultiplier}
          inputMode="decimal"
        />
        <p className="form-note">Used for Multiply / Reduce. Your plan allows up to ×{ceilings.maxMultiplier}.</p>
      </div>

      <div className="field">
        <label htmlFor="maxLot">Maximum lot per trade</label>
        <input
          id="maxLot"
          name="maxLot"
          type="number"
          step="0.01"
          min="0.01"
          max={ceilings.maxLot}
          defaultValue={settings.maxLot}
          inputMode="decimal"
        />
        <p className="form-note">A hard cap on each copied trade. Your plan allows up to {ceilings.maxLot} lots.</p>
      </div>

      <div className="actions">
        <SaveButton />
        {state.message ? (
          <span className={state.ok ? "form-success" : "form-error"} role="status" aria-live="polite">
            {state.message}
          </span>
        ) : null}
      </div>

      <p className="form-note">
        Your account risk limit still applies on top of these settings, so a copied trade is never larger than your risk allows.
      </p>
    </form>
  );
}
