The "Panel" represents a common pattern on the site: a header overlapping with a top border and some background treatment. However, there's quite a bit of variation on width and how these blocks interact with their neighbors. For this reason there are several parameters that let you attach classes to both the inner and outer wrappers:

- `wrapper-classes` controls the presentation of the outer wrapper, where the border and background colors are set.
- `inner-classes` controls the presentation of the inner wrapper, which contains all of the content including the headline.
- `color` sets the color of the border as well as the background of the header
- `bgcolor` sets the color (or background image, using one of the background image utility classes) of the panel background.

There is one content block, `panel_content`, which should be overridden to inject content into the panel. This content should be contained in some other sort of layout.

For an advanced use example, see the "Major" page example.
