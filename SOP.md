# SOP — Witter Call & Text Tracker

**Who this is for:** Seth, Ben, Marley, Colton
**What it replaces:** editing the Airtable grid by hand
**Rule of thumb:** if you dialed or texted someone, log it before you put the phone down.

---

## 1. Getting in

1. Open the app link on your phone.
2. Type the **team PIN**.
3. Tap **your name**.

That's it. No password. You stay signed in for 30 days, so you'll normally only
do this once.

**Put it on your home screen** so it opens like a real app:

- **iPhone (Safari):** Share → *Add to Home Screen*
- **Android (Chrome):** ⋮ → *Add to Home screen*

**If you tapped the wrong name:** hit **Switch** in the top right and pick again.
Nothing is logged under a name until you actually save a call or text, so a
mis-tap does no damage.

> **Always use your own name.** Every call and text gets stamped with whoever is
> signed in. If Marley logs a call while the phone says "Ben", the history is
> wrong and nobody can untangle it later.

---

## 2. The two tabs

| Tab | What's in it | When you use it |
| --- | --- | --- |
| **My Queue** | Only *your* buyers who are OK to call today | Every day. This is your work list. |
| **All Buyers** | All 60, searchable | Someone calls *you* back, or Seth is looking something up |

### My Queue is already sorted for you

Top of the list = who to call first. The order is:

1. **Tier A** before B before C
2. **Never contacted** before people you've already talked to
3. Then whoever you haven't called in the longest

So just work top to bottom. Don't cherry-pick.

The header tells you where you stand — e.g. **"7 to call · 7 tier A"**.

**Empty queue?** Two possibilities:
- *"Queue is clear"* — you're done. Everyone assigned to you is cooling down.
- *"Nothing is assigned to you yet"* — Seth needs to set **Assigned To** in
  Airtable for some buyers.

---

## 3. Reading a buyer card

```
 (A)  Andrew Amrein                      (513) 780-2507
      @ward_frog                                Whatnot

      [Never called]

      Trailing WN spend ~$18.5k across 3 sets. Also buys
      under @dhditb (~$9.2k) - may be the same person.

      [   📞 Call   ]  [   💬 Text   ]
      [  Log a call  ]  [  Log a text ]
```

- **Big name** — the buyer's real name. **Use this on the call, not the username.**
- **Green/yellow/gray circle** — Tier A / B / C.
- **Whatnot / eBay** — where they buy. A surprise-set buyer and an eBay auction
  buyer are different conversations. Know which before you dial.
- **Grey chips** — history at a glance: how long since you called, how many
  times, best time to reach them, last outcome.
- **Grey text** — the running notes, newest first. **Read this before you dial.**

### Warning chips

| Chip | Meaning | What to do |
| --- | --- | --- |
| ⚠ **Check number** | The phone number isn't a valid 10-digit US number | Don't guess. Fix it in Airtable, then it becomes callable. |
| ⚠ **Verify Name** | Name and username may not match | Confirm in Whatnot **before** dialing |
| ⚠ **Duplicate** | Same buyer is on the list twice | Tell Seth; don't call twice |
| ⚠ **Bad Phone Format** | Number needs cleanup | Fix in Airtable |

If Call and Text are greyed out, the number is unusable. That is deliberate —
better than dialing a stranger.

---

## 4. Making a call

1. Read the notes and the tier. Know who you're talking to.
2. Tap **📞 Call**. Your phone's dialer opens and starts the call.
3. Have the conversation.
4. Come back to the app. **The log sheet is already open.**
5. Pick the outcome, type what happened, tap **Save**.

### The outcomes

| Outcome | Use it when | What it does |
| --- | --- | --- |
| **Connected** | You actually talked to them | Starts the cooling-down clock |
| **Voicemail** | Left a message | Starts the clock |
| **No Answer** | Rang out, no voicemail | Starts the clock *(preselected — it's the most common)* |
| **Bad Number** | Wrong person, disconnected | ⚠️ **Removes them from the list permanently** |
| **Do Not Call** | They asked not to be contacted | ⚠️ **Removes them permanently** |

> **Bad Number and Do Not Call are permanent.** They pull the buyer out of
> everyone's queue for good. Only use them when you're certain. If you tap one by
> mistake, tell Seth — it takes an Airtable edit to undo.

### If you picked "Connected"

An extra dropdown appears: **best time to reach them**. Fill it in if you learned
it — "he said afternoons are better" — and everyone gets a better shot next time.
Times are **the buyer's local time**, not ours. Leave it alone if you didn't learn
anything.

### Writing the note

Write it so **Seth can read it cold** and know where the relationship stands.

✅ **Good:**
> Wants first look at Morgan dollars. Traveling until the 20th, call after that.
> Mentioned he also buys under @dhditb — same person, confirmed.

❌ **Not useful:**
> talked to him

You don't have to write anything — leave it blank and the note becomes
`Call logged — No Answer.` automatically. But a real note is the whole point of
this exercise.

---

## 5. Sending a text

Same flow: tap **💬 Text**. Your messaging app opens **with a draft already
written**, using their first name and your name.

**Edit it before you send.** It's a starting point, not a script. Then come back
and save the log.

Text outcomes:

| Outcome | Use it when |
| --- | --- |
| **Sent** | You sent it *(preselected)* |
| **Replied** | They wrote back |
| **No Reply** | Marking one that went nowhere |

Texts are counted separately from calls, and texting someone does **not** start
their call cooling-down clock — that's driven by `Last Called` only.

> **One quirk to know:** the outcome you pick on a text still overwrites the
> buyer's **Last Outcome** field. So if you text someone and pick *Sent*, the card
> will show "Sent" even though the last *call* was a voicemail. The full,
> unambiguous history is always in the `Touches` table.

---

## 6. "Log a call" / "Log a text" (the grey buttons)

Use these when the call already happened somewhere else:

- They called **you** back
- You talked to them at a show or on a livestream
- You called from your desk phone
- You forgot to log one yesterday

Same sheet, same result — it just doesn't open the dialer.

> **Logging always uses today's date.** If you're catching up on yesterday's
> calls, say so in the note ("called 8/10, logging late") so the history stays
> honest.

---

## 7. Why people disappear from your queue

The moment you log a call, that buyer **drops off your queue** and comes back
later. This is on purpose — it's what stops us from pounding people.

| Tier | Comes back after |
| --- | --- |
| **A** | 30 days |
| **B** | 45 days |
| **C** | 60 days |

You'll see: *"Cooling down — eligible 9/10/2026."*

**Don't fight this.** Don't re-call someone who's cooling down just to look busy.
The one exception is if **they** reached out to you — then use **Log a call** and
say so in the note.

To see who's resting, tap **"Show N cooling down / excluded"** at the bottom of
your queue.

### Three strikes

Per the original calling rules: **three no-answers in a row means stop.** Let that
buyer rest a full quarter. The app shows you the attempt count (`3×`) — watch for
it and use your judgment.

---

## 8. All Buyers tab

Use it when someone calls you back and you need to find them fast, or when Seth
wants to look up an account.

- **Search** by name, username, or phone number — digits work even if the
  formatting doesn't match (`5137802507` finds `(513) 780-2507`).
- **Filters:** tier, owner, status, channel.

Handy combos:

| Goal | Filter |
| --- | --- |
| Who has never been touched? | Status = **Never contacted** |
| What's Colton sitting on? | Everyone → **Colton** |
| Just the whales | Tier = **A** |
| Who did we lose? | Status = **Excluded** |

You can log a call or text from here too — same buttons.

---

## 9. Where it all ends up

Everything lands in Airtable automatically. You should never need to edit the
grid by hand.

- **`Touches` table** — one permanent row per call/text: who, when, type,
  outcome, notes. This is the real history. **Don't edit or delete rows here.**
- **`Master Phone Call List`** — the quick-glance mirror: `Last Called`,
  `Called By`, `Times Called`, `Last Texted`, `Texted By`, `Times Texted`,
  `Last Outcome`.
- **`Call Notes`** — your notes stack up newest-first, stamped like
  `8/11/2026 (Seth) — Wants first look at Morgan dollars.`

---

## 10. When something goes wrong

| What you see | What it means | Do this |
| --- | --- | --- |
| Bounced to the PIN screen | Session expired (30 days) or you signed out | Sign in again |
| **"That PIN isn't right"** | Wrong PIN | Ask Seth. It's shared — don't guess repeatedly |
| **"Network error — nothing was saved"** | No signal when you hit Save | **Nothing was logged.** Get signal and log it again |
| **"Couldn't load buyers"** | App can't reach Airtable | Tell Justin — usually an expired token |
| Call/Text greyed out | Bad phone number | Fix the number in Airtable |
| Someone's missing from your queue | Cooling down, excluded, or assigned to someone else | Check **All Buyers** |

> If Save fails, **assume it didn't save**. Check the card — if your note isn't
> on it, log it again.

---

## 11. Daily rhythm

**Start of shift**
1. Open the app, confirm it says *your* name.
2. Look at the count: "7 to call."
3. Work top to bottom.

**Each buyer**
1. Read the notes and tier.
2. Check the call window — is now a reasonable time *for them*?
3. Call. Talk. Log it immediately.

**End of shift**
- Queue empty, or everything you touched is logged. No mental backlog.

---

## 12. For Seth (admin)

**Assigning buyers** — done in Airtable, not the app. Set **Assigned To** on the
buyer row. This is deliberate: one owner per buyer, permanently, so the
relationship builds. It's not a button someone can fat-finger mid-call.

**Un-excluding someone** — if a *Do Not Call* or *Bad Number* was a mistake,
clear **Last Outcome** in Airtable and they come back into the queue.

**Reviewing the team's work** — open the `Touches` table in Airtable and group by
**By**. That's every call and text, per person, with dates and notes.

**Changing the PIN** — set `APP_PIN` in the Vercel environment variables and
redeploy. Do this whenever someone leaves.

**Adding a person** — needs a small code change (`USERS` in `src/lib/types.ts`)
plus a new option on `Assigned To`, `Called By` and `Texted By` in Airtable. Ask
Justin.

---

## 13. The short version

1. Sign in as **yourself**.
2. Work **My Queue** top to bottom.
3. **Read the notes** before you dial.
4. Use their **real name**, not their username.
5. **Log every touch immediately.**
6. Write notes Seth can read cold.
7. Leave cooling-down buyers alone.
8. **Bad Number / Do Not Call are permanent** — be sure.
