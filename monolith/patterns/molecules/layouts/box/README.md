# Box

The `box` pattern is used for smaller blocks of content like asides, inset images, and so forth. In a drupal context they may wrap `blocks` or `Paragraphs` depending on layout intentions.

## Regions

`block_header` : Used for the header for the box. If this region is omitted in Drupal templates, there will be no markup generated.

`box_content`: Used for the content of the box. This region is always wrapped by a `div.box__content`, whether or not it is empty. There should be no empty box.

