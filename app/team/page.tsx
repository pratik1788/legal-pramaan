"use client";

import { useCallback, useEffect, useState } from "react";

interface ChangeRequest {
  id: string;
  title: string;
  description: string;
  authorName: string;
  status: "NEW" | "IN_PROGRESS" | "DONE" | "DECLINED";
  adminNote: string;
  createdAt: string;
}

const STATUS_STYLE: Record<ChangeRequest["status"], string> = {
  NEW: "bg-amber-100 text-amber-800",
  IN_PROGRESS: "bg-blue-100 text-blue-800",
  DONE: "bg-green-100 text-green-800",
  DECLINED: "bg-slate-200 text-slate-600",
};

const STATUS_LABEL: Record<ChangeRequest["status"], string> = {
  NEW: "New",
  IN_PROGRESS: "Being built",
  DONE: "Done",
  DECLINED: "Declined",
};

export default function TeamPage() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [passcode, setPasscode] = useState("");
  const [passError, setPassError] = useState("");
  const [requests, setRequests] = useState<ChangeRequest[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    fetch("/api/team/session")
      .then((r) => r.json())
      .then((j) => setAuthed(!!j.authenticated))
      .catch(() => setAuthed(false));
  }, []);

  const load = useCallback(async () => {
    const r = await fetch("/api/team/requests");
    if (r.status === 401) {
      setAuthed(false);
      return;
    }
    const j = await r.json();
    setRequests(j.requests ?? []);
  }, []);

  useEffect(() => {
    if (authed) load();
  }, [authed, load]);

  async function enter(e: React.FormEvent) {
    e.preventDefault();
    setPassError("");
    const r = await fetch("/api/team/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ passcode }),
    });
    if (r.ok) {
      setAuthed(true);
      setPasscode("");
    } else {
      setPassError("Wrong passcode — ask the group admin for the current one.");
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setFormError("Please give your request a title and a description.");
      return;
    }
    setSubmitting(true);
    setFormError("");
    const r = await fetch("/api/team/requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: title.trim(), description: description.trim(), authorName: authorName.trim() }),
    });
    setSubmitting(false);
    if (!r.ok) {
      setFormError("Couldn't save your request — please try again.");
      return;
    }
    setTitle("");
    setDescription("");
    load();
  }

  if (authed === null) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16">
        <p className="text-slate-500">Loading…</p>
      </div>
    );
  }

  if (!authed) {
    return (
      <div className="mx-auto max-w-sm px-4 py-16">
        <h1 className="text-xl font-bold">Legal Pramaan — Team</h1>
        <p className="mt-1 text-sm text-slate-500">
          This area is for the product team. Enter the team passcode shared in the WhatsApp group.
        </p>
        <form onSubmit={enter} className="card mt-6 space-y-3">
          <input
            type="password"
            className="input"
            placeholder="Team passcode"
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
            autoFocus
          />
          {passError && <p className="text-sm text-red-600">{passError}</p>}
          <button className="btn-primary w-full">Enter</button>
        </form>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-bold">Request a change</h1>
      <p className="mt-1 text-sm text-slate-500">
        Describe in plain words how a feature should work — e.g. how the payment step should behave.
        It goes straight to the build queue; you'll see its status update here when it's done.
      </p>

      <form onSubmit={submit} className="card mt-6 space-y-3">
        <input
          className="input"
          placeholder="Your name (optional)"
          value={authorName}
          onChange={(e) => setAuthorName(e.target.value)}
        />
        <input
          className="input"
          placeholder="Short title — e.g. Payment should ask for GSTIN"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          className="input min-h-28"
          placeholder="Describe how it should work instead. Be specific — what should the customer see and do, step by step?"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        {formError && <p className="text-sm text-red-600">{formError}</p>}
        <button className="btn-primary w-full" disabled={submitting}>
          {submitting ? "Sending…" : "Send request"}
        </button>
      </form>

      <h2 className="mt-10 text-lg font-bold">All requests</h2>
      <div className="mt-3 space-y-3">
        {requests.map((r) => (
          <div key={r.id} className="card">
            <div className="flex items-start justify-between gap-3">
              <p className="font-semibold">{r.title}</p>
              <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLE[r.status]}`}>
                {STATUS_LABEL[r.status]}
              </span>
            </div>
            <p className="mt-2 whitespace-pre-wrap text-sm text-slate-600">{r.description}</p>
            {r.adminNote && (
              <p className="mt-2 rounded bg-slate-50 p-2 text-sm text-slate-600">
                <span className="font-medium">Update: </span>
                {r.adminNote}
              </p>
            )}
            <p className="mt-2 text-xs text-slate-400">
              {r.authorName ? `${r.authorName} · ` : ""}
              {new Date(r.createdAt).toLocaleString("en-IN")}
            </p>
          </div>
        ))}
        {requests.length === 0 && (
          <p className="text-sm text-slate-500">No requests yet — yours will be the first.</p>
        )}
      </div>
    </div>
  );
}
