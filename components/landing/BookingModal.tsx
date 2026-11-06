"use client";

import {
  createContext,
  FormEvent,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { X } from "lucide-react";
import {
  formatDayShort,
  groupSlotsByDate,
  listAvailableSlots,
  type BookingSlot,
} from "@/lib/booking/slots";
import {
  BOOKING_INTERESTS,
  DEFAULT_BOOKING_INTEREST,
  isBookingInterest,
  type BookingInterestValue,
} from "@/lib/booking/interests";

type BookingOpenOptions = {
  interest?: BookingInterestValue;
};

type BookingContextValue = {
  openBooking: (options?: BookingOpenOptions) => void;
};

const BookingContext = createContext<BookingContextValue | null>(null);

const fieldClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-center text-sm text-slate-900 outline-none ring-blue-500 focus:ring-2 dark:border-slate-600 dark:bg-slate-800 dark:text-white";

const selectClass = `${fieldClass} cursor-pointer appearance-none bg-[length:12px] bg-[right_0.5rem_center] bg-no-repeat pr-6`;

const selectChevron = {
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
};

const labelClass =
  "block text-center text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400";

export function useBooking() {
  const ctx = useContext(BookingContext);
  if (!ctx) {
    throw new Error("useBooking doit être utilisé dans BookingProvider");
  }
  return ctx;
}

export function useBookingOptional() {
  return useContext(BookingContext);
}

export function BookingProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [interest, setInterest] = useState<BookingInterestValue>(
    DEFAULT_BOOKING_INTEREST,
  );

  const openBooking = useCallback((options?: BookingOpenOptions) => {
    const next = options?.interest;
    setInterest(
      next && isBookingInterest(next) ? next : DEFAULT_BOOKING_INTEREST,
    );
    setOpen(true);
  }, []);

  const value = useMemo(() => ({ openBooking }), [openBooking]);

  return (
    <BookingContext.Provider value={value}>
      {children}
      <BookingDialog
        open={open}
        interest={interest}
        onInterestChange={setInterest}
        onClose={() => setOpen(false)}
      />
    </BookingContext.Provider>
  );
}

function BookingDialog({
  open,
  interest,
  onInterestChange,
  onClose,
}: {
  open: boolean;
  interest: BookingInterestValue;
  onInterestChange: (value: BookingInterestValue) => void;
  onClose: () => void;
}) {
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [slotId, setSlotId] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [website, setWebsite] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const days = useMemo(() => groupSlotsByDate(listAvailableSlots()), []);
  const timesForDay: BookingSlot[] = useMemo(() => {
    const day = days.find((d) => d.date === selectedDate);
    return day?.times ?? [];
  }, [days, selectedDate]);

  useEffect(() => {
    if (!open) return;
    setEmail("");
    setCompany("");
    setWebsite("");
    setSlotId("");
    setSelectedDate(days[0]?.date ?? "");
    setError(null);
    setDone(false);
    setSubmitting(false);
  }, [open, days]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!selectedDate || !slotId) {
      setError("Choisissez un jour et un horaire.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          company,
          interest,
          slotId,
          website,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(data.error || "Envoi impossible. Réessayez.");
        return;
      }
      setDone(true);
    } catch {
      setError("Réseau indisponible. Réessayez.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/45 p-4"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="booking-title"
        className="relative w-full max-w-sm rounded-2xl border border-slate-200 bg-white px-5 pb-5 pt-4 shadow-xl dark:border-slate-700 dark:bg-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          aria-label="Fermer"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="mb-4 text-center pr-6">
          <h2
            id="booking-title"
            className="text-base font-bold text-slate-900 dark:text-white"
          >
            {done ? "Demande envoyée" : "Prendre rendez-vous"}
          </h2>
        </div>

        {done ? (
          <div className="space-y-4 text-center">
            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              Merci. Vous recevrez le lien de rendez-vous par e-mail une fois le
              créneau confirmé.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Fermer
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mx-auto w-full max-w-[260px] space-y-2.5">
            <label className="block space-y-1">
              <span className={labelClass}>E-mail</span>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={fieldClass}
                placeholder="vous@entreprise.fr"
              />
            </label>

            <label className="block space-y-1">
              <span className={labelClass}>Société</span>
              <input
                type="text"
                required
                autoComplete="organization"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className={fieldClass}
                placeholder="Nom de l'entreprise"
              />
            </label>

            <label className="block space-y-1">
              <span className={labelClass}>Objet</span>
              <select
                required
                value={interest}
                onChange={(e) => {
                  const value = e.target.value;
                  if (isBookingInterest(value)) onInterestChange(value);
                }}
                className={`${selectClass} text-[13px]`}
                style={selectChevron}
              >
                {BOOKING_INTERESTS.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>

            <input
              type="text"
              name="website"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              className="hidden"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden
            />

            <div className="grid grid-cols-2 gap-2">
              <label className="block space-y-1">
                <span className={labelClass}>Jour</span>
                <select
                  required
                  value={selectedDate}
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    setSlotId("");
                  }}
                  className={`${selectClass} text-[13px]`}
                  style={selectChevron}
                  disabled={days.length === 0}
                >
                  <option value="" disabled>
                    —
                  </option>
                  {days.map((day) => (
                    <option key={day.date} value={day.date}>
                      {formatDayShort(day.date)}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block space-y-1">
                <span className={labelClass}>Horaire</span>
                <select
                  required
                  value={slotId}
                  onChange={(e) => setSlotId(e.target.value)}
                  className={selectClass}
                  style={selectChevron}
                  disabled={!selectedDate || timesForDay.length === 0}
                >
                  <option value="" disabled>
                    —
                  </option>
                  {timesForDay.map((slot) => (
                    <option key={slot.id} value={slot.id}>
                      {slot.time}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {error ? (
              <p
                className="text-center text-xs text-red-600 dark:text-red-400"
                role="alert"
              >
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={submitting || days.length === 0}
              className="mt-1 w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Envoi…" : "Valider"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
