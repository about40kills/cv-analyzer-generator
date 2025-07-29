"use client";

import React, { useEffect, ReactNode, PropsWithChildren } from "react";

export default function ClientBody({ children }: PropsWithChildren<{}>) {
  // Remove any extension-added classes during hydration
  useEffect(() => {
    // This runs only on the client after hydration
    document.body.className = "antialiased";
  }, []);

  return <div className="antialiased">{children}</div>;
}
