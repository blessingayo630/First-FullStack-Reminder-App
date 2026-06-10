'use client';

import React from 'react';

export default function AuthFormShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="card-neon rounded-lg p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-white">{title}</h1>
            {subtitle ? <p className="text-white/60 mt-2 text-sm">{subtitle}</p> : null}
          </div>

          {children}

          {footer ? <div className="mt-5">{footer}</div> : null}
        </div>
      </div>
    </div>
  );
}

