# Behavior Chart App — Notes & Requirements

Raw idea + reference material, captured in one place.

## Core concept
- A digital behavior chart for a student, shared between multiple teachers who work with that student (so they're all logging to the same record, not separate ones).
- Parents get view-only access — they can look throughout the day but not edit.
- Built for kids who need behavior support (e.g. behavior intervention plans).

## Home experience
- A teacher's home page lists all of her students.
- Click into a specific child to view/edit their chart.
- Parents only ever get the viewer version — no edit controls.

## Chart structure (informed by paper/TPT reference charts — see reference/ folder)
Reference charts (paper behavior charts from Teachers Pay Teachers, incl. "Student's Daily Behavior Chart" by Kelly Marini) use a grid:
- Rows = time blocks / subjects across the day (e.g. Morning Work, Morning Meeting, Math, Reading, Writing, Science/Social Studies, Recess, Lunch).
- Columns = behavior/skill categories being tracked (e.g. Listen to Teacher, Quiet Worker, Raise Hand, Stay in Seat, Finish Work).
- One rating per row x column cell.
- Categories should be customizable per kid — some kids might track "work completion" vs. "behavior" as the two categories, others might want a finer breakdown. This matches the "customizable per kid" note below.
- Some reference versions use a color-coded clip-chart style (green/yellow/blue/red zones) as a weekly view instead of a period-by-period grid — worth deciding whether to support one interaction model or both.
- A notes column per period/row for free-text teacher comments shows up in some reference charts too.

## Rating scale
- Three-point rating system: sad / neutral / happy face (or thumbs down / neutral / thumbs up) per the reference charts and original idea.

## Recording behavior
- Pings/reminders to prompt the teacher to record behavior for specific time blocks throughout the day (matches the period-based grid — a ping per row/period).

## Reports & goals
- Monthly reports generated from tracked data (trends over time).
- Set goals for kids — reference charts define reward thresholds (e.g. 20-24 smileys in a day = sticker/coloring sheet, 25-30 = 10 minutes free time). Goals should likely be customizable per kid, similar to categories.

## Parent engagement
- Daily notification to parents encouraging them to check the chart, to keep them involved.
- Possible chat feature between teacher and parent (nice-to-have, not core).

## Inspiration
- Look at the Class Dojo app for UX ideas (points/rewards, parent communication, etc.).

## Open questions to resolve before building
- Grid-per-period vs. clip-chart-per-day as the core interaction model (or support both, configurable per kid).
- Exact set of default categories, and how a teacher customizes them per kid.
- Whether goals/rewards are a fixed threshold system (like the paper chart) or teacher-defined per kid.
- Whether the "ping" for recording behavior is a push notification, an in-app banner, or something else.

## Data model (Firestore)

### `users/{uid}`
One doc per account. The doc ID is the Firebase Auth UID.
- `name` (string): display name, e.g. "Ms. Test"
- `role` (string): `"teacher"` or `"parent"`

### `students/{studentId}`
One doc per child.
- `name` (string): the student's name
- `teacherIds` (array of UIDs): teachers who can view and edit this chart
- `parentIds` (array of UIDs): parents who can view (read-only)
- `periods` (array of strings): rows of the grid, e.g. `["Morning Work", "Math", "Recess"]`
- `categories` (array of strings): columns of the grid, e.g. `["Listen to Teacher", "Stay in Seat"]`

### `students/{studentId}/days/{YYYY-MM-DD}`
One doc per student per day (one read loads the whole day's grid).
- `ratings` (map): key is `"<period>__<category>"`, value is `0` (sad), `1` (neutral) or `2` (happy)
- `notes` (map): key is the period, value is the teacher's note for that row
- `updatedBy` (UID) and `updatedAt` (timestamp): who saved last, and when

### Test data
- Teacher test user: `teacher@test.com`
- Parent test user: `parent@test.com`
- Test student: `students/test-student`
