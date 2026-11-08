# PRD: Dog Care

**Status:** Draft  
**Working title:** Dog Care (name is not final)  
**Platform:** Browser  
**Stack:** React + Three.js (React Three Fiber)

## Summary

A cozy 3D web game where the player lives with a dog and keeps it well. The fantasy is The Sims, narrowed to dogs: the dog has needs, a mood, and a home, and the player chooses how to care for it. There is no combat and no fail screen that deletes the dog.

## Player

One person on their own computer. They want a short, repeatable care session (about 5–15 minutes), not a management spreadsheet. The first version is English, with icon-first buttons so the actions are obvious.

## Product decisions

| Decision | Choice |
| --- | --- |
| Camera | Orbit around the yard. Click the dog or an action button. No first-person walking in v1. |
| Dogs in v1 | Exactly one dog. More dogs are a later release. |
| Home | One fenced yard with a doghouse, food bowl, water bowl, bed, and a toy. |
| Time | A sped-up day. Needs fall while the tab is open. Closing the tab pauses time. |
| Save | Browser `localStorage` only. No account. |
| Art | Low-poly, bright, readable at a glance. Placeholder meshes are fine until real models exist. |
| Tone | Friendly. The dog can be grumpy or messy. It is never hurt, lost, or taken away. |

## Core loop

1. The player opens the yard and sees the dog and its needs.
2. Needs drop over time. The dog’s pose and a mood icon show what it wants.
3. The player picks an action: feed, water, play, pet, bathe, or send to sleep.
4. The action plays in the 3D scene, the matching need recovers, and the dog reacts.
5. The player can rename the dog, change the coat color, and come back later to the same dog.

Success for a session is a content dog, not a score. A small “happy day” marker appears when every need stays above the comfortable line for a full in-game day.

## Needs

Each need is 0–100. It ticks down on its own. Under 25, the dog shows a clear cue (icon plus animation). At 0 it stays at 0 and keeps asking. Nothing else breaks.

| Need | Drops when | Action | Recovery |
| --- | --- | --- | --- |
| Hunger | Time passes | Feed | Fill the bowl. The dog eats. |
| Thirst | Time passes | Water | Fill the water bowl. The dog drinks. |
| Energy | Awake time | Sleep | Dog goes to the bed and sleeps until energy is high or the player wakes it. |
| Fun | Time without play | Play | Throw a ball in the yard. The dog chases it. |
| Cleanliness | Time, and after play | Bathe | A short wash at the side of the yard. |
| Affection | Time without contact | Pet | The player pets the dog. This is the fastest action. |

Starting values for a new dog are all 70, so the first minute is for looking around, not for emergency care.

Suggested drain while awake, per in-game minute:

| Need | Drain |
| --- | --- |
| Hunger | 4 |
| Thirst | 5 |
| Energy | 3 |
| Fun | 3 |
| Cleanliness | 2 |
| Affection | 2 |

Play also drops cleanliness by 15. Sleep pauses hunger, thirst, fun, and affection drain, and restores energy at 20 per in-game minute. Exact numbers stay in one config file so they can be tuned without rewriting the scene.

## Dog

- **Create:** name (default “Dog”), coat color (6 swatches), and one of three body sizes (small, medium, large). Breed labels can wait.
- **Mood:** derived from the lowest need. Comfortable (all ≥ 50), needy (any 25–49), asking (any < 25).
- **Behavior:** the dog idles, walks a short path in the yard, or runs to the object for the current action. If a need is under 25, it looks at the camera and shows that need’s icon.
- **Presentation:** a simple rig is enough: idle, walk, eat, drink, sleep, play, and a happy reaction. If a rig is not ready, swap the whole pose or play a bob animation.

## World

One yard, viewed from a three-quarter orbit.

- Ground, fence, doghouse, bed, food bowl, water bowl, ball.
- Day and evening light. Evening starts when the in-game clock passes 18:00. This is visual only in v1.
- Click a prop to run its action (bowl → feed or water, ball → play, bed → sleep). The same actions exist as buttons for people who do not discover the props.

## Screen layout

- **3D view:** the full page.
- **Top bar:** dog name, in-game clock, mood icon.
- **Need meters:** six bars, always visible, color shifts when a need is low.
- **Action row:** Feed, Water, Play, Pet, Bathe, Sleep. A button is disabled only while another action is already playing.
- **Dog panel:** rename and coat color. Opened from the name, not always on screen.

No inventory, no shop, and no currency in v1.

## Simulation rules

- One action at a time. It lasts 2–6 seconds of real time, then the need jumps.
- Needs update on a fixed tick (4 real seconds = 1 in-game minute) so the page does not depend on frame rate.
- `localStorage` saves the dog, needs, clock, and coat whenever an action finishes and when the tab hides.
- Corrupt or missing save data starts a new dog. The old blob is ignored.

## Tech

| Piece | Choice |
| --- | --- |
| App | Vite, React, TypeScript |
| 3D | Three.js through `@react-three/fiber` and `@react-three/drei` |
| State | A small store (Zustand) holding the dog, needs, clock, and current action |
| Persistence | `localStorage` |
| Deploy | Static build, GitHub Pages when the repo exists |

React Three Fiber is the choice because the needs UI is ordinary React and the yard is a Three.js scene in the same tree. A plain Three.js canvas without React would split UI and scene into two worlds for no gain in v1.

Out of this document: accounts, multiplayer, mobile wrappers, and a custom engine.

## v1 scope

Ships when a new player can:

1. Create a dog and see it in the yard.
2. Watch needs fall and the mood change.
3. Use all six actions and see the dog respond in the scene.
4. Reload the page and find the same dog and needs.
5. Finish one in-game day with the happy-day marker if they kept up.

Explicitly not in v1:

- More than one dog, breeding, or aging
- Walks outside the yard, tricks, training, or minigames beyond the ball
- Vet, illness, items, money, or decorating
- Sound beyond an optional mute-ready hook
- Accounts, cloud save, or sharing

## Later

1. Two or three dogs in the same yard, each with its own needs.
2. A short neighborhood walk on a path.
3. Toys and food types that change how fast fun or hunger returns.
4. Coat and accessory packs, still cosmetic.
5. Cloud save, only after the local loop feels good.

## Risks

- **Scope:** Sims-like games sprawl. v1 stays one dog, one yard, six actions.
- **Models:** a blocked art pipeline must not block the sim. Primitive meshes and flat colors are an acceptable v1 look.
- **Performance:** one animated dog and a small yard should stay smooth in a laptop browser. No physics engine in v1. The ball toss is a scripted arc.
- **Needs feel:** if drains are too fast, care becomes a chore. Tune the config after one full day of play before adding content.

## Open questions

- Final name.
- Whether evening should make the dog sleepy on its own, or sleep stays a player choice.
- Whether the first art pass is original low-poly or a CC0 pack.
