import Link from 'next/link';
import { Building2, ArrowLeft, Home, Bed } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center font-sans">
      <div className="w-16 h-16 rounded-3xl bg-sky-100 text-sky-600 flex items-center justify-center mx-auto mb-6 shadow-sm">
        <Building2 className="w-8 h-8" />
      </div>
      <span className="px-3 py-1 rounded-full bg-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider mb-3">
        404 Page Not Found
      </span>
      <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">
        Requested Healthcare Route Does Not Exist
      </h1>
      <p className="text-slate-500 text-sm max-w-md mx-auto mb-8">
        The destination you navigated to could not be found or has moved. Please check the URL or use the quick links below.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/bed-booking"
          className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-sm transition flex items-center gap-1.5"
        >
          <Bed className="w-4 h-4" /> Book a Hospital Bed
        </Link>
        <Link
          href="/portal"
          className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold transition flex items-center gap-1.5"
        >
          <Home className="w-4 h-4" /> Patient Portal
        </Link>
        <Link
          href="/"
          className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-800 text-xs font-bold transition flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" /> Home
        </Link>
      </div>
    </div>
  );
}
