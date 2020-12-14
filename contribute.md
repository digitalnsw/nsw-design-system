Contributing to the NSW Design System
======================

Thank you for your interest in contributing to the design system components, we really appreciate it.

There are many ways to contribute – reporting bugs, fixing bugs, new patterns/components suggestions, submitting pull requests for enhancements to modules or even writing documentation.

Wherever you are, and whatever your discipline is, you are invited to contribute.

## Contents

* [Contributing a new component](#contributing-a-new-component)
  * [Suggested components](#suggested-components)
    * [Useful](#useful)
    * [Unique](#unique)
    * [Distinctly New South Wales](#distinctly-new-south-wales)
  * [Before publication](#before-publication)
    * [Usable](#usable)
    * [Consistent](#consistent)
    * [Versatile](#versatile)
    * [Coded](#coded)
    * [Tested](#tested)
    * [Considered](#considered)
* [Reporting Bugs, Sending Suggestions](#reporting-bugs-asking-questions-sending-suggestions)


-------------------------------------------------------------------------------------------------


## Contributing a new component

The NSW Design System was created for you as a toolkit of style, patterns, standards and guidance for everyone creating distinctly NSW digital products and services. We are the caretakers and publishers of the design system. To help us with the up keep we need a few things from newly proposed component contributions. One of our goals is to ensure a welcoming environment for all contributors to our projects. If you’re unsure about anything, just ask us via the Digital NSW Community where the entire team will engage with you. 

We appreciate all well intended contributions.

### Suggested components

To be considered for inclusion in the design system, components and patterns must be:

| Criteria | Description |
|---|---|
| [Useful](#useful) | It addresses a user need that’s shared by multiple services or products |
| [Unique](#unique) | It doesn’t duplicate something which already exists in the design system, unless it’s intended to replace it. |
| [Distinctly New South Wales](#distinctly-new-south-wales) | Suggested patterns and components must be aligned to the distinctly NSW look and feel.  Download the latest [NSW Design System Figma UI kit](https://www.digital.nsw.gov.au/design-system/getting-started/design-system-figma-ui-kit). |


### Before publication

Before new components and patterns are published into the design system, the team of core contributors will review them to make sure that they are:

| Criteria |  Description |
|---|---|
| [Usable](#usable) | It’s been tested and shown to work with a representative sample of users, including those with disabilities. |
| [Consistent](#consistent) | It uses existing styles and components in the design system where relevant. |
| [Versatile](#versatile) | It can be easily applied in different contexts. |
| [Coded](#coded) | Components are ready to merge in |
| [Tested](#tested) | It’s been tested and shown to work with a range of browsers, assistive technologies and devices. |
| [Considered](#considered) | Documentation and rationale have been provided. |

### Supporting evidence
When making a new component, we would be very grateful if you post the research, design decisions and use cases for the component. Accessibility considerations should be documented before submitting a pull request.

This may be in the form of a code snippet, screenshots, sketch/figma files or written text on your research with references. This gives a chance for members of the community to respond and share any work they may have done in the past on a similar pattern or component.

-------------------------------------------------------------------------------------------------

### Useful

**This is for everyone.** We can’t accept components that are for just one project or one specific use-case.

If a component is going to be added into the system it must be designed with the intention of being reusable in a variety of circumstances by many teams or departments.

We ask contributors to provide examples of the versatility of a proposed component or provide reference to community discussion about it’s wider intended use.

_If you have a specific need for your project, consider customising an existing component to suit your needs. If you aren’t sure how to do this, we’re happy to help teach you._

**[⬆ back to top](#contents)**

-------------------------------------------------------------------------------------------------

### Unique

Components shouldn’t duplicate the functionality of another component.

We need to keep the system slim; the more components that are in the system, the harder it is to maintain and the possibility for code-bloat and technical debt is increased.

If a component is similar in function consider extending it rather than duplicating it - check the current list on [our site](https://www.digital.nsw.gov.au/design-system/patterns/development-roadmap).

**[⬆ back to top](#contents)**

-------------------------------------------------------------------------------------------------

### Distinctly New South Wales

We would like NSW Government website users to feel like they are on a NSW Government website, to ensure this is the case all suggested patterns and components must be aligned to the distinctly NSW look and feel. Download the latest [NSW Design System Figma UI kit](https://www.digital.nsw.gov.au/design-system/getting-started/design-system-figma-ui-kit).

**[⬆ back to top](#contents)**

-------------------------------------------------------------------------------------------------

### Usable

We need to know that any new components are working as intended for the end user.

Task based testing for a specific component is preferred. But at a minimum components in the design system should be tested as part of a product or service and have been operating in a live or beta environment for a period of time before being integrated into the system.

**[⬆ back to top](#contents)**

-------------------------------------------------------------------------------------------------

### Consistent

Components that follow the system are much more themeable and reusable by other teams.

New components must follow the system as closely as possible, particularly the specifics of colour, spacing, and typescale in ~/src/global/scss/settings/settings.scss.

**[⬆ back to top](#contents)**

-------------------------------------------------------------------------------------------------

### Versatile

**Responsive.** All components should fill the width of their parent element. This is so that layouts aren’t dictated by components, but rather components fit the required layouts.

**Robust.** Components should accommodate varied content and varied content lengths. For example, what happens with a navigation component that has more items than demonstrated?

**[⬆ back to top](#contents)**

-------------------------------------------------------------------------------------------------

### Coded

**Code is for humans.** Please look at our coding style and work with it, not against it. We add spacing, and prefer readable code over clever code. Yes, code is actually for computers, but it is humans that need to maintain it.  

**Code comments.** Our stance on commenting code is that we encourage code to be cleanly and logically written to minimize the need to comment.  Sensible and clear naming of functions and variables would also help readability without the need for excess comments.

**Follow the folder structure.** New components should follow the same folder structure as the existing components.

**CSS** can be dependent on other components, but must use core functions and mixins at a minimum.

* For spacing, padding, or other metrics like border-width, reference ~/src/global/scss/helpers/_spacing.scss
* For font-sizes and line-height, reference ~/src/global/scss/tools/_typograpghy.scss
* For colours, reference ~/src/global/scss/settings/settings.scss.

**JavaScript.** The Design System vanilla JavaScript which gets transpiled to ES5.  We would rather avoid using jquery if possible.

**PS: Don't forget to remove your debugging! :)**

**[⬆ back to top](#contents)**

-------------------------------------------------------------------------------------------------

### Tested

**Accessibility.** A component on its own must be accessible to [WCAG 2.1 level AA.](https://www.w3.org/TR/WCAG21/) Some documentation on how this has been checked, tested, or decisions made to support accessibility should be supplied.

**Browser and device tested.** All components should meet our [browser support requirements.](https://github.com/govau/design-system-components#browser-support)

**No JavaScript fallbacks.** All components must degrade gracefully when JavaScript is disabled. We expect that a user can still complete their task without JavaScript enabled, it just might not be beautiful. For example, accordions default to ‘open’ when JavaScript is disabled so that users can still use the content.

**[⬆ back to top](#contents)**

-------------------------------------------------------------------------------------------------

### Considered

Include a high-level description for what the pattern is, and what it’s for.

Provide rationale; the more the better. We aim to explain design and code decisions as openly as possible. Explanations about why decisions have been made help others understand the work involved but also help them understand the consequences of overriding.

**[⬆ back to top](#contents)**


-------------------------------------------------------------------------------------------------


## Reporting Bugs, Asking Questions, Sending Suggestions

Sign up to the [Digital NSW Community](https://community.digital.nsw.gov.au/) to get started.  Once signed up, you will be able to raise bugs, suggest patterns and generally contribute to the Design System as a whole. 

For issues and bugs, Search our issues tracker on Github to see if the same bug has already been raised.  If not, raise the bug directly in the [Report a bug](https://community.digital.nsw.gov.au/c/components/report-a-bug/27) section of the community platform. Please provide specific steps to reproduce the bug and what your expected behaviour is.

You can also suggest a pattern via the Digital NSW Community platform in [Suggest a pattern](https://community.digital.nsw.gov.au/c/components/suggest-a-component/9). 


-------------------------------------------------------------------------------------------------


## Attribution

This Contribution Guide is adapted from:

https://github.com/govau/design-system-components/blob/master/CONTRIBUTING.md


**[⬆ back to top](#contents)**
