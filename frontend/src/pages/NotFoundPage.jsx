import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-slate-50 px-4">
      <div className="card max-w-md text-center">
        <p className="text-xs text-slate-500 mb-1">404</p>
        <h1 className="text-xl font-semibold mb-2">Page not found</h1>
        <p className="text-xs text-slate-400 mb-4">
          The page you&apos;re looking for doesn&apos;t exist. You can go back to your dashboard.
        </p>
        <Link to="/dashboard" className="btn-primary">
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}

