# Curriculum alignment audit

Reviewed 2 November 2026. Stable lesson IDs preserve Firebase progress, notes, and drafts. Each row is one topic across Read, Watch, and Practise. Titles and publishers were checked against YouTube metadata; problem-specific videos were also selected from their creator’s solution pages. Metadata verification is not a claim that every second of every video was watched.

All paths assume basic programming syntax (variables, functions, loops, arrays, and objects). The AI path introduces its vector and probability operations in the reading. Stages describe conceptual progression, and prerequisites are recommendations rather than access locks.

## DSA

| Step | Topic / shared objective | Watch | Practise | Before this lesson |
|---|---|---|---|---|
| 1 · Foundation | **Linear scans & complexity** — Use a loop invariant to justify a one-pass maximum search and explain its time and space cost. | [1. Algorithms and Computation](https://www.youtube.com/watch?v=ZA-tUyM_y7s) · MIT OpenCourseWare | `maxValue` | Path entry |
| 2 · Foundation | **Frequency maps & unique characters** — Count character frequencies with a map, then find the first character whose count is one. | [First Unique Character in a String - Leetcode 387 - Python](https://www.youtube.com/watch?v=rBENYgWy3xU) · NeetCodeIO | `firstUnique` | Linear scans & complexity |
| 3 · Foundation | **Stacks & balanced brackets** — Use a last-in, first-out stack to validate matching and correctly nested brackets. | [Valid Parentheses - Stack - Leetcode 20 - Python](https://www.youtube.com/watch?v=WTzjTskDFMg) · NeetCode | `balanced` | Linear scans & complexity |
| 4 · Core | **Sorted arrays & two pointers** — Use sorted order to move two pointers safely while searching for a target pair sum. | [TWO SUM II - Amazon Coding Interview Question - Leetcode 167 - Python](https://www.youtube.com/watch?v=cQ1Oz4ckceM) · NeetCode | `pairSum` | Linear scans & complexity |
| 5 · Core | **Binary search & insertion boundaries** — Maintain a half-open interval to find the first value at least as large as a target. | [Search Insert Position - Binary Search - Leetcode 35 - Python](https://www.youtube.com/watch?v=K-RYzDZkzCI) · NeetCode | `lowerBound` | Sorted arrays & two pointers |
| 6 · Core | **Binary tree depth & recursion** — Define a recursive subtree contract and compute a binary tree’s maximum depth. | [Maximum Depth of Binary Tree - 3 Solutions - Leetcode 104 - Python](https://www.youtube.com/watch?v=hTM3phVI6YQ) · NeetCode | `treeDepth` | Stacks & balanced brackets |
| 7 · Core | **Breadth-first search & shortest paths** — Explore an unweighted graph in distance layers with a queue and visited set. | [9. Breadth-First Search](https://www.youtube.com/watch?v=oFVYVzlvk9c) · MIT OpenCourseWare | `distance` | Frequency maps & unique characters, Stacks & balanced brackets, Binary tree depth & recursion |
| 8 · Advanced | **Dynamic programming & coin change** — Define minimum-coins subproblems and compute them bottom-up instead of relying on a greedy choice. | [Coin Change - Dynamic Programming Bottom Up - Leetcode 322](https://www.youtube.com/watch?v=H9bfqozjoqs) · NeetCode | `minCoins` | Sorted arrays & two pointers, Binary tree depth & recursion |

## AI

| Step | Topic / shared objective | Watch | Practise | Before this lesson |
|---|---|---|---|---|
| 1 · Foundation | **Vectors & cosine similarity** — Compute a dot product and vector norms, then use cosine similarity to compare directions. | [Cosine Similarity, Clearly Explained!!!](https://www.youtube.com/watch?v=e9U0QAFbfLI) · StatQuest with Josh Starmer | `cosine` | Path entry |
| 2 · Foundation | **Neurons, weighted sums & ReLU** — Calculate a neuron’s weighted sum and bias, then apply the ReLU activation. | [But what is a neural network? | Deep learning chapter 1](https://www.youtube.com/watch?v=aircAruvnKk) · 3Blue1Brown | `neuron` | Vectors & cosine similarity |
| 3 · Foundation | **Logits, softmax & numerical stability** — Convert logits into a probability distribution using a numerically stable softmax. | [Neural Networks Part 5: ArgMax and SoftMax](https://www.youtube.com/watch?v=KpKog-L9veg) · StatQuest with Josh Starmer | `softmax` | Neurons, weighted sums & ReLU |
| 4 · Core | **Gradient descent from scratch** — Reduce a differentiable loss by updating a parameter opposite its gradient. | [Gradient descent, how neural networks learn | Deep Learning Chapter 2](https://www.youtube.com/watch?v=IHZwWFHWa-w) · 3Blue1Brown | `descend` | Neurons, weighted sums & ReLU, Logits, softmax & numerical stability |
| 5 · Core | **Confusion matrices & classifier metrics** — Count classification outcomes and derive precision and recall, including zero-denominator cases. | [Machine Learning Fundamentals: The Confusion Matrix](https://www.youtube.com/watch?v=Kdsp6soqA7o) · StatQuest with Josh Starmer | `metrics` | Logits, softmax & numerical stability |
| 6 · Core | **Schema validation for AI tool requests** — Validate the structure, allowed action, and query bounds of a proposed search-tool request before executing it. | [JSON Schema Tricks Every Developer Must Know](https://www.youtube.com/watch?v=IbyYUTBDVXQ) · Postman | `validRequest` | Neurons, weighted sums & ReLU, Confusion matrices & classifier metrics |
| 7 · Advanced | **Scaled dot-product attention** — Score query–key pairs, apply stable softmax, and combine values using the resulting weights. | [Attention in transformers, step-by-step | Deep Learning Chapter 6](https://www.youtube.com/watch?v=eMlx5fFNoYc) · 3Blue1Brown | `attend` | Vectors & cosine similarity, Logits, softmax & numerical stability, Gradient descent from scratch |
| 8 · Advanced | **Retrieval for grounded answers** — Retrieve relevant evidence for a question and evaluate the retrieval stage before generating an answer. | [What is Retrieval-Augmented Generation (RAG)?](https://www.youtube.com/watch?v=T-D1OfcDW1M) · IBM Technology | `rank` | Vectors & cosine similarity, Confusion matrices & classifier metrics, Schema validation for AI tool requests, Scaled dot-product attention |

## FRONTEND

| Step | Topic / shared objective | Watch | Practise | Before this lesson |
|---|---|---|---|---|
| 1 · Foundation | **Accessible names & form labels** — Give interactive controls meaningful accessible names using native labels and appropriate ARIA overrides. | [The art of labeling -- A11ycasts #12](https://www.youtube.com/watch?v=8dCUzOiMRy4) · Chrome for Developers | `accessibleName` | Path entry |
| 2 · Foundation | **Responsive grids & column sizing** — Fit minimum-width cards into a responsive grid while accounting for the gaps between columns. | [Learn how to create a responsive CSS grid layout](https://www.youtube.com/watch?v=sKFW3wek21Q&t=1132s) · Kevin Powell — bounded chapter 1132–1351 seconds | `columns` | Accessible names & form labels |
| 3 · Foundation | **JavaScript arrays & immutable updates** — Transform an array into a new array and replace the changed object without mutating the original state. | [8 Must Know JavaScript Array Methods](https://www.youtube.com/watch?v=R8rmfD9Y5-c) · Web Dev Simplified | `toggleTodo` | Path entry |
| 4 · Core | **Pure functions & testable UI logic** — Keep a UI calculation pure so it can be checked with repeatable input/output tests. | [Learn Pure Functions In 10 Minutes](https://www.youtube.com/watch?v=fYbhD_KMCOg) · Web Dev Simplified | `completion` | JavaScript arrays & immutable updates |
| 5 · Core | **Async requests & stale responses** — Prevent an obsolete asynchronous request from overwriting the result of a newer request. | [I Cannot Believe Abort Controller Can Do This](https://www.youtube.com/watch?v=BeZfiCPhZbI&t=75s) · Web Dev Simplified — bounded chapter 75–139 seconds | `shouldCommit` | JavaScript arrays & immutable updates, Pure functions & testable UI logic |
| 6 · Core | **Runtime type guards & validation** — Check unknown input at runtime before treating it as a typed user object. | [Custom Type Guards in TypeScript](https://www.youtube.com/watch?v=p-YEN-9KnRo) · TypeScript with Benny Code | `isUser` | JavaScript arrays & immutable updates, Pure functions & testable UI logic |
| 7 · Core | **React state & derived product filters** — Store minimal React state and derive visible products from the query and stock toggle. | [Every Beginner React Developer Makes This Mistake With State](https://www.youtube.com/watch?v=tz0fDABt67g) · Web Dev Simplified | `visibleProducts` | JavaScript arrays & immutable updates, Pure functions & testable UI logic, Async requests & stale responses, Runtime type guards & validation |
| 8 · Advanced | **LRU caches for frontend data** — Keep a bounded data cache and evict the least recently used entry after each access. | [LRU Cache - Twitch Interview Question - Leetcode 146](https://www.youtube.com/watch?v=7ABFKPK2hD4) · NeetCode | `cacheKeys` | JavaScript arrays & immutable updates, Frequency maps & unique characters, React state & derived product filters |

## Scope choices

- The matching video and exercise use the same core concept, while explicitly noting contract differences (such as zero-based versus one-based indices).
- The async lesson uses the creator’s bounded AbortController chapter; its exercise implements the complementary stale-response commit guard.
- The responsive-grid lesson starts and ends at the focused auto-fit chapter rather than playing an entire multi-topic course.
- TypeScript practice runs the runtime JavaScript predicate used by a type guard; it does not pretend to compile TypeScript.
- The retrieval exercise implements the retrieval stage of RAG, not generation.
- The structured-request lesson teaches schema validation and applies it to AI tool requests; it does not substitute an unrelated LLM overview.
- Automated curriculum checks enforce ordering, valid prerequisites, topic associations, and focused unique video selection. They cannot determine semantic accuracy from video metadata alone.
