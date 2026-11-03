# Frontier Engineer

A Google-authenticated personal learning workspace for **DS & Algorithms, Artificial Intelligence, and Frontend Engineering**.

[Open the live workspace](https://mohitnegi724.github.io/frontier-engineer/)

Sign in with Google to open the app. Each account has a private Firebase profile and cloud-synced workspace. Read lessons, watch embedded expert lectures, run code, keep field notes, and track progress without leaving the site.

## What you can do

- Follow **24 topics** across three learning paths, from foundations to advanced engineering concepts.
- Read original, self-contained field notes with examples, tradeoffs, and credited primary references.
- Choose from **2–3 topic-matched videos per lesson (49 total)**, with a clear starting point and alternative worked examples. Educators include StatQuest, 3Blue1Brown, NeetCode, CS Dojo, WilliamFiset, codebasics, Kevin Powell, Web Dev Simplified, and others. Videos play inline; switching replaces the previous player. Selected chapters start and stop at their topic boundaries.
- Solve a challenge for every lesson, with **96 executable example checks**, starter code, and optional reference solutions.
- Run JavaScript, Python, or an HTML/CSS/JavaScript preview in the browser.
- Track **read**, **watched**, and **practised** separately. Read/watch completion is self-reported. Passing all lesson checks automatically completes practice; you can also mark practice yourself.
- Save progress, notes, and code drafts to Cloud Firestore automatically, with per-account recovery copies for interrupted connections. Export and restore private JSON backups too.
- Build three capstone projects to connect algorithms, AI evaluation, and accessible frontend design.

This is a curated starting curriculum and practice environment. Becoming an exceptional engineer also requires deeper projects, feedback, experimentation, and continued study; completing a checklist is not a certification.

## Run locally

Use Node.js 22 or later. Running the static app does not require installing packages; the Firebase web SDK loads from the official CDN. Development test tools can be installed with `npm ci`.

```sh
npm start
```

Open http://127.0.0.1:4173 in your browser. To choose another port, set `PORT` before starting. Serve the `site/` folder over HTTP; opening `index.html` directly as a file will not load the curriculum.

```sh
npm run check
```

This checks JavaScript syntax and runs 48 tests covering the curriculum, reference solutions, progress, account isolation, cloud synchronization, backups, migration, video selection, and code execution. `npm ci` installs tools for the additional seven Firestore authorization tests; run `npm run test:rules` with Java 21 or later installed. These tests use an isolated demo project, never production data.

## Publish on GitHub Pages

The included `.github/workflows/pages.yml` validates the app and publishes **only `site/`**. No build or secret keys are required.

1. On a free GitHub plan, make this repository **public**. GitHub's Pages settings will explain when a paid plan supports a private source repository. The workflow currently skips deployment for private repositories so verification can still pass before publication.
2. Open **Settings → Pages → Build and deployment → Source**, and choose **GitHub Actions**.
3. Open **Actions → Verify and publish Frontier → Run workflow** for the first deployment. Future pushes to `main` redeploy automatically.
4. Read the verified deployment URL in the workflow or Pages settings. For this repository, the expected address is `https://mohitnegi724.github.io/frontier-engineer/` (it only becomes live after deployment succeeds).

All asset URLs are relative, and navigation uses hashes, so project subpaths work without a custom router or 404 workaround.

## Authentication and cloud data

Firebase project: `frontier-engineer`, Spark plan. Firestore Standard database region: `asia-south1` (Mumbai). GitHub Pages remains the website host. Google Analytics is not enabled.

Only the sign-in page is shown before Firebase Authentication confirms a Google session. The app shell stays hidden during authentication and cloud loading, and is cleared on sign-out or an account change. Every signed-in Google user can use the app; there is no email allowlist. The public curriculum and application source remain public in this GitHub repository. Private records are protected by database rules, not by hiding HTML.

Firestore stores:

- `users/{uid}`: `uid`, `name`, `email`, `createdAt`, `updatedAt`, and `lastLoginAt`. Name and email come from Google sign-in, and timestamps use the server clock.
- `users/{uid}/workspace/settings`: workspace version and last lesson.
- `users/{uid}/workspace/lesson-{id}`: separate read, watched, practised flags and notes.
- `users/{uid}/workspace/draft-{id}`: code drafts, each in its own document.
- `users/{uid}/workspace/activity-{date}`: activity count for that local calendar day.
- `users/{uid}/workspace/capstone-{id}`: capstone completion.

`firestore.rules` allows authenticated Google users to read and write only their own UID path. It rejects forged profile identity fields, invalid shapes, oversized records, user listing, anonymous access, and cross-account access. Rules are deployed separately from GitHub Pages; they are also tested in the Firebase emulator during CI. No service-account credentials or OAuth client secrets are shipped to the browser. `site/firebase-config.js` contains public Firebase web application identity; access control belongs in the rules.

Changes are debounced to reduce writes. A live listener accepts updates from other devices. Records are split by lesson, draft, and activity rather than placing every code draft in one size-limited Firestore document. Concurrent changes to the **same record** use the last acknowledged write; this is not a collaborative text editor. The status in the top bar distinguishes pending writes, confirmed cloud saves, and failures. If disconnected, pending changes are kept in a UID-scoped recovery copy and retried. Firebase quotas still apply to the free plan.

Browser recovery keys use `frontier-account-v2:{uid}`. A different account never automatically loads another account's recovery copy. Sign-out clears the displayed workspace and stops the listener and code runner; an unsent recovery copy may remain on the device so that the same user can recover it later. Private backups may contain notes and code; store them appropriately.

Existing pre-login records under `frontier-workspace-v1` are **not** automatically attached to an account. A signed-in user can choose “Import my progress” if those records belong to them. The import preserves completed activities and existing cloud drafts, and retains both sets of notes where possible. Backup restore writes restored records to the signed-in user's Firebase workspace.

### Firebase setup for another deployment

1. Create a Firebase project and register a web app. Put its public web configuration in `site/firebase-config.js`.
2. Enable **Authentication → Sign-in method → Google**, setting the app's display name and support email.
3. Add the website hostname (without its path) under **Authentication → Settings → Authorised domains**. This deployment uses `mohitnegi724.github.io`; localhost is used for development.
4. Create a default Firestore Standard database in production mode, then deploy the exact `firestore.rules` in this repository using the console or `firebase deploy --only firestore:rules --project YOUR_PROJECT_ID` from an authorized CLI session.
5. Run `npm run check` and `npm run test:rules`, then test Google login, refresh, sign-out, cloud writes, and cross-account denial before publishing.

The sign-in screen explains that name and email are stored in Firebase. Google sign-in needs a normal browser with popups enabled. If an embedded browser cannot finish Google sign-in, open the same site in Chrome or another supported browser.

## Browser code execution

- **JavaScript:** runs in a fresh Web Worker owned by an opaque-origin sandbox iframe for each run. Long runs stop after 4 seconds; console output is limited. The runner cannot access the app's DOM, localStorage, IndexedDB, or Firebase Auth persistence. JavaScript worker network requests are blocked by its content policy. Example checks are visible learning aids, not a secure grading service or proof of general correctness.
- **Python:** uses pinned Pyodide 0.27.7 from jsDelivr, in an opaque-origin sandbox worker. Its content policy allows the runtime CDN, but blocks access to the application origin. The runtime downloads on demand (up to 90 seconds allowed for initial loading). Execution is limited to 15 seconds after loading. Standard-library examples work; the app does not automatically install arbitrary third-party Python packages. Python is a free playground; lesson checks run in JavaScript.
- **HTML/CSS/JS:** uses an iframe with `sandbox="allow-scripts"` and a restrictive preview content policy. Inline styles/scripts and data images work; external libraries, network access, navigation of the parent, and workspace access are restricted. A synchronous infinite loop in an HTML preview may still slow the tab; stop/reload it if needed. Use the JavaScript worker mode for unbounded computation experiments.

Do not paste private API keys into a public/shared playground or into repository source. This site intentionally has no live model API integration and requires no paid services.

## Sources and embedded media

Reading text and exercises in this repository are original educational explanations. Optional reference links provide depth but are not needed to complete a lesson. We embed creator-hosted videos rather than copying videos, articles, or transcripts.

- [MIT 6.006 Introduction to Algorithms](https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/)
- [3Blue1Brown neural network lessons](https://www.3blue1brown.com/lessons/neural-networks)
- [NeetCode problem explanations](https://neetcode.io/solutions)
- [StatQuest video index](https://statquest.org/video_index.html)
- [Chrome accessibility labeling lesson](https://www.youtube.com/watch?v=8dCUzOiMRy4)
- [Web Dev Simplified](https://www.youtube.com/@WebDevSimplified)
- [React: Thinking in React](https://react.dev/learn/thinking-in-react)
- [MDN JavaScript Guide](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide)
- [Attention Is All You Need](https://arxiv.org/abs/1706.03762)
- [Retrieval-Augmented Generation](https://arxiv.org/abs/2005.11401)

Videos load from YouTube's privacy-enhanced embed domain only after you press play. Playback requires internet access and depends on publisher permissions, region, and browser policies. A third-party player may show its own controls and links; those are controlled by the publisher. The field notes and code challenges remain on the site if a video is unavailable. Google Fonts loads the interface fonts, with system fonts as a fallback. Python uses the CDN described above. Those providers receive ordinary network requests when their resources are loaded.

## Edit the curriculum

Add or update objects in `site/curriculum.json`. Each lesson has a stable `id`, `track`, `title`, `level`, description, three reading sections, a practice question, function name, starter, test cases, reference solution, video metadata, and a primary source. Keep IDs stable so saved progress remains attached. Every lesson declares its path step, recommended prerequisite IDs, one shared learning objective, and matching Read/Watch/Practise topic associations. A focused video may declare both `start` and `end` in seconds. `site/curriculum.js` validates associations, consecutive steps, nondecreasing stages, prerequisite ordering/cycles, and chapter bounds before the app renders. Add exercises with meaningful failure cases and verify them with `npm run check`.

```text
site/
  index.html          App shell
  styles.css          Responsive interface
  app.js              Navigation, learning views, persistence, playground
  state.js            Backup validation and progress calculations
  cloud-sync.js       Per-account sync and pending-write recovery
  firebase-client.js  Google Auth and Firestore transport
  firebase-config.js  Public Firebase web configuration
  isolated-runner.js  Opaque-origin code execution boundary
  curriculum.json     24 aligned lessons, prerequisites, and 96 example checks
  curriculum.js       Ordering, topic-association and video-chapter validation
  runner.js           JavaScript worker
  python-runner.js    Python worker
scripts/server.mjs    Dependency-free local server
tests/               Curriculum, solution, storage and runner checks
.github/workflows/   Verification and GitHub Pages deployment
```

## License

App code and original reading/exercises are under the MIT license. Linked references, embedded media, fonts, and other third-party works retain their creators' licenses and rights. Inclusion does not imply endorsement.

## Topic alignment and learning order

[CURRICULUM_AUDIT.md](CURRICULUM_AUDIT.md) maps each numbered lesson to its shared objective, focused video, exercise, and prerequisites. Paths progress from Foundation through Core to Advanced. For example, AI introduces neurons before gradient descent and classifier metrics before retrieval evaluation. Frontend introduces immutable array transformations and pure logic before async state updates and React filtering. Prerequisites are recommended preparation, not access locks. All paths assume basic programming syntax; the JavaScript playground is used for the guided checks.

The same stable lesson object supplies all three activity tabs. A video title may differ from the lesson title, but its connection to the objective and any exercise-contract differences are shown explicitly. Sources were reviewed on 2 November 2026; publisher-controlled availability and content can change later.
