## Entity Select

This module provides advanced selection logic and additional node context to link autocomplete fields. It is a modified version of  [Smart Entity Reference Selection](https://www.drupal.org/project/sers).

### Additional Syntax

* Add '#' and a number to your search to retrieve a maximum of that many results. For example, '#20' at the end of your search string returns a maximum of 20 results.
* Add '^' before a search term to filter on results that start with that term
* Add '$' before a search term to filter on results that end with that term
* Add '-' before a search term to filter out results that contain that term
* Use spaces to find results that contain all search terms
* All filters can be combined in one search. For example: '^fast -fact ' will match items whose labels start with 'fast' but do not include the word (or word fragment) 'fact'.