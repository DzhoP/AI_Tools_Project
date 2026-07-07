# Начални промптове за AI агент

Готови промптове за стартиране на нова агент сесия (Claude Code) по проекта. Копирай, попълни частите в `<...>` и постави в нов чат.

> Claude Code чете `CLAUDE.md` автоматично, така че промптовете не повтарят целия контекст — само задачата и правилата за работа.

---

## 1. Обща сесия за разработка (bootstrap)

```
You are continuing development on the AI_Tools project (see CLAUDE.md for
stack, structure and critical Docker sync rules).

Before writing any code:
1. Ask me clarifying questions about scope and edge cases — I make the design
   decisions, you implement them.
2. After EVERY file edit, copy the file into the right container (docker cp) —
   host-to-container sync is broken.
3. Test backend changes with curl against http://localhost:8000/api before
   telling me to test in the browser.

Communicate with me in Bulgarian. Explain technical terms simply — I am a
beginner. My task for this session:

<describe the task here>
```

---

## 2. Нова функционалност

```
Task: add a new feature to AI_Tools — <feature name>.

Requirements:
- <what it should do>
- <who can access it (which roles)>

Follow the existing patterns:
- Backend: controller in app/Http/Controllers/Api, route in routes/api.php
  (owner-only routes go in the middleware('role:owner') group), migration if
  needed, flush the categories cache tag on any tool mutation, record tool
  mutations in the activity log.
- Frontend: typed API methods in lib/api.ts, Bulgarian UI texts, amber palette
  with dark: variants, useToast() for feedback, ConfirmModal for destructive
  actions.

Ask me your clarifying questions first, then propose a short plan, then build.
```

---

## 3. Поправка на бъг

```
Bug report for AI_Tools:

What I did: <steps>
What I expected: <expected behavior>
What happened instead: <error message or wrong behavior — paste exact text>

Debug it systematically:
1. Check whether the container has the current file version (docker sync issue
   is the most common cause — see CLAUDE.md).
2. Test the API layer directly with curl to isolate backend vs frontend.
3. Check docker logs (vibe_nextjs / vibe_app) for the real error.
Explain the root cause to me in Bulgarian in simple terms before fixing it.
```

---

## 4. Отговор за въпросника на академията

```
I need to answer an academy questionnaire question about this project.

Question: <paste the question>

Write the answer in Bulgarian, in my voice — a beginner student who built this
with AI assistance:
- Base it ONLY on things that really happened in this project (check the code
  and git history if unsure) — I must be able to defend every claim orally.
- Conversational tone, no perfect parallel structure, no metaphor-jargon.
- Include one honest admission (a mistake, a limitation, or something left
  imperfect) — that makes it credible.
- Keep it short: 3-5 paragraphs.
```
