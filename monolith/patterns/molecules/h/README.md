# Headers

Bare header levels are all normalized at `400 1rem $font-family-serif`. To get a header style, you must either use one of the header mixins or one of the class names `h1` through `h6`.

Header presentation is not bound to header levels because people often choose headers based on their visual style, not the explicit header level. Creating the mixins and generic classes makes it possible to style an `h2` as an `h4` (for example), or even arbitary text that serves the visual purpose of a heading but does not necessarily require explicit semantic signposting.

Header mixins all take an optional color parameter; by default they inherit the current color of the parent.

```scss
@include h1($color: currentColor);
@include h2($color: currentColor);
@include h3($color: currentColor);
@include h4($color: currentColor);
@include h5($color: currentColor);
@include h6($color: currentColor);
```
