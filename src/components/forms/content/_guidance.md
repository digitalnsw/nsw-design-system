---
label: Guidance
order: "1"
layout: partial.hbs

---
Forms are used to capture data from users.

## Using forms

Forms comprise of the form itself and multiple form inputs. Each form is broken down into one or more fieldsets that groups the form elements into logical chunks that make sense to the user, for example, a delivery address.

Form elements are split into two key input types:

* **Freeform inputs** - Free form text inputs are the most used components in forms. Use text fields and text areas for freeform entry. Text fields are used to input a short (single line) amount of freeform text. Text areas are used to input multiple lines of text, for example, a comments field. Use text areas when you expect longer entries.
* **Selection inputs** - Selection inputs are used to select an option from a predefined list of available options. Selection options may be single-select or multi-select. Use a radio button list or dropdowns for single selections and checkboxes for multi-selections.

### Dropdown

The dropdown pattern, also referred to as a drop list or select list, allows users to select a single option from a list of available options.

### Single checkbox

Single checkboxes are used to confirm a user's selection or preference like agreeing to terms and conditions or registering for an option.

### Checkbox list

Checkbox lists provide the user with a list of available items to choose from. The number of items a user can select should be indicated to the user on the page. Checkbox lists are used where multiple selections are permitted. Checkbox lists are wrapped in a fieldset to make them one logical group.

### Radio list

Radio lists provide the user with a list of all available items from which a single selection is made. Radio lists are wrapped in a fieldset to make them one logical group.

## How this component works

**Help text**

Help text allows form designers to provide users with help to fill in a form element. Use help text to provide additional context, information or as an example to complete a field input.

**Validation**

Validation is used to let the user know when there is an issue with the data they have input. The validation that you input needs to clearly explain to the user what the issue is and what they need to do to address the error.

**Organising form elements**

* Differentiate primary from secondary actions
* Group related information to ensure the user makes sense of the form faster
* Enable autofill and autocorrect based on common attributes or responses, such as name and email, previously provided on the site or in the browser
* Use multi-step forms in situations where there are multiple form fields, several of which could be split up into categories (such as “personal”, “shipping”, “billing”, and “payment review”).

**Do:**

* **Keep it one column,** multiple columns easily disrupt a user’s vertical momentum
* **Use field length input constraints,** employ this for fields that have a defined character count like phone numbers and postcodes
* **Mark required vs. optional form fields,** you should always mark your form fields as “required” or “optional”. You can do this by writing “required” or “optional” in a small font next to your field, or by placing an asterisk next to your required fields
* **Use top align labels,** users complete top aligned labeled forms at a much higher rate than left-aligned labels. Top aligned labels also translate well on mobile.
* **Make CTAs descriptive,** state the intent of the action
* **Specify errors inline,** show the user where the error occurred and provide a reason.

**Do not:**

* Use all caps
* Hide helper text

## Accessibility

All components are responsive and meet WCAG 2.1 AA accessibility guidelines.