export default function AdminSystemSettingsPage() {
  return (
    <div className="max-w-3xl rounded-3xl border border-amber-500/30 bg-zinc-900 p-8 text-zinc-100">
      <h1 className="text-2xl font-bold">System settings are read-only</h1>
      <p className="mt-3 text-sm leading-6 text-zinc-300">The application currently uses reviewed configuration in code. Settings edited on this page would not persist, so the form is disabled until secure server-side settings management is available.</p>
    </div>
  );
}
