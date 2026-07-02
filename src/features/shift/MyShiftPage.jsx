import { useEffect, useMemo, useState } from "react";
import useLogbookStore from "../../store/useLogbookStore.js";
import MyShift from "../my-shift/MyShift.jsx";

export default function MyShiftPage() {
  const {
    flights,
    shiftJobs,
    hasHydrated,
    addFlightToShift,
    startShiftJob,
    completeShiftJob,
    pauseShiftJob,
    reopenShiftJob,
    acceptShiftSuggestions,
    toggleShiftChecklistItem,
    addShiftJobNote,
    removeShiftJobNote,
    updateShiftJob,
  } = useLogbookStore();

  const [error, setError] = useState("");

  useEffect(() => {
    try {
      const claimedFlights = (flights || []).filter((flight) => Boolean(flight.claimed));

      claimedFlights.forEach((flight) => {
        const exists = (shiftJobs || []).some((job) => job.flightId === flight.id);
        if (!exists) {
          addFlightToShift({
            ...flight,
            movement: flight.movement || flight.type || "",
            aircraftRegistration: flight.aircraftRegistration || flight.registration || "",
            aircraftType: flight.aircraftType || flight.aircraft || "",
          });
        }
      });

      setError("");
    } catch (caughtError) {
      setError(caughtError?.message || "Failed to sync claimed flights.");
    }
  }, [flights, shiftJobs, addFlightToShift]);

  const jobs = useMemo(() => {
    const toLabel = (isoValue) => {
      if (!isoValue) return "";
      const date = new Date(isoValue);
      if (Number.isNaN(date.getTime())) return isoValue;
      return `${date.toLocaleDateString("en-GB")} ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    };

    return (shiftJobs || []).map((job) => ({
      id: job.id,
      flightNumber: job.flightNumber || "",
      arrivalDeparture: job.arrivalDeparture || job.movement || "Departure",
      origin: job.origin || "",
      destination: job.destination || "",
      registration: job.registration || job.aircraftRegistration || "",
      aircraftType: job.aircraftType || "",
      scheduledTime: job.scheduledTime || "",
      estimatedTime: job.estimatedTime || "",
      stand: job.stand || "",
      turnaroundTime: job.turnaroundTime || "",
      status: job.status || job.jobState || "Queued",
      started: Boolean(job.started || job.startedAt),
      completed: Boolean(job.completed || job.completedAt || job.jobState === "Completed"),
      startedAt: toLabel(job.startedAt),
      completedAt: toLabel(job.completedAt),
      notes: Array.isArray(job.notes) ? job.notes : [],
      suggestionAccepted: Boolean(job.suggestionAccepted),
      suggestionMeta: {
        basedOnCount: Number(job.suggestionMeta?.basedOnCount || 0),
        confidence: Number(job.suggestionMeta?.confidence || 0),
      },
      checklist: {
        marshall: Boolean(job.checklist?.marshall),
        chocksOn: Boolean(job.checklist?.chocksOn),
        conesPlaced: Boolean(job.checklist?.conesPlaced),
        gpuConnected: Boolean(job.checklist?.gpuConnected),
        beltLoader: Boolean(job.checklist?.beltLoader),
        bagsUnloaded: Boolean(job.checklist?.bagsUnloaded),
        bagsLoaded: Boolean(job.checklist?.bagsLoaded),
        refuel: Boolean(job.checklist?.refuel),
        waterService: Boolean(job.checklist?.waterService),
        toiletService: Boolean(job.checklist?.toiletService),
        catering: Boolean(job.checklist?.catering),
        cleaning: Boolean(job.checklist?.cleaning),
        prm: Boolean(job.checklist?.prm),
        pushback: Boolean(job.checklist?.pushback),
        walkaroundComplete: Boolean(job.checklist?.walkaroundComplete),
        headsetConnected: Boolean(job.checklist?.headsetConnected),
        doorsClosed: Boolean(job.checklist?.doorsClosed),
      },
    }));
  }, [shiftJobs]);

  const retry = () => setError("");

  const handleUpdateField = (jobId, field, value) => {
    updateShiftJob(jobId, { [field]: value });
  };

  return (
    <div className="space-y-4">
      <section className="ops-panel rounded-2xl p-4 sm:p-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Feature</p>
            <h2 className="mt-1 text-2xl font-semibold text-slate-100">My Shift</h2>
            <p className="mt-1 text-sm text-slate-400">Professional ramp operations board for claimed flights.</p>
          </div>
          <div className="ops-pill rounded-xl px-3 py-1.5 text-xs text-slate-300">{jobs.length} active jobs</div>
        </div>
      </section>

      <MyShift
        jobs={jobs}
        isLoading={!hasHydrated}
        error={error}
        onRetry={retry}
        onStartJob={startShiftJob}
        onCompleteJob={completeShiftJob}
        onPauseJob={pauseShiftJob}
        onReopenJob={reopenShiftJob}
        onToggleChecklist={toggleShiftChecklistItem}
        onAddNote={addShiftJobNote}
        onRemoveNote={removeShiftJobNote}
        onUpdateField={handleUpdateField}
        onAcceptSuggestions={acceptShiftSuggestions}
      />
    </div>
  );
}
