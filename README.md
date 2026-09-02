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

The wrapper uses the shared PURISTA CLI project generator. It does not accept
a telemetry blueprint option. Configure application-owned metrics providers
and exporters explicitly after creating the project.

Before changing an existing generated application, export its definitions and
use the static architecture commands. They do not contact infrastructure or
load business handlers:

```sh
npm run export:definitions
purista inspect --definitions purista.definitions.json --format json
purista inspect --definitions purista.definitions.json --view agent --scope service:billing/1 --depth 1 --schemas referenced --format json
purista validate --definitions purista.definitions.json --strict --format json
purista doctor --definitions purista.definitions.json --format json
purista diff --base approved.architecture.json --definitions purista.definitions.json --strict --format json
```

For a system deployed from multiple repositories, a deployment repository pins
each local architecture artifact by digest and validates explicit unresolved
edge bindings without fetching repositories or contacting infrastructure:

```sh
purista compose --composition deployment.architecture.json \
  --artifact billing.architecture.json --artifact catalog.architecture.json \
  --strict --format json
```

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

Schedules are not part of the generated application baseline. Export the
definition manifest during build, then deploy a separate Scheduler Runtime with
an application-selected provider and shared EventBridge. Durable claims,
provider-specific delivery, and downstream idempotency with
`message.schedule.occurrenceId` remain explicit application decisions.

The Kubernetes CronJob export is manifest generation only: Kubernetes owns the
clock, and the generated trigger calls a PURISTA application boundary for an
event, queue, or short command target. It requires `--trigger-image` plus
exactly one of `--trigger-url` or `--trigger-command`.

The first generated `add:agent` or `add:workflow` command creates a native,
provider-neutral `@purista/harness` module under `src/harness/<service>`, the
service's composed Harness definition, a standalone test, and one
`ServiceBuilder.mountHarness(...)` publication policy. Later agents and
workflows extend the same definition and policy. Model
providers, Skills, storage, sandbox, admission, queues, and artifact stores stay
in application bootstrap configuration. The generator does not add credentials,
HTTP exposure, tools, Skills, or infrastructure authority implicitly.

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
