"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { siteConfig } from "@/lib/config/site";

const DISMISS_KEY = "kiraLaunchNoticeDismissed";

export function AnnouncementBar() {
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    const expired = Date.now() > new Date(siteConfig.launch.announcementExpiresAt).getTime();
    if (!siteConfig.launch.announcementActive || expired) {
      setDismissed(true);
      return;
    }
    setDismissed(window.localStorage.getItem(DISMISS_KEY) === "true");
  }, []);

  if (dismissed) return null;

  function dismiss() {
    window.localStorage.setItem(DISMISS_KEY, "true");
    setDismissed(true);
  }

  return (
    <div className="launch-notice" data-launch-notice>
      <div className="container">
        <p>
          A new KIRA membership and payment experience launches on 1 August 2026. Verified eligible members retain
          their loyalty pricing. <Link href="/updates">Read the update</Link>
        </p>
        <button
          className="notice-close"
          type="button"
          aria-label="Dismiss launch announcement"
          onClick={dismiss}
        >
          &times;
        </button>
      </div>
    </div>
  );
}
