import { useEffect, useState } from "react";

const DISMISS_KEY = "logbook-pwa-install-dismissed-v2";

export default function InstallAppCard() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [hidden, setHidden] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const dismissed = sessionStorage.getItem(DISMISS_KEY) === "1";
    if (dismissed) setHidden(true);

    const onBeforeInstallPrompt = (event) => {
      event.preventDefault();
      setDeferredPrompt(event);
    };

    const onAppInstalled = () => {
      setInstalled(true);
      setDeferredPrompt(null);
      setHidden(true);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onAppInstalled);
    };
  }, []);

  const dismiss = () => {
    setHidden(true);
    sessionStorage.setItem(DISMISS_KEY, "1");
  };

  const install = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
  };

  if (installed || hidden || !deferredPrompt) return null;

  return (
    <section className="ops-panel rounded-2xl border border-cyan-500/40 p-3 sm:p-4" aria-label="Install app card">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-cyan-200">Install App</p>
          <p className="text-sm text-slate-200">Install TUI Logbook V2 for full-screen Android experience and offline usage.</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={dismiss}
            className="min-h-11 rounded-xl border border-slate-600 px-3 py-2 text-sm text-slate-200 hover:border-slate-400"
          >
            Not Now
          </button>
          <button
            type="button"
            onClick={install}
            className="min-h-11 rounded-xl bg-sky-700 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-600"
          >
            Install
          </button>
        </div>
      </div>
    </section>
  );
}
