---
label: Guidance
order: "1"
layout: partial.hbs

---
In-page notifications are used to contextually inform users of important information or status of an interaction.

## Using in-page notifications

Use in-page notifications to attract the user's attention. Notifications are often displayed following a user interaction or system event. The level of attention is dependent on the importance of the notification. Notification types are:

**Information notification**

Designed to be less intrusive or interruptive than other levels of notification:

* use for information the user should know, but is not critical
* use for tips or information which the user can benefit from
* use for messages which don't require too much attention or action
* don't use in response to a user action.

**Success notification**

* use to inform the user that an action was performed successfully (e.g. submitting a form or registering an account).

**Warning notification**

* use to warn the user of a possible negative outcome (e.g. password expiry)
* provide sufficient information to avoid the problem
* use for an action that is out of the ordinary or might not be desired.

**Critical notification**

* use where a system event has failed
* use when the user has made an error
* use where the user is blocked until the issue is resolved, or the issue needs resolving immediately
* provide sufficient information on the issue and resolution to fix the issue
* don't use for validation or validation summary.

Do:

* use clear, concise easy to understand language, to minimise cognitive load
* display the notifications in context and at an appropriate time
* avoid using multiple notifications on a single screen (if multiple are required, display them by importance; critical, warning, success then information).
* use the appropriate notification for the task at hand.

Do not:

* overuse notifications as this will erode their effectiveness
* use for global alerts which are required on all pages.

### How this component works

The family of notifications is designed with a consistent layout to aid comprehension of what they are and how they work.

They are designed to look 'not always present', to draw the user's attention.

The type and urgency of the notification is conveyed through colour and the icon used.

The icons used are industry standard, with the exception of the warning and critical icons which are somewhat interchangeable. Both the warning and critical icons are perceived as more important to aid the user's comprehension.

The notifications are not dismissible.

## Accessibility

All components are responsive and meet WCAG 2.1 AA accessibility guidelines.