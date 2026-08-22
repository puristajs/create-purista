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

Metrics are opt-in. The default `--telemetry none` keeps the project free of
OpenTelemetry SDK dependencies. Use `--telemetry otel` to generate an
application-owned MeterProvider with a console reader and a declared custom
service metric. Replace that reader with your OTLP/collector setup in the
application; PURISTA never creates an exporter or `/metrics` endpoint itself.

```sh
npm create purista@latest my-app -- --defaults --non-interactive --telemetry otel
```

Generated projects include scripts for provider-neutral exports:

```sh
npm run export:asyncapi
npm run export:schedules
npm run export:kubernetes-cronjobs
npm run export:runtime
```

Before changing an existing generated application, export its definitions and
use the static architecture commands. They do not contact infrastructure or
load business handlers:

```sh
npm run export:definitions
purista inspect --definitions purista.definitions.json --format json
purista validate --definitions purista.definitions.json --strict --format json
purista doctor --definitions purista.definitions.json --format json
```

Those exports describe service events, schedules, and selected runtime bridge capabilities. PURISTA Core also provides a trigger-only Scheduler Runtime that runs as a separate host. For local development only, generated projects expose:

```sh
npm run export:schedules
npm run start:scheduler
```

`start:scheduler` uses the process-local `DefaultSchedulerProvider`. Do not
run it in every business-service replica. A replicated production scheduler
host requires a shared EventBridge, a provider with durable distributed claims,
strict scheduler startup, and downstream idempotency based on
`message.schedule.occurrenceId`.

It also does not make two `DefaultEventBridge` processes communicate. For a
separately started local scheduler and application, choose one shared transport
before running `start:scheduler`.

Create an event-only schedule declaration in a generated project with:

```sh
npm run add:schedule -- daily-close \
  --description "Emit the daily closing trigger" \
  --service billing --service-version 1 \
  --event billing.daily_close_due --cron "0 2 * * *"
```

The generated declaration has no business handler. A regular subscription,
queue worker, or agent consumes the emitted event; the scheduler host only owns
the clock and event publication.

Durable claims and provider-specific delivery remain explicit provider integrations.
The Kubernetes CronJob export is manifest generation only: Kubernetes owns the clock, and the generated trigger calls a PURISTA application boundary for an event, queue, or short command target.
Generated projects require `--trigger-image` plus `--trigger-url` or `--trigger-command` when running the Kubernetes export script.

Generated agent guidance keeps AI runtime wiring in application bootstrap/config. Attached agents bind `ai.models` and, when needed, `ai.skills`, `ai.sandbox`, `ai.runtime`, and `ai.workspaceStore`; skill-backed agents declare `.useSkills(...)` in code and bind directories through runtime `ai.skills` options. Agents are ephemeral by default. A generated project can opt into a resumable workflow with `npm run add:agent -- <name> --service <service> --service-version 1 --durable-workspace`; that template declares `setHarnessWorkflow(...)` and `setWorkspacePolicy({ mode: 'durable', required: true, cleanup: 'on_terminal' })`. Direct harness agents and custom run functions cannot use durable workspace replay.

Generated applications link both the normal `purista` skill and the focused
`purista-migration` skill from `@purista/core`. Use the migration skill only
for an existing-project upgrade: it records the package and lockfile baseline,
definitions, checks, rollout order, and rollback trigger rather than treating a
release migration as ordinary feature work.

---

- Official Website: **[purista.dev](https://purista.dev)**
- Follow on Twitter **[@purista_js](https://twitter.com/purista_js)**
- Join the **[Discord Chat](https://discord.gg/9feaUm3H2v)**

<a href="https://www.producthunt.com/posts/purista?utm_source=badge-featured&utm_medium=badge&utm_souce=badge-purista" target="_blank"><img src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=386519&theme=light" alt="PURISTA - Typescript&#0032;framework&#0032;for&#0032;IoT&#0044;&#0032;microservices&#0044;&#0032;and&#0032;serverless | Product Hunt" style="width: 250px; height: 54px;" width="250" height="54" /></a>

---
