# Mixin: Partial Underline

This mixin adds a short horizontal bar at the end of any component you use this mixin on. All properties are optional.

- $color: sets the color of the bar
- $width: sets the width of the bar
- $height: sets the height of the bar
- $margin-top: controls the distance from the rest of the content

```scss
@include partial-underline(
  $color: currentColor,
  $width: 1.56em,
  $height: 2px,
  $margin-top: 0
);
```
