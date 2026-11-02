# Frontier Engineer

A personal learning workspace for **DS & Algorithms, Artificial Intelligence, and Frontend Engineering**. Read lessons, watch embedded expert lectures, run code, keep field notes, and track progress without leaving the site.

## What you can do

- Follow **24 topics** across three learning paths, from foundations to advanced engineering concepts.
- Read original, self-contained field notes with examples, tradeoffs, and credited primary references.
- Watch curated companion lectures from MIT OpenCourseWare, 3Blue1Brown, Andrej Karpathy, and freeCodeCamp in embedded players. Some lectures accompany more than one topic; the watch view explains this.
- Solve a challenge for every lesson, with **96 executable example checks**, starter code, and optional reference solutions.
- Run JavaScript, Python, or an HTML/CSS/JavaScript preview in the browser.
- Track **read**, **watched**, and **practised** separately. Read/watch completion is self-reported. Passing all lesson checks automatically completes practice; you can also mark practice yourself.
- Save notes and code drafts automatically. Export and restore JSON backups to move your work between browsers.
- Build three capstone projects to connect algorithms, AI evaluation, and accessible frontend design.

This is a curated starting curriculum and practice environment. Becoming an exceptional engineer also requires deeper projects, feedback, experimentation, and continued study; completing a checklist is not a certification.

## Run locally

Use Node.js 22 or later. There are **no npm dependencies** to install.

```sh
npm start
```

Open http://127.0.0.1:4173 in your browser. To choose another port, set `PORT` before starting. Serve the `site/` folder over HTTP; opening `index.html` directly as a file will not load the curriculum.

```sh
npm run check
```

This checks JavaScript syntax and runs 31 tests covering the curriculum, all reference solutions, progress accounting, backup validation, and the worker runner.

## Publish on GitHub Pages

The included `.github/workflows/pages.yml` validates the app and publishes **only `site/`**. No build or secret keys are required.

1. On a free GitHub plan, make this repository **public**. GitHub's Pages settings will explain when a paid plan supports a private source repository. The workflow currently skips deployment for private repositories so verification can still pass before publication.
2. Open **Settings → Pages → Build and deployment → Source**, and choose **GitHub Actions**.
3. Open **Actions → Verify and publish Frontier → Run workflow** for the first deployment. Future pushes to `main` redeploy automatically.
4. Read the verified deployment URL in the workflow or Pages settings. For this repository, the expected address is `https://mohitnegi724.github.io/frontier-engineer/` (it only becomes live after deployment succeeds).

All asset URLs are relative, and navigation uses hashes, so project subpaths work without a custom router or 404 workaround.

## Where your work lives

Progress, notes, and drafts use `localStorage` under `frontier-workspace-v1`. They stay in the current browser on the current origin. They are **not committed to GitHub**, uploaded to a backend, or synchronized between devices. Private browsing, clearing site data, storage limits, or changing the site origin can remove or separate that data. Use **My progress → Backup & restore** regularly. The backup may contain your private notes and code, so keep it somewhere appropriate.

Importing a valid v1 backup merges records. A matching lesson or code draft in the backup replaces the matching local record. Backup data is validated, limited in size, and rendered as text. No account sign-in is required to use the app. Activity history counts tasks marked complete, including a task marked complete again after being unchecked; it does not measure time spent or verify video consumption.

## Browser code execution

- **JavaScript:** runs in a fresh Web Worker for each run. Long runs stop after 4 seconds; console output is limited. The runner has no access to the page DOM or localStorage. Example checks are visible learning aids, not a secure grading service or proof of general correctness.
- **Python:** uses pinned Pyodide 0.27.7 from jsDelivr, in a worker. The runtime downloads on demand (up to 90 seconds allowed for initial loading). Execution is limited to 15 seconds after loading. Standard-library examples work; the app does not automatically install arbitrary third-party Python packages. Python is a free playground; lesson checks run in JavaScript.
- **HTML/CSS/JS:** uses an iframe with `sandbox="allow-scripts"` and a restrictive preview content policy. Inline styles/scripts and data images work; external libraries, network access, navigation of the parent, and workspace access are restricted. A synchronous infinite loop in an HTML preview may still slow the tab; stop/reload it if needed. Use the JavaScript worker mode for unbounded computation experiments.

Do not paste private API keys into a public/shared playground or into repository source. This site intentionally has no live model API integration and requires no paid services.

## Sources and embedded media

Reading text and exercises in this repository are original educational explanations. Optional reference links provide depth but are not needed to complete a lesson. We embed creator-hosted videos rather than copying videos, articles, or transcripts.

- [MIT 6.006 Introduction to Algorithms](https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/)
- [3Blue1Brown neural network lessons](https://www.3blue1brown.com/lessons/neural-networks)
- [Andrej Karpathy's LLM deep dive](https://www.youtube.com/watch?v=7xTGNNLPyMI)
- [freeCodeCamp frontend project course](https://www.freecodecamp.org/news/frontend-web-development-in-depth-project-tutorial)
- [React: Thinking in React](https://react.dev/learn/thinking-in-react)
- [MDN JavaScript Guide](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide)
- [Attention Is All You Need](https://arxiv.org/abs/1706.03762)
- [Retrieval-Augmented Generation](https://arxiv.org/abs/2005.11401)

Videos load from YouTube's privacy-enhanced embed domain only after you press play. Playback requires internet access and depends on publisher permissions, region, and browser policies. A third-party player may show its own controls and links; those are controlled by the publisher. The field notes and code challenges remain on the site if a video is unavailable. Google Fonts loads the interface fonts, with system fonts as a fallback. Python uses the CDN described above. Those providers receive ordinary network requests when their resources are loaded.

## Edit the curriculum

Add or update objects in `site/curriculum.json`. Each lesson has a stable `id`, `track`, `title`, `level`, description, three reading sections, a practice question, function name, starter, test cases, reference solution, video metadata, and a primary source. Keep IDs stable so saved progress remains attached. Add exercises with meaningful failure cases and verify them with `npm run check`.

```text
site/
  index.html          App shell
  styles.css          Responsive interface
  app.js              Navigation, learning views, persistence, playground
  state.js            Backup validation and progress calculations
  curriculum.json     24 lessons and 96 example checks
  runner.js           JavaScript worker
  python-runner.js    Python worker
scripts/server.mjs    Dependency-free local server
tests/               Curriculum, solution, storage and runner checks
.github/workflows/   Verification and GitHub Pages deployment
```

## License

App code and original reading/exercises are under the MIT license. Linked references, embedded media, fonts, and other third-party works retain their creators' licenses and rights. Inclusion does not imply endorsement.
