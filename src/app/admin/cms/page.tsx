export default function AdminCMSPage() {
  return (
    <div className="max-w-3xl rounded-3xl border border-amber-500/30 bg-zinc-900 p-8 text-zinc-100">
      <h1 className="text-2xl font-bold">Content publishing is not configured</h1>
      <p className="mt-3 text-sm leading-6 text-zinc-300">
        The site currently uses reviewed static content. Editing banners, FAQs, or success stories here would not save changes, so publishing controls are disabled until a persistent content workflow is available.
      </p>
    </div>
  );
}
