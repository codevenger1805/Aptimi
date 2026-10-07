# APTIMI — DESIGN HANDOFF FOR CODING AGENT

## 0. PURPOSE

This document is the visual implementation specification for APTIMI.

The attached/exported Figma screens are the PRIMARY visual references.

Do not treat them as isolated page designs.

Use them to infer and extend a consistent APTIMI design system across the entire application.

The goal is to reproduce the visual character, hierarchy, spacing, color, imagery, density and interaction patterns shown in the representative screens while implementing the complete functional APTIMI product.

---

# 1. VISUAL SOURCE OF TRUTH

The coding agent will receive representative screen references for:

1. App Shell
2. Dashboard
3. Onboarding
4. Career Assessment
5. Career Readiness
6. Career Roadmap
7. Milestone Detail
8. Internship Tracker
9. Focus Mode
10. JD Analysis

IMPORTANT:

These are REPRESENTATIVE screens.

They are NOT the complete list of application screens.

The coding agent must extend their visual language to:

- Analytics
- Planner
- Personal To-Do
- Notes
- Whiteboard
- AI Career Assistant
- Notifications
- Settings
- Additional roadmap states
- Additional internship states
- Empty states
- Loading states
- Error states
- Completion states

Do not invent a new design language for these screens.

---

# 2. PRODUCT DESIGN CHARACTER

APTIMIT should feel:

- modern
- aesthetic
- colorful
- Gen-Z
- editorial
- premium
- human
- career-focused
- visually intentional

APTIMIT should NOT feel like:

- generic SaaS
- Jira
- Trello
- Notion clone
- corporate HR software
- generic analytics dashboard
- generic AI dashboard
- productivity-template software

Gen-Z does NOT mean childish.

Do not use excessive:
- emojis
- stickers
- cartoon UI
- neon
- gaming aesthetics

Gen-Z character should come from:

- confident typography
- strong color
- contemporary imagery
- asymmetric composition
- subtle playfulness
- visual storytelling
- good spacing

---

# 3. CORE COLOR SYSTEM

## Primary

Primary:
`#3D405B`

Primary hover / pressed:
`#2D2F44`

Use primary for:
- main CTA
- active navigation
- selected tabs
- important controls

Do NOT use primary everywhere.

## Accent

Burnt Peach:
`#E07A5F`

Use for:
- milestones
- streaks
- priority
- visual accents
- important secondary emphasis

Do NOT turn it into the primary CTA color.

## Supporting colors

Success:
`#81B29A`

Warning:
`#F2CC8F`

Info:
`#2563EB`

Danger:
`#DC2626`

## Light UI

Canvas:
`#F8F9FA`

Surface:
`#F1F3F5`

Border:
`#E5E7EB`

Muted:
`#9CA3AF`

Secondary text:
`#4B5563`

Primary text:
`#111827`

---

# 4. DARK FOCUS MODE

Focus Mode is intentionally different.

It uses a dark, atmospheric visual environment.

Background direction:

`#111318`
`#16181D`
`#1C1F26`

Primary text:
`#F8F9FA`

Secondary text:
`#9CA3AF`

Continue using APTIMI accent colors:

`#3D405B`
`#E07A5F`
`#81B29A`
`#F2CC8F`
`#2563EB`

Focus Mode may use subtle dark glassmorphism:

- translucent dark surfaces
- subtle blur
- restrained borders
- depth
- atmospheric visual elements

Do NOT apply dark glassmorphism to the entire application.

Do NOT use:
- neon
- cyberpunk
- purple AI gradients
- excessive glow
- glowing borders

---

# 5. TYPOGRAPHY

Primary font:

Inter

Fallback:

-apple-system,
BlinkMacSystemFont,
"Segoe UI",
sans-serif

Base hierarchy:

H1:
32px / 40px / 600

H2:
24px / 32px / 600

H3:
18px / 24px / 500

Body:
14px / 20px / 400

Caption:
12px / 16px / 500

Use larger display typography where the representative design clearly requires it.

Typography should establish hierarchy.

Do not use cards and borders to compensate for weak typography.

---

# 6. GENERAL LAYOUT PRINCIPLES

Primary reference viewport:

1728 × 1117

Reference device:

16-inch MacBook Pro.

This is a DESIGN REFERENCE, not a hardcoded application width.

The application must remain responsive.

General principles:

- generous spacing
- strong hierarchy
- meaningful whitespace
- visual rhythm
- content-driven density
- asymmetric composition when appropriate
- no unnecessary UI

IMPORTANT:

Whitespace is allowed.

Do NOT compress content merely to fill available space.

Prefer:

FEWER ELEMENTS
+
LARGER MEANINGFUL CONTENT
+
BETTER TYPOGRAPHY
+
BETTER IMAGERY

over:

MANY TINY UI ELEMENTS.

Different features intentionally have different densities.

---

# 7. CARD PHILOSOPHY

Do NOT make everything a card.

Avoid:

- cards inside cards
- card grids everywhere
- giant rounded containers
- excessive shadows
- excessive border boxes
- excessive pills

Cards should exist because the content benefits from separation.

Examples:

Dashboard feature card
Roadmap phase
Milestone
Internship opportunity
Learning resource
Sticky note
Notification

These components can have different visual treatments.

Do NOT force them into one universal card component.

---

# 8. IMAGERY SYSTEM

Imagery is an important part of APTIMI.

Use images when they strengthen the content.

Do NOT treat imagery as decoration added after the UI is complete.

Images should be relevant to the feature.

Examples:

Onboarding:
career / student / future-oriented visual

Roadmap:
different visual identity for each career phase

Milestone:
learning / product / analytical visual

Internship Tracker:
company logos and occasional opportunity visuals

Focus Mode:
abstract atmospheric visual

JD Analysis:
career / analysis / product visual

Rules:

- do not reuse the same image everywhere
- do not use generic corporate stock photography
- do not create giant image placeholders
- do not let imagery overpower the actual functionality
- preserve image aspect ratios
- use explicit image dimensions
- lazy-load non-critical imagery
- provide meaningful alt text

When a representative Figma screen contains an image, treat its placement, scale and role as part of the visual reference.

---

# 9. APP SHELL

Maintain the established APTIMI shell.

The shell should include:

- compact top header
- workspace context
- command/search access
- streak
- notifications
- profile/avatar
- primary navigation

Do not introduce a traditional bulky permanent sidebar if the representative App Shell does not use one.

The shell must remain consistent across normal application screens.

Focus Mode intentionally simplifies/hides the normal shell.

---

# 10. DASHBOARD

Dashboard is the student's feature-discovery home.

IMPORTANT:

The dashboard must be useful with ZERO user data.

Do NOT create an empty dashboard with blank analytics cards.

Permanent feature destinations:

- Set Your Career Goal
- Build Your Career Roadmap
- Assess Your Skills
- Track Internships
- Focus Mode
- Career Readiness
- Notes & Evidence
- AI Career Assistant

Cards must be:

- small to medium
- compact
- visually interesting
- image-supported where appropriate
- easy to scan

Multiple cards should be visible simultaneously.

Do NOT create huge feature tiles.

Do NOT make one feature occupy half the viewport.

Use visual variety rather than oversized cards.

---

# 11. ONBOARDING

Onboarding is NOT authentication.

It is guided career setup.

Collect:

- target career
- education
- degree/field
- current year/status
- experience
- target timeline
- weekly availability
- career preferences
- learning/work style
- current skills
- optional JD

Use a guided multi-step experience.

The screen should explain:

- what information is being requested
- why it matters
- how far the student has progressed
- what happens next

Do not make it feel like a personality test.

Do not make it feel like signup.

---

# 12. CAREER ASSESSMENT

Assessment is practical and career-specific.

For Product Management, representative skills include:

- Product Thinking
- User Research
- Communication
- Analytics
- SQL
- Leadership
- Problem Solving

Each skill supports:

- level 1–5
- confidence
- optional evidence/example
- target level

Unknown is NOT automatically zero.

Do not make the assessment feel like an academic exam.

---

# 13. CAREER READINESS

Career Readiness is a destination screen.

The readiness score should be a major visual centerpiece.

Do NOT create a generic analytics dashboard.

The visual structure should communicate:

WHERE AM I?
↓
WHY AM I HERE?
↓
WHAT SHOULD I IMPROVE?
↓
WHAT SHOULD I DO NEXT?

Use a large central readiness score.

Surround/support it with readiness dimensions:

- Skill Capability
- Practical Readiness
- Execution Consistency
- Communication
- Analytical Ability
- Interview Readiness
- Career Materials
- Target Role Alignment

Use strong color and visual composition.

DO NOT include a separate Evidence section on this screen.

---

# 14. ROADMAP

The roadmap is a PERSONAL CAREER JOURNEY.

It is NOT a traditional project-management timeline.

Avoid:

- rigid vertical timeline
- repetitive horizontal cards
- Jira-style checklist layout
- tiny metadata
- giant task lists

Use:

- large phase typography
- meaningful imagery
- colorful phase identity
- asymmetric/editorial composition
- current-position emphasis
- generous spacing

Product Management example:

01 — PM Foundations

02 — Product Discovery

03 — Product Analytics

04 — Product Evidence

05 — Internship Readiness

The roadmap overview should communicate the journey.

Detailed actions belong inside the milestone view.

---

# 15. MILESTONE DETAIL

Milestone Detail is where the student executes.

It should contain:

- milestone title
- objective
- learning resources
- meaningful actions
- work/submission area
- reflection
- due date
- difficulty
- prerequisites
- completion action

Do NOT make it another dashboard.

Use meaningful learning imagery.

The page should feel like:

"I am completing this part of my career journey."

---

# 16. INTERNSHIP TRACKER

Use a horizontal application board.

Statuses:

SAVED
APPLIED
ASSESSMENT
INTERVIEW
OFFER
REJECTED

The board should resemble the structure of the provided internship-board reference.

Important:

- horizontal columns
- compact opportunity cards
- multiple opportunities visible
- generous whitespace
- easy scanning

Cards should contain:

- company visual/logo
- role
- company
- location/remote
- application date
- one important next action

Do NOT turn it into:

- CRM
- Trello clone
- giant dashboard
- KPI board

Use color and company visuals to make it more aesthetic.

---

# 17. FOCUS MODE

Focus Mode is a separate visual environment.

It should feel:

- dark
- minimal
- immersive
- aesthetic
- atmospheric
- premium

Main visual:

Large focus timer.

Above it:

Current phase
Current task
Timer title

Example:

PRODUCT ANALYTICS

Understand Product Metrics

25:00

Include:

- Start/Pause
- Reset
- current streak
- weekly focus days
- small session context
- sticky notes
- quick scratchpad

Sticky notes should be small and colorful.

Example:

"Check activation metric example"

"Review SQL funnel query"

"Ask: what would the user actually do?"

Use the uploaded dark/glass visual reference as mood inspiration.

Do not copy it literally.

---

# 18. JD ANALYSIS

JD Analysis is a career intelligence workspace.

Use split layout:

LEFT:
Job Description

RIGHT:
Analysis

Analysis should communicate:

- match
- strong matches
- development gaps
- evidence gaps
- recommended actions

Example:

78%
Strong Match

Then:

Strong Matches
Product Thinking
Communication
Research

Development Gaps
SQL
Product Analytics

Evidence Gaps
Product Case Study
Product Metrics Project

Include:

"Add to My Roadmap"

JD Analysis should connect directly to the roadmap.

---

# 19. FEATURES NOT REPRESENTED IN FIGMA

For screens without dedicated Figma designs:

DO NOT invent a new design language.

Instead infer from the nearest representative screen.

Analytics:
derive from Dashboard + Career Readiness.

Planner:
derive from Dashboard + Milestone + Internship Tracker.

Notes:
derive from Milestone + Sticky Notes.

Whiteboard:
retain APTIMI visual language but allow a flexible canvas.

AI Assistant:
derive from JD Analysis + Focus Mode.
Use a floating/contextual assistant rather than turning the entire app into an AI chat interface.

Notifications:
derive from App Shell.

Settings:
derive from App Shell and existing form components.

Personal To-Do:
derive from Internship Tracker and Planner.

---

# 20. STATES

Every major feature must support:

- loading
- empty
- error
- success
- completed

Empty state:

- relevant visual
- concise copy
- clear CTA

Loading:

Use skeletons that match the actual component geometry.

Error:

Use actionable recovery.

Do not use generic blank placeholder screens.

---

# 21. ACCESSIBILITY

Implement:

- semantic HTML
- keyboard navigation
- visible focus states
- accessible labels
- accessible icon buttons
- proper form labels
- sufficient contrast
- aria-live where appropriate
- reduced motion support

Focus ring:

2px #3D405B
2px offset

Do not rely solely on color.

---

# 22. RESPONSIVENESS

The Figma designs use 1728 × 1117 as the primary reference.

Do NOT hardcode that size.

The implementation must adapt to:

- desktop
- laptop
- tablet
- mobile

Preserve hierarchy and intent rather than mechanically shrinking desktop layouts.

---

# 23. ANTI-SLOP RULES

ABSOLUTELY AVOID:

- purple/blue AI gradients
- neon
- glowing edges
- glassmorphism everywhere
- giant rounded containers
- card spam
- cards inside cards
- generic KPI dashboards
- giant hero sections
- huge empty image placeholders
- repetitive identical cards
- excessive pills
- tiny metadata overload
- childish Gen-Z decoration
- generic stock imagery
- random decorative shapes
- unnecessary animation
- fake statistics
- invented content

If unsure, simplify.

---

# 24. IMAGE IMPLEMENTATION

When implementing image-based designs:

- use real assets when provided
- preserve their intended role
- do not substitute arbitrary stock images
- do not stretch images
- maintain aspect ratio
- provide width/height
- lazy-load non-critical images
- provide alt text
- use appropriate object-fit behavior

If an exact image is unavailable, choose an appropriate visual asset with the SAME CONTENT ROLE and visual character.

---

# 25. DESIGN EXTENSION RULE

The coding agent MUST NOT simply reproduce the Figma screenshots as isolated static pages.

It must build a coherent reusable design system.

Create reusable primitives for:

- buttons
- inputs
- tabs
- navigation
- status indicators
- feature cards
- opportunity cards
- milestone components
- progress components
- empty states
- loading states
- notifications
- sticky notes
- image treatments

However:

Do not force all components into one visual shape.

Reuse DESIGN TOKENS and BEHAVIOR, not identical layouts everywhere.

---

# 26. FUNCTIONAL + VISUAL PRIORITY

The final implementation must be BOTH:

FUNCTIONAL
and
VISUALLY FAITHFUL.

Do not sacrifice functionality to create screenshots.

Do not sacrifice the visual language by generating generic UI.

The representative Figma screens define:

- hierarchy
- composition
- color
- typography
- spacing
- imagery
- density
- visual personality

The product specification defines:

- behavior
- data
- workflows
- persistence
- business logic
- feature requirements

Both sources must be implemented together.

---

# 27. FINAL QUALITY BAR

Before considering a screen complete, ask:

1. Does it look like APTIMI?
2. Does it visually relate to the representative Figma screens?
3. Is the hierarchy obvious?
4. Is the screen using the appropriate density?
5. Is color being used intentionally?
6. Is imagery meaningful?
7. Is whitespace intentional?
8. Is the screen avoiding generic SaaS patterns?
9. Is the feature actually functional?
10. Does the screen feel designed rather than generated?

If the answer to any of these is NO, refine the implementation.

---

# 28. IMPLEMENTATION INSTRUCTION

The coding agent should:

1. Read the complete APTIMI product specification.
2. Read this design handoff.
3. Inspect every supplied Figma screenshot/reference.
4. Identify the shared design tokens.
5. Identify reusable components.
6. Identify feature-specific visual patterns.
7. Build the application functionality.
8. Implement the representative screens as closely as practical.
9. Extend the same visual system to all remaining screens.
10. Test the complete user journey.
11. Fix functional and visual inconsistencies.
12. Do not stop after reproducing only the reference screens.

The final result must feel like ONE coherent product.

Not ten separately designed pages.