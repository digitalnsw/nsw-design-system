# NSW DS Core Colour System and Patterns (LLM Guide)

Use this file as the universal colour/theming source for NSW Design System outputs.

Authoritative sources in this repo:

- `src/global/scss/settings/_theme.scss` (theme variables and semantic/status colours)
- `src/docs/chart-utilities.js` (complete token-to-hex lookup maps used in docs/examples)

## Usage Rules

- Use CSS variables first (`--nsw-*` / `--nsw-palette-*`) and use hex values as fallback/reference.
- Do not invent ad-hoc colours when an NSW token exists.
- Keep colour usage semantically meaningful and consistent across components.

## NSW Palette (Full Set)

| Token key | CSS variable | Hex |
|---|---|---|
| `blue01` | `--nsw-palette-blue-01` | `#002664` |
| `blue02` | `--nsw-palette-blue-02` | `#146cfd` |
| `blue03` | `--nsw-palette-blue-03` | `#8ce0ff` |
| `blue04` | `--nsw-palette-blue-04` | `#cbedfd` |
| `purple01` | `--nsw-palette-purple-01` | `#441170` |
| `purple02` | `--nsw-palette-purple-02` | `#8055f1` |
| `purple03` | `--nsw-palette-purple-03` | `#cebfff` |
| `purple04` | `--nsw-palette-purple-04` | `#e6e1fd` |
| `fuchsia01` | `--nsw-palette-fuchsia-01` | `#65004d` |
| `fuchsia02` | `--nsw-palette-fuchsia-02` | `#d912ae` |
| `fuchsia03` | `--nsw-palette-fuchsia-03` | `#f4b5e6` |
| `fuchsia04` | `--nsw-palette-fuchsia-04` | `#fddef2` |
| `red01` | `--nsw-palette-red-01` | `#630019` |
| `red02` | `--nsw-palette-red-02` | `#d7153a` |
| `red03` | `--nsw-palette-red-03` | `#ffb8c1` |
| `red04` | `--nsw-palette-red-04` | `#ffe6ea` |
| `orange01` | `--nsw-palette-orange-01` | `#941b00` |
| `orange02` | `--nsw-palette-orange-02` | `#f3631b` |
| `orange03` | `--nsw-palette-orange-03` | `#ffce99` |
| `orange04` | `--nsw-palette-orange-04` | `#fdeddf` |
| `brown01` | `--nsw-palette-brown-01` | `#523719` |
| `brown02` | `--nsw-palette-brown-02` | `#b68d5d` |
| `brown03` | `--nsw-palette-brown-03` | `#e8d0b5` |
| `brown04` | `--nsw-palette-brown-04` | `#ede3d7` |
| `yellow01` | `--nsw-palette-yellow-01` | `#694800` |
| `yellow02` | `--nsw-palette-yellow-02` | `#faaf05` |
| `yellow03` | `--nsw-palette-yellow-03` | `#fde79a` |
| `yellow04` | `--nsw-palette-yellow-04` | `#fff4cf` |
| `green01` | `--nsw-palette-green-01` | `#004000` |
| `green02` | `--nsw-palette-green-02` | `#00aa45` |
| `green03` | `--nsw-palette-green-03` | `#a8edb3` |
| `green04` | `--nsw-palette-green-04` | `#dbfadf` |
| `teal01` | `--nsw-palette-teal-01` | `#0b3f47` |
| `teal02` | `--nsw-palette-teal-02` | `#2e808e` |
| `teal03` | `--nsw-palette-teal-03` | `#8cdbe5` |
| `teal04` | `--nsw-palette-teal-04` | `#d1eeea` |
| `black` | `--nsw-palette-black` | `#000000` |
| `grey01` | `--nsw-palette-grey-01` | `#22272b` |
| `grey02` | `--nsw-palette-grey-02` | `#495054` |
| `grey03` | `--nsw-palette-grey-03` | `#cdd3d6` |
| `grey04` | `--nsw-palette-grey-04` | `#ebebeb` |
| `offWhite` | `--nsw-palette-off-white` | `#f2f2f2` |
| `white` | `--nsw-palette-white` | `#ffffff` |

## NSW Aboriginal Palette (Full Set)

| Token key | CSS variable | Hex |
|---|---|---|
| `earthRed` | `--nsw-aboriginal-palette-earth-red` | `#950906` |
| `emberRed` | `--nsw-aboriginal-palette-ember-red` | `#e1261c` |
| `coralPink` | `--nsw-aboriginal-palette-coral-pink` | `#fbb4b3` |
| `galahPink` | `--nsw-aboriginal-palette-galah-pink` | `#fdd9d9` |
| `deepOrange` | `--nsw-aboriginal-palette-deep-orange` | `#882600` |
| `orangeOchre` | `--nsw-aboriginal-palette-orange-ochre` | `#ee6314` |
| `clayOrange` | `--nsw-aboriginal-palette-clay-orange` | `#f4aa7d` |
| `sunsetOrange` | `--nsw-aboriginal-palette-sunset-orange` | `#f9d4be` |
| `bushHoneyYellow` | `--nsw-aboriginal-palette-bush-honey-yellow` | `#895e00` |
| `sandstoneYellow` | `--nsw-aboriginal-palette-sandstone-yellow` | `#fea927` |
| `goldenWattleYellow` | `--nsw-aboriginal-palette-golden-wattle-yellow` | `#fee48c` |
| `sunbeamYellow` | `--nsw-aboriginal-palette-sunbeam-yellow` | `#fff1c5` |
| `riverbedBrown` | `--nsw-aboriginal-palette-riverbed-brown` | `#552105` |
| `firewoodBrown` | `--nsw-aboriginal-palette-firewood-brown` | `#9e5332` |
| `claystoneBrown` | `--nsw-aboriginal-palette-claystone-brown` | `#d39165` |
| `macadamiaBrown` | `--nsw-aboriginal-palette-macadamia-brown` | `#e9c8b2` |
| `charcoalGrey` | `--nsw-aboriginal-palette-charcoal-grey` | `#272727` |
| `emuGrey` | `--nsw-aboriginal-palette-emu-grey` | `#555555` |
| `ashGrey` | `--nsw-aboriginal-palette-ash-grey` | `#ccc6c2` |
| `smokeGrey` | `--nsw-aboriginal-palette-smoke-grey` | `#e5e3e0` |
| `bushlandGreen` | `--nsw-aboriginal-palette-bushland-green` | `#215834` |
| `marshlandLime` | `--nsw-aboriginal-palette-marshland-lime` | `#78a146` |
| `gumleafGreen` | `--nsw-aboriginal-palette-gumleaf-green` | `#b5cda4` |
| `saltbushGreen` | `--nsw-aboriginal-palette-saltbush-green` | `#dae6d1` |
| `billabongBlue` | `--nsw-aboriginal-palette-billabong-blue` | `#00405e` |
| `saltwaterBlue` | `--nsw-aboriginal-palette-saltwater-blue` | `#0d6791` |
| `lightWaterBlue` | `--nsw-aboriginal-palette-light-water-blue` | `#84c5d1` |
| `coastalBlue` | `--nsw-aboriginal-palette-coastal-blue` | `#c1e2e8` |
| `bushPlum` | `--nsw-aboriginal-palette-bush-plum` | `#472642` |
| `spiritLilac` | `--nsw-aboriginal-palette-spirit-lilac` | `#9a5e93` |
| `lilliPilliPurple` | `--nsw-aboriginal-palette-lilli-pilli-purple` | `#c99ac2` |
| `duskPurple` | `--nsw-aboriginal-palette-dusk-purple` | `#e4cce0` |
| `black` | `--nsw-aboriginal-palette-black` | `#000000` |
| `offWhite` | `--nsw-aboriginal-palette-off-white` | `#f2f2f2` |
| `white` | `--nsw-aboriginal-palette-white` | `#ffffff` |

## Semantic Status Colours

| Token | CSS variable | Hex |
|---|---|---|
| `success` | `--nsw-status-success` | `#008a07` |
| `success-bg` | `--nsw-status-success-bg` | `#e5f6e6` |
| `info` | `--nsw-status-info` | `#2e5299` |
| `info-bg` | `--nsw-status-info-bg` | `#eaedf4` |
| `warning` | `--nsw-status-warning` | `#c95000` |
| `warning-bg` | `--nsw-status-warning-bg` | `#fbeee5` |
| `error` | `--nsw-status-error` | `#b81237` |
| `error-bg` | `--nsw-status-error-bg` | `#f7e7eb` |

## Pattern Principles

- Use patterning as a secondary channel where colour alone may fail.
- Ensure pattern stroke/ink has sufficient contrast against base fill.
- Keep pattern selection consistent and limited within one UI context.
- Preserve readability first; remove pattern complexity if it harms legibility.

## Do Not

- Do not rely on colour alone to convey critical meaning.
- Do not use low-contrast combinations for text or key state cues.
- Do not define one-off hex colours that bypass NSW token sets.
