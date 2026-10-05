"use client";

import MemorialHeader from "@/components/brochure/MemorialHeader";
import Interactions from "@/components/brochure/Interactions";
import BrochureShell from "@/components/brochure/BrochureShell";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams, useParams } from "next/navigation";
import { BrochureDraft } from "@/types/brochure";
import { MemorialInteractions } from "@/types/interactions";
import { parseJsonResponse } from "@/lib/api/parseJsonResponse";
import {
  loadInteractions,
  saveInteractions,
} from "@/lib/interactionsStorage";

function PublicBrochureContent() {
  const { id } = useParams();

  const [brochure, setBrochure] = useState<BrochureDraft | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [requiresAccessCode, setRequiresAccessCode] = useState(false);
  const [gateName, setGateName] = useState("");

  const searchParams = useSearchParams();
  const isQR = searchParams.get("source") === "qr";

  const [interactions, setInteractions] =
  useState<MemorialInteractions>({
    candles: [],
    messages: [],
    donations: [],
    analytics: {
      views: 0,
      qrScans: 0,
    },
  });

  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] =
    useState<"condolence" | "tribute">("condolence");

  const [authorized, setAuthorized] = useState(false);
  const [inputCode, setInputCode] = useState("");
  const [gateError, setGateError] = useState<string | null>(null);

  const fetchBrochure = useCallback(
    async (accessCode?: string) => {
      if (!id) return;
      setLoading(true);
      setGateError(null);
      try {
        const qs = accessCode
          ? `?accessCode=${encodeURIComponent(accessCode)}`
          : "";
        const res = await fetch(`/api/brochures/${id}${qs}`, {
          cache: "no-store",
        });
        const data = await parseJsonResponse<{
          brochure?: BrochureDraft;
          requiresAccessCode?: boolean;
          error?: string;
        }>(res);

        if (res.status === 403 && data.requiresAccessCode) {
          setRequiresAccessCode(true);
          setGateName(data.brochure?.name ?? "Private memorial");
          setBrochure(null);
          if (accessCode) setGateError("Invalid access code.");
          return;
        }

        if (!res.ok || !data.brochure) {
          setNotFound(true);
          setBrochure(null);
          return;
        }

        setBrochure(data.brochure);
        setRequiresAccessCode(false);
        if (data.brochure.privacy === "family") setAuthorized(true);
      } catch {
        setNotFound(true);
        setBrochure(null);
      } finally {
        setLoading(false);
      }
    },
    [id],
  );

  useEffect(() => {
    void fetchBrochure();
  }, [fetchBrochure]);

  useEffect(() => {
    if (!id) return;
    queueMicrotask(() => {
      const stored = loadInteractions(id as string);
      setInteractions(stored);
    });
  }, [id]);

  useEffect(() => {
    if (!id) return;
    queueMicrotask(() => {
      const stored = loadInteractions(id as string);
      const updated = {
        ...stored,
        analytics: {
          views: (stored.analytics?.views || 0) + 1,
          qrScans:
            (stored.analytics?.qrScans || 0) + (isQR ? 1 : 0),
        },
      };
      setInteractions(updated);
      saveInteractions(id as string, updated);
    });
  }, [id, isQR]);


  /* ---------------- HANDLERS ---------------- */

  function lightCandle() {
    const updated = {
      ...interactions,
      candles: [
        ...interactions.candles,
        {
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
        },
      ],
    };

    setInteractions(updated);
    saveInteractions(id as string, updated);
  }

  function submitMessage() {
    if (!name || !message) return;

    const updated = {
      ...interactions,
      messages: [
        ...interactions.messages,
        {
  id: crypto.randomUUID(),
  name,
  message,
  type: messageType,
  createdAt: new Date().toISOString(),
  approved: false, // 👈 pending by default
},
      ],
    };

    setInteractions(updated);
    saveInteractions(id as string, updated);
    setMessage("");
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading memorial…
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Memorial not found
      </div>
    );
  }

  if (requiresAccessCode && !brochure) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <BrochureShell className="w-full max-w-sm rounded-xl bg-white p-6 shadow-lg">
          <h2 className="font-semibold text-center">Private Memorial</h2>
          {gateName ? (
            <p className="mt-1 text-center text-sm text-gray-500">{gateName}</p>
          ) : null}
          <input
            placeholder="Enter access code"
            value={inputCode}
            onChange={(e) => setInputCode(e.target.value)}
            className="mt-4 w-full rounded-lg border p-2"
          />
          {gateError ? (
            <p className="mt-2 text-sm text-red-600" role="alert">
              {gateError}
            </p>
          ) : null}
          <button
            type="button"
            onClick={() => void fetchBrochure(inputCode.trim())}
            className="mt-3 w-full rounded-lg bg-gray-900 px-4 py-2 text-white"
          >
            View Memorial
          </button>
        </BrochureShell>
      </div>
    );
  }

  if (!brochure) {
    return null;
  }

  return (
    <BrochureShell className="max-w-3xl mx-auto px-4 py-10">
      <div className="space-y-8">

      <MemorialHeader
      name={brochure.name}
      dob={brochure.dob}
      dod={brochure.dod}
      views={interactions.analytics?.views || 0}
      candles={interactions.candles.length}
      totalDonations={(interactions.donations || []).reduce(
        (sum, d) => sum + d.amount,
        0
      )}
    />

      {/* Bio */}
      {brochure.bio && (
        <div>
          <h3 className="font-semibold text-lg mb-2">
            Biography
          </h3>
          <p className="leading-relaxed text-gray-700 whitespace-pre-line">
            {brochure.bio}
          </p>
        </div>
      )}

      {/* Sections */}
      {brochure.sections.map((section) => (
        <div key={section.id}>
          <h3 className="font-semibold text-lg mb-2">
            {section.title}
          </h3>
          <p className="leading-relaxed text-gray-700 whitespace-pre-line">
            {section.content}
          </p>
        </div>
      ))}
<Interactions
  interactions={interactions}
  onLightCandle={lightCandle}
  onSubmitMessage={submitMessage}
  name={name}
  setName={setName}
  message={message}
  setMessage={setMessage}
  messageType={messageType}
  setMessageType={setMessageType}
/>

  {/* Message Form */}
  <div className="bg-gray-50 p-4 rounded-lg space-y-3">
    <h3 className="font-semibold">Leave a message</h3>

    <input
      placeholder="Your name"
      value={name}
      onChange={(e) => setName(e.target.value)}
      className="w-full border rounded p-2"
    />

    <select
      value={messageType}
      onChange={(e) =>
        setMessageType(e.target.value as "condolence" | "tribute")
      }
      className="w-full border rounded p-2"
    >
      <option value="condolence">Condolence</option>
      <option value="tribute">Tribute</option>
    </select>

    <textarea
      placeholder="Your message..."
      value={message}
      onChange={(e) => setMessage(e.target.value)}
      className="w-full border rounded p-2"
      rows={3}
    />

    <button
  disabled={!name || !message}
  className="bg-gray-900 disabled:opacity-40 text-white px-4 py-2 rounded"
>
  Submit
</button>

  </div>

  {/* Public Approved Messages */}
  <div className="space-y-4">
    {interactions.messages
      .filter((m) => m.approved)
      .map((m) => (
        <div
          key={m.id}
          className="border rounded p-3 bg-white"
        >
          <p className="text-sm font-semibold">
            {m.name} · {m.type}
          </p>
          <p className="text-sm text-gray-700">
            {m.message}
          </p>
        </div>
      ))}
  </div>

  {/* Family Moderation */}
  {brochure.privacy === "family" && authorized && (
    <div className="border-t pt-6 space-y-3">
      <h3 className="font-semibold">Moderate Messages</h3>

      {interactions.messages.map((m) => (
        <div
          key={m.id}
          className="border p-3 rounded bg-gray-50 space-y-2"
        >
          <p className="text-sm font-semibold">
            {m.name} · {m.type}
          </p>
          <p className="text-sm">{m.message}</p>

          <div className="flex gap-2">
            {!m.approved && (
              <button
                onClick={() => {
                  const updated = {
                    ...interactions,
                    messages: interactions.messages.map((msg) =>
                      msg.id === m.id
                        ? { ...msg, approved: true }
                        : msg
                    ),
                  };
                  setInteractions(updated);
                  saveInteractions(id as string, updated);
                }}
                className="text-xs bg-green-600 text-white px-2 py-1 rounded"
              >
                Approve
              </button>
            )}

            <button
              onClick={() => {
                const updated = {
                  ...interactions,
                  messages: interactions.messages.filter(
                    (msg) => msg.id !== m.id
                  ),
                };
                setInteractions(updated);
                saveInteractions(id as string, updated);
              }}
              className="text-xs bg-red-600 text-white px-2 py-1 rounded"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  )}

  {/* Donations */}
  <div className="border-t pt-6 space-y-3">
    <h3 className="font-semibold">Support the Family</h3>

    <input
      type="number"
      placeholder="Amount"
      className="border rounded p-2 w-full"
      id="donation-amount"
    />

    <button
      onClick={() => {
        const input = document.getElementById(
          "donation-amount"
        ) as HTMLInputElement;

        const amount = Number(input.value);
        if (!amount) return;

        const updated = {
          ...interactions,
          donations: [
            ...(interactions.donations || []),
            {
              id: crypto.randomUUID(),
              name: "Anonymous",
              amount,
              createdAt: new Date().toISOString(),
            },
          ],
        };

        setInteractions(updated);
        saveInteractions(id as string, updated);
        input.value = "";
      }}
      className="bg-gray-900 text-white px-4 py-2 rounded"
    >
      Donate
    </button>

    <p className="text-sm text-gray-500">
      Mobile Money & Card payments coming soon
    </p>
  </div>

      </div>
    </BrochureShell>
  );
}

export default function PublicBrochurePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-gray-500">
          Loading…
        </div>
      }
    >
      <PublicBrochureContent />
    </Suspense>
  );
}
