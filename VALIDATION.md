# Validation record

Validated on 2 November 2026.

- `npm run check`: all 31 tests pass, including all 96 reference-solution cases.
- Chrome: wrong lesson code reports failed checks; correct code passes 4/4 and marks practice complete.
- Chrome reload: lesson completion flags, notes, and code draft are retained.
- MIT Algorithms and Computation plays inside the lesson's YouTube embed.
- Python runtime loads and prints the expected cosine similarity, 0.7143.
- HTML/CSS/JS preview renders inline; its button updates its live message.
- Responsive overview and playground checked at 390px width without horizontal page overflow.
- GitHub Pages workflow is included. Its deployment depends on Pages being enabled and the source repository being public for this account's current plan.

Third-party playback and CDN availability can change independently of the application. Example exercise checks do not prove general correctness. Personal data stays in browser storage and is absent from the repository.

## Firebase authentication and account sync update

- 40 application tests pass, including interrupted saves, in-flight edits, recovery after refresh, account separation, remote updates, and opt-in legacy migration.
- Seven Firebase emulator integration tests pass against the exact production rules: owner access succeeds; anonymous users, other accounts, forged identity fields, non-Google providers, invalid records, and unknown collections are denied.
- Cloud Firestore uses the dedicated `frontier-engineer` project on the Spark plan, in Mumbai (`asia-south1`).
- Google sign-in is enabled and the GitHub Pages hostname is authorized.
- The sign-in screen hides the learning workspace until the authenticated account's cloud data loads.
- Playground workers are isolated from Firebase Auth persistence by an opaque-origin iframe.
- Real Google sign-in succeeds; Firebase console confirms the profile contains the signed-in name and email.
- A temporary note was confirmed saved and restored after a fresh page load.
- Sign-out removes the workspace; a direct playground route remains behind the sign-in screen.
- The isolated JavaScript worker reports SecurityError when attempting IndexedDB access, while normal JavaScript and Python execution still work.

## Topic alignment and hierarchy update

- Audited all 24 Read/Watch/Practise mappings and selected 24 distinct videos, checking titles/publishers against YouTube metadata and creator solution pages where applicable.
- Replaced the vectors-to-attention mismatch, repeated frontend full-course video, generic LLM overview assignments, and mismatched data-structure lectures.
- CSS auto-fit uses the creator's 18:52–22:31 chapter; async cancellation uses the 1:15–2:19 chapter. Embedded URLs include both start and end boundaries.
- Ordered stages and explicit prerequisites are validated before rendering. Cycles, future prerequisites, activity swaps, and unfocused reused videos fail validation.
- All 46 application tests pass, including all 96 reference-solution examples and six curriculum regression tests. The unchanged Firebase authorization suite remains part of CI.
- Stable lesson IDs and exercise contracts preserve existing Firebase progress and drafts.
