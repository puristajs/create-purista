# PURISTA Create CLI

This repository contains the standalone project-creation wrapper for PURISTA.
The wrapper now delegates to the shared modular engine in `@purista/cli`, so
interactive and non-interactive creation follow the same command contract as the
main `purista init` command. Project generation itself now happens through the
shared local blueprint engine in `@purista/cli`; this wrapper no longer clones
templates or owns separate scaffold logic.

```sh
npm create purista@latest
```

**OR with Bun**

```sh
bun create purista@latest
```

**OR with Yarn**

```sh
yarn create purista@latest
```

**OR with pnpm**

```sh
pnpm create purista@latest
```

You can also use non-interactive flags directly through the wrapper, for example:

```sh
npm create purista@latest my-app -- --defaults --non-interactive
```

Generated projects include scripts for provider-neutral exports:

```sh
npm run export:asyncapi
npm run export:schedules
npm run export:kubernetes-cronjobs
npm run export:runtime
```

Those exports describe service events, schedules, and selected runtime bridge capabilities without requiring PURISTA to own your scheduler, broker, database, or workflow engine.
The Kubernetes CronJob export is manifest generation only: Kubernetes owns the clock, and the generated trigger calls a PURISTA application boundary for an event, queue, or short command target.
Generated projects require `--trigger-image` plus `--trigger-url` or `--trigger-command` when running the Kubernetes export script.

Generated agent guidance keeps AI runtime wiring in application bootstrap/config. Attached agents bind `ai.models` and, when needed, `ai.sandbox`, `ai.runtime`, and `ai.workspaceStore`; durable replay is declared in code with `setWorkspacePolicy({ mode: 'durable', required: true })`.

---

- Official Website: **[purista.dev](https://purista.dev)**
- Follow on Twitter **[@purista_js](https://twitter.com/purista_js)**
- Join the **[Discord Chat](https://discord.gg/9feaUm3H2v)**

<a href="https://www.producthunt.com/posts/purista?utm_source=badge-featured&utm_medium=badge&utm_souce=badge-purista" target="_blank"><img src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=386519&theme=light" alt="PURISTA - Typescript&#0032;framework&#0032;for&#0032;IoT&#0044;&#0032;microservices&#0044;&#0032;and&#0032;serverless | Product Hunt" style="width: 250px; height: 54px;" width="250" height="54" /></a>

---
