import { useRegisterSW } from "virtual:pwa-register/react";

export default function UpdateAvailableBanner() {
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    immediate: true,
  });

  if (!needRefresh) return null;

  return (
    <section className="ops-panel rounded-2xl border border-amber-500/40 bg-amber-500/10 p-3 sm:p-4" aria-label="Update available">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-amber-200">Update Available</p>
          <p className="text-sm text-amber-100">A new version is ready. Update now to use the latest features.</p>
        </div>
        <button
          type="button"
          onClick={() => updateServiceWorker(true)}
          className="min-h-11 rounded-xl bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-500"
        >
          Update Now
        </button>
      </div>
    </section>
  );
}
