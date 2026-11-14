# Design principles

Keep the existing warm paper/ink light and dark themes and Geist typography. The reading column is 632px inside a 680px container with 24px gutters. Body line height is 1.8; headings separate mathematical sections without enclosing them in cards. Figures are part of the argument, with concise captions and stable, descriptive fragment IDs.

Normal figures fit the text. Wide and breakout figures add 160px and 280px only above 1100px. SVG viewBoxes reserve space. At 480px paired plots stack; axes and units must still be legible. Sidenotes enter the margin only above 1300px.

The restrained teal `--sci-accent` identifies the currently selected mathematical operation or plotted vector, with theme-specific values. Neutral dashed envelopes describe possible endpoints. Labels, underlines, solid/dashed strokes and numerical coordinates repeat meaning without relying on colour. Do not assign multiple meanings to the same colour within a figure. Add semantic roles only when a real figure requires them.

Week 1 adds a restrained amber `--sci-secondary` for the complementary component, second curve or residual, named explicitly in each figure. Ink tracks the original/result vector as labelled. The storyboards share fixed-scale coordinate planes (40 SVG units per mathematical unit) and retain the same scale within a comparison. Paired panels stack below 701px; three-panel sequences use the wide layout above 1099px and stack below it. Captions under individual panels explain each mathematical operation; a shared figure caption states assumptions and connects the sequence.

No decorative motion, gradients, shadows or control dashboards. Controls should be compact but comfortably operable. Keep fixed scales when comparing magnitude; explicitly disclose different scales between panels.
