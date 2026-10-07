# APTIMI — Career Execution Platform
## Master Product & Engineering Specification

> This document is the single source of truth for APTIMI.
> Do not create competing product specifications.
> Update this document when major product decisions change.

---

# 1. PRODUCT DEFINITION

APTIMI is a Career Execution Platform for students.

Its purpose is not simply to provide a roadmap or productivity dashboard.

APTIMI should answer:

> Given who I am, where I want to go, how much time I have, and what I currently know, what should I do next — and how do I know I am actually becoming ready?

Core loop:

Career Goal
→ Career Profile Assessment
→ Skill Assessment
→ Career Readiness Profile
→ Personalized Roadmap
→ Small Actions
→ Evidence of Completion
→ Reflection
→ Readiness Update
→ Next Recommended Action

The product should feel like a career operating system, not a generic task manager.

---

# 2. PRODUCT PRINCIPLES

## 2.1 Personalization over generic advice

APTIMI must consider:

- target role
- current skill level
- experience
- target timeline
- available weekly time
- career profile
- learning preferences
- work style
- execution patterns
- existing evidence
- optional target job description

A Product Manager roadmap should therefore not be identical for every student.

---

## 2.2 Execution over information

Do not simply tell a student:

> Learn SQL.

Break the journey down:

Learn SQL
→ Understand SELECT
→ Practice filtering
→ Practice aggregation
→ Solve beginner queries
→ Analyze a small dataset
→ Apply SQL to a product question
→ Save the work as evidence

---

## 2.3 Evidence over self-claimed progress

A student marking something complete is not sufficient evidence of capability.

Completed milestones should support:

- completion timestamp
- evidence
- reflection
- notes
- related tasks
- progress history

The system should preserve what the student actually completed.

---

## 2.4 Explainability

Every important recommendation should have an understandable reason.

Example:

> SQL is recommended because your target Product Manager role requires analytics, your current SQL level is beginner, and you currently have no evidence demonstrating SQL application.

Avoid unexplained scores or recommendations.

---

# 3. TECHNOLOGY STACK

Use:

- TypeScript
- React 18
- Vite
- React Router 6
- Zustand
- Dexie / IndexedDB
- Zod
- Vitest
- Testing Library
- CSS custom properties

No Tailwind unless explicitly reconsidered later.

No backend is required for the core MVP.

No paid service should be required.

---

# 4. LOCAL-FIRST ARCHITECTURE

Architecture:

UI
→ Zustand feature stores
→ Repository interfaces
→ Dexie / IndexedDB

Pure domain modules own:

- readiness
- career profile scoring
- roadmap generation
- roadmap ordering
- completion history
- metrics
- streaks
- rewards
- reminders
- job-description analysis
- local AI recommendations

The application must work without:

- authentication
- backend
- external AI
- paid APIs

External AI is an enhancement, never a dependency.

---

# 5. AUTHENTICATION

No authentication for the core MVP.

Generate a local `profileId` UUID on first run.

Data stays on the user's device.

The application must clearly explain this during onboarding.

---

# 6. CAREER GOAL SETUP

The user provides:

- target role
- current education level
- current year/status
- target date OR duration
- available weekly hours
- current experience
- optional job description

Supported role presets:

- Product Manager
- Software Engineer
- Data Analyst
- UX Designer
- Custom Role

Architecture must allow additional roles later.

---

# 7. CAREER PROFILE ASSESSMENT

The current five-skill-only readiness approach is insufficient.

APTIMI must include a structured Career Profile Assessment.

This is NOT a clinical or scientifically validated personality test.

Do not claim to diagnose personality.

The assessment evaluates career-relevant:

- skills
- behaviors
- preferences
- execution patterns
- learning preferences
- work style
- experience
- constraints
- motivation

---

# 8. CAREER PROFILE QUESTIONNAIRE

The questionnaire should be concise enough that students will complete it.

## 8.1 Learning Profile

Assess:

- preferred learning method
- theory vs practical preference
- guided vs independent learning
- comfort with unfamiliar topics
- feedback preference

## 8.2 Execution Profile

Assess:

- consistency
- time availability
- ability to maintain long-term goals
- procrastination tendency
- ability to break large goals into smaller actions
- ability to work independently

## 8.3 Work Style

Assess:

- collaboration preference
- communication confidence
- ambiguity tolerance
- decision-making confidence
- problem-solving approach
- response to feedback

## 8.4 Career Context

Collect:

- previous internships
- projects
- leadership experience
- portfolio evidence
- interview experience
- application experience

## 8.5 Motivation

Assess:

- why the user wants the target role
- what kind of work they enjoy
- what they want from their first role
- biggest current difficulty
- confidence about entering the role

---

# 9. SKILL ASSESSMENT

Skills are role-specific.

For Product Manager, initial skills include:

- Product Thinking
- User Research
- Analytics
- SQL
- Communication
- Leadership
- Prioritization
- Problem Solving

Other roles have their own skill catalogs.

Skill records contain:

- current level
- confidence
- evidence
- last assessed date
- optional target level
- optional weight

Skill scale:

1 — Cannot apply yet
2 — Limited / needs heavy guidance
3 — Can apply with support
4 — Independent in typical internship situations
5 — Can teach or lead at this level

Skipped skills remain unknown.

Unknown does NOT mean zero.

---

# 10. CAREER READINESS PROFILE

Do not represent readiness only as:

> 73%

based on five self-entered skill ratings.

Create a multi-dimensional Career Readiness Profile.

Initial dimensions:

- Skill Capability
- Practical Evidence
- Execution Consistency
- Communication
- Analytical Ability
- Interview Readiness
- Career Materials
- Target Role Alignment

Each dimension contains:

- current state
- evidence
- gaps
- recommendation
- explanation

Example:

### Analytics — Developing

Reason:

- beginner skill rating
- one completed analytics exercise
- no portfolio evidence
- target role requires analytics

Recommendation:

> Complete a product metrics case study.

A summary score may exist as a secondary planning indicator, but it must never be presented as an objective hiring prediction.

---

# 11. READINESS CALCULATION

Readiness is a planning aid.

It is NOT:

- a hiring prediction
- a psychological assessment
- a guarantee of job readiness

If a summary score is shown, it must use explainable inputs.

Possible weighted dimensions:

- skill capability
- practical evidence
- execution
- communication
- role alignment
- interview readiness

If insufficient information exists:

> Not enough information yet

Do not display fake `0%`.

---

# 12. JOB DESCRIPTION ANALYSIS

The user may optionally paste a job description.

APTIMI should identify:

- required skills
- preferred skills
- responsibilities
- experience expectations
- evidence expectations

Compare these requirements against the user's profile.

Output:

## Strong Matches

What the user already demonstrates.

## Development Gaps

Important skills that are weak.

## Evidence Gaps

Skills the user claims but has not demonstrated through actual work.

## Roadmap Adjustments

Recommended milestones based on the opportunity.

This must work at a basic level without an external AI API.

AI may improve the analysis later.

---

# 13. ROADMAP ENGINE

The roadmap is the central feature of APTIMI.

It must NOT be a flat list of tasks.

Hierarchy:

Roadmap
→ Major Phase
→ Milestone
→ Action / Task
→ Evidence / Reflection

---

# 14. ROADMAP STRUCTURE

For a beginner Product Manager, the default roadmap should contain approximately five major phases.

The exact number may adapt slightly to the timeline, but the conceptual progression should remain.

## Phase 1 — Product Management Foundations

Possible milestones:

- Understand the PM role
- Learn the product lifecycle
- Understand users vs customers
- Learn product metrics
- Learn basic product thinking
- Complete a beginner product teardown

## Phase 2 — Product Discovery

Possible milestones:

- Learn user research
- Write interview questions
- Conduct beginner interviews
- Identify recurring problems
- Write problem statements
- Create a user journey
- Learn prioritization
- Write a beginner PRD

## Phase 3 — Product Analytics

Possible milestones:

- Learn product metrics
- Understand funnels
- Understand retention
- Learn experimentation basics
- Learn SQL fundamentals
- Practice beginner SQL
- Analyze a small dataset
- Answer product questions using data

## Phase 4 — Product Evidence

Possible milestones:

- Complete a product teardown
- Complete a research exercise
- Create a product case study
- Build a portfolio case study
- Improve resume
- Improve professional profile

## Phase 5 — Internship Readiness

Possible milestones:

- Practice product sense questions
- Practice analytical questions
- Practice behavioral questions
- Conduct mock interviews
- Prepare application materials
- Submit targeted applications
- Track applications
- Review interview feedback

These are starting templates, not immutable roadmaps.

---

# 15. BEGINNER-FIRST ROADMAP GENERATION

If the user is a beginner, never assume professional knowledge.

Bad:

> Conduct user research.

Better progression:

1. Learn what user research is.
2. Read/watch a beginner explanation.
3. Write five interview questions.
4. Conduct one interview.
5. Conduct two additional interviews.
6. Record recurring problems.
7. Write a problem statement.
8. Turn findings into a product insight.
9. Save the result as evidence.

Every major milestone should have meaningful smaller actions.

---

# 16. ROADMAP PERSONALIZATION

Roadmap generation considers:

- target role
- current skills
- skill gaps
- career profile
- experience
- target date
- duration
- weekly hours
- optional job description

The roadmap should become harder progressively.

Do not give an advanced student the exact same sequence as a complete beginner.

---

# 17. TIMELINE DISTRIBUTION

The user provides a target date or duration.

The roadmap must distribute phases and milestones across the available time.

Do NOT hardcode six months.

Example for six months:

Phase 1 → Month 1
Phase 2 → Month 2
Phase 3 → Month 3
Phase 4 → Months 4–5
Phase 5 → Month 6

Shorter timelines should compress intelligently.

Longer timelines may provide more practice/evidence depth.

Prerequisites should influence ordering.

---

# 18. ROADMAP REGENERATION

Initial roadmap generation happens after onboarding/assessment.

Regeneration happens only after explicit user action.

Never silently replace the entire roadmap.

When regeneration occurs:

- preserve completed milestones
- preserve completion history
- preserve evidence
- preserve reflections
- preserve custom items
- explain major changes

Show a preview/diff before destructive changes.

---

# 19. ROADMAP EDITING

Generated roadmap items should not be freely deleted.

Allowed:

- edit title
- edit description
- edit target date
- edit task
- add notes
- add evidence
- add reflection
- mark in progress
- mark complete

Avoid primary actions:

- Remove milestone
- Delete milestone
- Reopen completed milestone

If the generated milestone is inappropriate, the user edits it.

Completed career work remains part of career history.

---

# 20. COMPLETION MODEL

Milestones/tasks support:

- Not Started
- In Progress
- Completed

When completed, store:

- completedAt
- completion history
- evidence
- reflection
- notes

Example:

### Milestone

Conduct 3 user interviews

### Completion

Completed: 18 Oct 2026

### Evidence

Interviewed three engineering students.

### Reflection

Most students struggled to identify which skills to prioritize.

This evidence can contribute to the Career Readiness Profile.

---

# 21. COMPLETION HISTORY

APTIMI must preserve meaningful progress history.

Track events such as:

- task started
- task completed
- milestone completed
- evidence added
- reflection added
- readiness assessment changed
- roadmap changed

The user should be able to answer:

> What have I actually done?

This history must survive roadmap regeneration.

---

# 22. NOTES

Notes are contextual, not merely a standalone Notes page.

A note may belong to:

- roadmap
- phase
- milestone
- task
- career assessment
- internship
- personal to-do
- general workspace

Note fields:

- title
- content
- createdAt
- updatedAt
- optional color
- optional position
- optional linked entity

Autosave should show:

- Saving
- Saved
- Unsaved

---

# 23. STICKY NOTES

Support lightweight sticky notes.

Example:

Milestone:

> Learn Product Metrics

Sticky note:

> Need to understand DAU vs MAU before Friday.

Sticky notes remain connected to the milestone.

They should not become a completely separate productivity system.

---

# 24. WHITEBOARD

Whiteboard remains a flexible workspace.

Support:

- text
- sticky notes
- rectangles
- circles
- movement
- resizing
- selection
- deletion

Objects may optionally link to roadmap items.

Keyboard interaction must remain possible.

Do not turn the feature into a full Notion/Miro replacement.

---

# 25. WEEKLY PLANNER

The planner displays roadmap tasks separately from personal to-dos.

Roadmap task:

> Complete three user interviews.

Personal to-do:

> Email professor.

Personal to-dos must never contaminate roadmap completion metrics.

---

# 26. FOCUS MODE

Focus Mode supports:

- Pomodoro
- adjustable duration
- start
- pause
- resume
- reset
- completed session history
- current streak
- longest streak
- total focus hours
- sessions completed
- today's status

At least one completed focus session on a local calendar day counts as one focus day.

Multiple sessions on one day count as one streak day.

Abandoned/reset sessions do not count.

---

# 27. INTERNSHIP TRACKER

Statuses:

- Saved
- Applied
- Assessment
- Interview
- Offer
- Rejected
- Withdrawn

Track status history.

Applications count only once they leave Saved.

Interview rate must use historical status events rather than only current status.

---

# 28. ANALYTICS DASHBOARD

Dashboard metrics may include:

- Career Readiness Profile
- roadmap progress
- milestones completed
- weekly tasks
- focus hours
- focus sessions
- streak
- applications
- interview rate
- upcoming work
- next useful action

Never fabricate metrics.

Empty states should explain what is missing.

---

# 29. NEXT ACTION ENGINE

APTIMI should always try to answer:

> What should I do next?

Priority may consider:

1. incomplete onboarding
2. overdue roadmap task
3. current milestone
4. due reminder
5. important career gap
6. target-job requirement
7. upcoming interview
8. next roadmap action

The recommendation should explain why.

---

# 30. AI CAREER ASSISTANT

The AI assistant should be contextual.

It understands, where available:

- target role
- current roadmap phase
- current milestone
- unfinished tasks
- skill gaps
- career profile
- available time
- job description
- internship state
- completion history

Example questions:

> What should I work on today?

> Why is this milestone important?

> I only have 30 minutes. What should I do?

> Explain this concept.

> What should I add to my portfolio?

> Am I ready to apply?

> Why is my readiness profile weak?

> Help me prepare for this interview.

> What should I do after completing this milestone?

---

# 31. AI WITHOUT AN API KEY

The AI assistant must NOT make APTIMI unusable without an API key.

Architecture:

UI
→ Assistant Service
→ Provider Adapter

Providers:

1. Local Assistant Provider
2. Optional External AI Provider

The Local Assistant must work without external services.

It can use:

- roadmap state
- skill gaps
- career profile
- current milestone
- available time
- deterministic recommendation rules

Example:

If:

- current phase = Product Discovery
- next milestone = User Interviews
- available time = 60 minutes

The local assistant can recommend:

1. Review interview basics — 10 min
2. Write five questions — 15 min
3. Conduct one interview — 25 min
4. Record findings — 10 min

---

# 32. AI PROVIDER ADAPTER

Create an interface similar to:

`AssistantProvider`

Potential methods:

- answerQuestion()
- explainMilestone()
- recommendNextAction()
- analyzeJobDescription()
- generateReflectionPrompts()

Implement:

`LocalAssistantProvider`

Optional:

`OpenAICompatibleProvider`

The UI must not depend directly on a provider.

If external AI fails:

- preserve user input
- show useful error
- fall back to local assistant where possible

Never expose API keys in source code.

Never bundle an API key.

---

# 33. AI CONTEXT PRIVACY

Never automatically send the entire database to an AI provider.

Before an external AI request:

- show relevant context
- clearly indicate it is being sent
- allow sensitive notes to remain local
- only send required context

AI output must be labeled as AI-generated.

Do not claim hiring predictions.

---

# 34. AI USAGE LIMITS

External AI should support:

- request count
- local daily limit
- response size limit
- friendly quota errors
- cached identical explanations where useful

The core app must remain fully usable when the limit is reached.

---

# 35. PERSONAL TO-DO

Personal to-dos are separate from roadmap tasks.

Fields:

- title
- description
- due date/time
- priority
- completion
- optional roadmap link

They may be linked to career work but remain separate entities.

---

# 36. NOTIFICATIONS

Support:

- in-app notifications
- optional browser notifications
- reminders

Browser notification permission must only be requested after explicit user action.

If browser notifications are unavailable:

- in-app notifications remain functional
- do not claim guaranteed background delivery

---

# 37. GAMIFICATION

Keep gamification lightweight.

Support:

- streak
- points
- levels

Do NOT add:

- leaderboards
- social competition
- excessive badges
- meaningless animations

Career progress remains more important than game mechanics.

---

# 38. POINTS

Suggested values:

- roadmap task complete: 10
- milestone complete: 25
- valid focus session: 5
- personal to-do complete: 2

Use an idempotency key.

Uncompleting something must create a visible adjustment rather than silently deleting history.

Level:

`floor(totalPoints / 100) + 1`

---

# 39. DATA MODELS

Core entities:

- Profile
- CareerAssessment
- CareerAssessmentResponse
- CareerReadinessProfile
- Skill
- Roadmap
- RoadmapPhase
- Milestone
- RoadmapTask
- CompletionRecord
- Evidence
- Reflection
- Note
- Whiteboard
- WhiteboardObject
- Opportunity
- OpportunityStatusEvent
- FocusSession
- PersonalTodo
- Reminder
- InAppNotification
- RewardLedgerEntry
- JobDescriptionAnalysis
- AppSettings
- AiUsage

Use stable UUIDs.

Use ISO timestamps.

Associate records with local `profileId` where appropriate.

---

# 40. DATA PERSISTENCE

Use Dexie / IndexedDB.

Repositories isolate persistence from UI.

Export:

- versioned JSON
- all important stores

Import:

- validate with Zod
- preview changes
- require confirmation
- never replace before confirmation
- failed migration must preserve original data

---

# 41. ROUTING

Persistent navigation:

- Dashboard
- Roadmap
- Weekly Planner
- Focus Mode
- Internship Tracker
- Notes / Whiteboard
- To-Do
- Settings

Routes:

`/onboarding`
`/`
`/roadmap`
`/planner`
`/focus`
`/internships`
`/notes`
`/todos`
`/settings`

AI may appear contextually within relevant screens rather than requiring a separate full-screen destination.

---

# 42. FIRST-RUN EXPERIENCE

New user:

1. Welcome
2. Privacy explanation
3. Choose target role
4. Set timeline
5. Set available weekly hours
6. Complete Career Profile Assessment
7. Complete relevant skill assessment
8. Optionally paste job description
9. Generate personalized roadmap
10. Review roadmap
11. Start first milestone

Do not preload fake accomplishments.

---

# 43. SAMPLE DATA

Default first run is empty.

Settings may provide:

> Load Sample Profile

Sample data must:

- require confirmation
- be clearly labeled
- never mix silently with real data
- never affect real metrics without explicit user action

---

# 44. ACCESSIBILITY

Every feature must support:

- semantic HTML
- keyboard navigation
- visible focus states
- accessible labels
- correct heading hierarchy
- icon `aria-label`
- adequate contrast
- no color-only status
- reduced motion
- accessible forms
- accessible errors
- accessible loading states

No:

- `outline: none` without replacement
- div-only click controls
- unlabeled inputs
- inaccessible icon buttons
- preventDefault paste blocking
- user-scalable=no

---

# 45. RESPONSIVE BEHAVIOR

Desktop-first.

Tablet/mobile:

- collapsible navigation
- planner becomes list-first
- no inaccessible horizontal overflow
- touch targets remain usable

The desktop experience is the primary portfolio presentation.

---

# 46. VISUAL DESIGN

Do NOT redesign during the domain/product implementation phase.

Product logic must be correct first.

When visual design begins:

- avoid generic AI-dashboard aesthetics
- avoid purple/blue gradients
- avoid excessive glassmorphism
- avoid glowing borders
- avoid card spam
- avoid nested cards
- avoid giant rounded containers
- avoid tiny pills everywhere
- avoid excessive information density
- prioritize typography and spacing
- use strong section hierarchy
- use visual assets intentionally
- keep the interface human and product-oriented

The visual system will be addressed in a separate design phase after functional behavior stabilizes.

---

# 47. PERFORMANCE

- Code-split routes
- Keep domain functions efficient
- Index Dexie queries appropriately
- Debounce note autosave
- Avoid unnecessary re-renders
- Persist only required data
- Keep whiteboard objects lightweight

---

# 48. TESTING

Vitest tests must cover:

### Roadmap

- role-specific roadmap
- five-phase PM structure
- beginner progression
- timeline scaling
- skill-gap influence
- roadmap ordering
- insertion
- editing
- regeneration preservation

### Completion

- task completion
- milestone completion
- completion timestamps
- evidence
- reflections
- history preservation

### Readiness

- questionnaire scoring
- skill assessment
- evidence weighting
- role alignment
- missing data
- explainability

### Job Description

- requirement extraction
- skill gap identification
- evidence gap identification
- roadmap adjustment

### AI

- local assistant
- contextual recommendation
- external provider adapter
- invalid AI response rejection
- API failure fallback
- no-key behavior

### Other

- streak
- reminders
- rewards
- internship metrics
- export/import
- IndexedDB persistence

Run:

`npm test`

and:

`npm run build`

before considering a phase complete.

---

# 49. IMPLEMENTATION ORDER

Do NOT attempt to redesign the entire application at once.

Implement in this order:

## Phase 1
App shell, tokens, routing

## Phase 2
Database, repositories, migrations, backup

## Phase 3
Career goal + Career Profile Assessment + skill assessment + readiness

## Phase 4
Personalized roadmap engine + milestone/task hierarchy + completion history

## Phase 5
Weekly Planner + Focus Mode + streak

## Phase 6
Internship Tracker + Analytics

## Phase 7
Personal To-Do + Notifications

## Phase 8
Contextual Notes + Sticky Notes + Whiteboard

## Phase 9
Rewards

## Phase 10
Local Career Assistant + optional external AI

## Phase 11
Job Description Analysis + roadmap personalization refinement

## Phase 12
Accessibility, responsive behavior, sample data, QA

Visual redesign happens AFTER functional behavior is stable.

---

# 50. IMPORTANT IMPLEMENTATION RULE

Before changing UI:

1. Update domain types.
2. Update schemas.
3. Update repositories.
4. Implement domain logic.
5. Add tests.
6. Verify persistence.
7. Run tests.
8. Run build.
9. Then update UI.

Do not use visual mockups as a substitute for product logic.

Do not invent functionality that is not specified.

Do not create fake AI output.

Do not create fake metrics.

Do not silently delete user career history.

---

# 51. DEFINITION OF DONE

This specification is considered implemented when:

- A student can create a career goal.
- The student completes a meaningful Career Profile Assessment.
- Relevant skills can be assessed.
- A multi-dimensional readiness profile is produced.
- A beginner Product Manager receives a structured multi-phase roadmap.
- Each phase contains meaningful milestones.
- Each milestone contains actionable beginner tasks.
- Roadmap duration respects the user's timeline.
- Roadmap adapts to skill gaps and career context.
- Milestones can be edited.
- Completed milestones remain visible.
- Completion history is preserved.
- Evidence and reflections can be attached.
- Notes can be attached to roadmap entities.
- Sticky notes can be used contextually.
- The local AI assistant works without an API key.
- External AI can be configured later.
- Job descriptions can influence recommendations.
- Dashboard metrics are calculated from real data.
- Existing functionality remains intact.
- All tests pass.
- The project builds successfully.

---

# 52. EXPLICITLY OUT OF SCOPE

Do not add:

- social feed
- public profiles
- leaderboards
- social competition
- heavy gamification
- Notion-like document editor
- music integrations
- mandatory authentication
- backend synchronization
- fake testimonials
- fake user activity
- fake career predictions
- bundled API keys
- required paid services
- generic AI-generated filler content

---

# 53. FINAL PRODUCT TEST

Before declaring APTIMI complete, test this exact scenario:

A new beginner opens APTIMI.

They select:

Target role:
Product Manager

Timeline:
6 months

They complete the Career Profile Assessment.

They rate their skills.

They optionally paste an APM job description.

APTIMI produces:

1. Career Profile
2. Explainable readiness gaps
3. Five major roadmap phases
4. Beginner-friendly milestones
5. Actionable tasks
6. Timeline allocation
7. Evidence requirements
8. Personalized next action

The student completes a milestone.

APTIMI records:

- completion date
- evidence
- reflection
- notes
- history

The student returns later.

APTIMI can answer:

> What have I accomplished?

> What should I do next?

> What am I weakest at?

> Why am I being asked to learn this?

> What evidence do I have for this skill?

> Am I becoming more aligned with my target role?

That is the intended APTIMI experience.