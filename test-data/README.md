# Test data

## `discord-chat-long.txt`

A long, noisy Discord log to paste into **New Job → Request**. Tests whether the AI isolates the
agreement from chatter and picks the *final* negotiated terms, not the first ones mentioned.

### What a good agreement should contain

| Field | Expected | Trap in the log |
| --- | --- | --- |
| Deliverables | 3 waist-up painterly portraits: Captain Wren, Tinker, Old Marlowe; one neutral expression each | Starts as 4 (ferry ghost is cut); "bust is fine" is overridden by "waist up please" |
| Price | $1,000 CAD | $900 (first offer), $1,050 / $350 each (counter), $1,200 (Leo), $100 (Steam fee), $46 (lunch), $40/hr |
| Payment terms | 50% up front, 50% on delivery | |
| Deadline | Friday, October 30, 2026 | "~2 weeks", the 17th (game jam), Nov 6 (playtest) |
| Revision limit | 2 rounds per portrait (then $40/hr) | |
| File specs | PNG, 2048 x 2048, transparent background, plus layered PSD | |
| Portfolio | Allowed only after the announcement trailer | |

### Should NOT appear as deliverables

- Ferry ghost portrait (cut)
- Expression variants ("a later thing")
- 8 enemy sprites ("that's a maybe, don't count it")
- Leo's dock assets, the Steam fee, lunch, PR 212, crabs

### Reasonable "Missing details"

- IP / rights assignment is never discussed (only portfolio use)
- Nova Scotia residency is never confirmed
- Payment method and invoice timing
- No reference sheet for Marlowe yet (only a paragraph)
- Who signs off on revisions (Sam or Jules)
