---
label: Guidance
order: "1"
layout: partial.hbs

---
## Usage

Accordions can work well for people who use a service regularly, or who need to perform familiar tasks quickly.

Only use an accordion if there’s evidence it’s helpful for users to:

* see an overview of multiple, related sections of content
* show and hide those sections as needed

### When to avoid

Test your content without an accordion first. Consider if it’s better to:

* simplify and reduce the amount of content
* split the content across multiple pages
* keep the content on a single page, separated by headings
* use a list of links to let users navigate quickly to specific sections of content
* use the Tab component for users who need to switch quickly between 2 sections. Accordions push other sections down the page when they open, but tabs do not move which makes it easier to switch.

Do not:

* use the accordion if the amount of content it would need to contain will make the page slow to load
* use accordions to split up a series of questions into sections. Use separate pages instead
* use with very short content, use lists or paragraphs
* use with very long content, use tabs or separate pages
* add any other UI elements within the header
* use where important information can be hidden and missed
* use an accordion to shorten a page.

## 
## Principles

**Use clear labels**

Accordions hide content, so the labels need to be clear. Ensure the headings used are brief and explicit about what is contained in the hidden panel. Intuitive headings help the user build a clear mental model of the content.

**Do not disable sections**

Accordions can be set open or closed. They can be configured to only allow 1 panel to be open at a time. Do not use with only 1 panel allowed to be open at once, if people need to compare items in different panels.

Disabling controls is normally confusing for users. If there is no content for a section, either remove the section or, if this would be confusing for your users, explain why there is no content when the section is opened.

Consider tabs if the user would likely need to flick between content sections.

## 
## Anatomy

![](/uploads/accordion-anatomy.png)

**Panel**

Contains accordion headline and content. The panel hover state lets the user know the entire element is clickable.

**Icon**

A directional arrow indicates that the panel is expandable or collapsible.

## 
## Accessibility

All components are responsive and meet WCAG 2.1 AA accessibility guidelines.