"use client";

import { useState } from "react";
import TierBadge from "./TierBadge";
import LogTouchSheet from "./LogTouchSheet";
import { defaultTextBody, smsHref, telHref } from "@/lib/phone";
import { formatDateUS, relativeDays, snippet } from "@/lib/format";
import type { Buyer, TouchType, User } from "@/lib/types";

/**
 * One buyer, as a tappable card.
 *
 * Call / Text open the phone's native dialer or SMS app via tel:/sms: links,
 * then immediately open the log sheet so the outcome gets recorded while it's
 * fresh. Nothing is written to Airtable until the sheet is saved.
 */
export default function BuyerCard({
  buyer,
  currentUser,
  onLogged,
}: {
  buyer: Buyer;
  currentUser: User;
  onLogged: (updated: Buyer) => void;
}) {
  const [sheetType, setSheetType] = useState<TouchType | null>(null);

  const tel = telHref(buyer.phone);
  const sms = smsHref(buyer.phone, defaultTextBody(buyer.buyerName, currentUser));

  const isExcluded = buyer.callStatus === "Excluded";
  const isCooling = buyer.callStatus === "Cooling down";
  const neverCalled = buyer.timesCalled === 0 && !buyer.lastCalled;

  return (
    <>
      <article className="card space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <TierBadge tier={buyer.tier} />
              <h2 className="truncate text-lg font-semibold">
                {buyer.buyerName || "(no name)"}
              </h2>
            </div>
            <p className="truncate text-sm text-muted">{buyer.username}</p>
          </div>

          <div className="shrink-0 text-right">
            <p className="font-mono text-sm">{buyer.phoneDisplay}</p>
            {buyer.channel && <p className="text-xs text-muted">{buyer.channel}</p>}
          </div>
        </div>

        {/* Status chips */}
        <div className="flex flex-wrap gap-2">
          {buyer.callWindow && buyer.callWindow !== "Unknown" && (
            <span className="chip">🕐 {buyer.callWindow}</span>
          )}
          <span className="chip">
            {neverCalled ? "Never called" : `Called ${relativeDays(buyer.lastCalled)}`}
            {buyer.timesCalled > 0 && ` · ${buyer.timesCalled}×`}
          </span>
          {buyer.lastTexted && (
            <span className="chip">💬 Texted {relativeDays(buyer.lastTexted)}</span>
          )}
          {buyer.lastOutcome && <span className="chip">{buyer.lastOutcome}</span>}
          {buyer.dataFlag && buyer.dataFlag !== "Clean" && (
            <span className="chip border-amber-600 text-amber-400">
              ⚠ {buyer.dataFlag}
            </span>
          )}
          {!buyer.isCallable && (
            <span className="chip border-red-600 text-red-400">⚠ Check number</span>
          )}
        </div>

        {buyer.callNotes && (
          <p className="text-sm leading-snug text-slate-400">
            {snippet(buyer.callNotes)}
          </p>
        )}

        {/* Cooling-down / excluded notices replace the action buttons. */}
        {isExcluded ? (
          <p className="rounded-xl bg-panel2 px-3 py-2 text-sm text-red-400">
            Excluded — {buyer.lastOutcome}. Do not contact.
          </p>
        ) : (
          <>
            {isCooling && (
              <p className="rounded-xl bg-panel2 px-3 py-2 text-xs text-amber-400">
                Cooling down — eligible {formatDateUS(buyer.nextEligible)}. Only
                call if they reached out first.
              </p>
            )}

            <div className="grid grid-cols-2 gap-2">
              {tel ? (
                <a href={tel} className="btn-call" onClick={() => setSheetType("Call")}>
                  📞 Call
                </a>
              ) : (
                <span className="btn-disabled" title="Phone number is unusable">
                  📞 Call
                </span>
              )}

              {sms ? (
                <a href={sms} className="btn-text" onClick={() => setSheetType("Text")}>
                  💬 Text
                </a>
              ) : (
                <span className="btn-disabled" title="Phone number is unusable">
                  💬 Text
                </span>
              )}
            </div>

            {/* Escape hatch: log without launching the dialer. */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                className="btn-ghost text-sm"
                onClick={() => setSheetType("Call")}
              >
                Log a call
              </button>
              <button
                type="button"
                className="btn-ghost text-sm"
                onClick={() => setSheetType("Text")}
              >
                Log a text
              </button>
            </div>
          </>
        )}
      </article>

      {sheetType && (
        <LogTouchSheet
          buyer={buyer}
          type={sheetType}
          onClose={() => setSheetType(null)}
          onLogged={(updated) => {
            setSheetType(null);
            onLogged(updated);
          }}
        />
      )}
    </>
  );
}
