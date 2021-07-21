'use strict';

var faker = require('faker');
var _ = require('lodash');

var _faker$company = faker.company,
    bs = _faker$company.bs,
    catchPhrase = _faker$company.catchPhrase,
    companyName = _faker$company.companyName;
var _faker$lorem = faker.lorem,
    words = _faker$lorem.words,
    sentence = _faker$lorem.sentence,
    paragraph = _faker$lorem.paragraph;
var _faker$name = faker.name,
    firstName = _faker$name.firstName,
    lastName = _faker$name.lastName;


function generateHTMLParagraph() {
  var numSentences = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 6;
  var sentence = faker.lorem.sentence;

  var sentences = _.range(numSentences).map(function () {
    var s = sentence();
    // Make some decisions about how the sentences are formatted.
    var chance = _.random(0, 9);
    if (chance < 6) return s;
    if (chance < 7) return '<a href="http://www.example.com/">' + s + '</a>';
    if (chance < 8) return '<strong>' + s + '</strong>';
    if (chance < 9) return '<em>' + s + '</em>';
    return s;
  });
  return '<p>' + sentences.join(' ') + '</p>';
}

function generateParagraphs() {
  var n = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;

  return _.range(n).map(function () {
    return '' + generateHTMLParagraph();
  }).join('\n');
}

function generateHeader() {
  var level = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;

  return '<h' + level + ' class="h' + level + '">' + sentence() + '</h' + level + '>';
}

function generateHTMLBlock(paragraphs) {
  var nextHeader = 2;
  var block = _.range(paragraphs).map(function (i) {
    if (_.random(0, 9) === 0) {
      // 10% chance of having a header
      var thisHeader = nextHeader;
      nextHeader = _.random(2, thisHeader + 1);
      return generateHeader(thisHeader, false) + '\n\n' + generateHTMLParagraph();
    } else {
      return generateHTMLParagraph();
    }
  }).join('\n');
  return block;
}

module.exports = {
  context: {
    words: words(),
    sentence: sentence(),
    paragraph: generateParagraphs(1),
    paragraphs: generateParagraphs(3),
    paragraphs_mid: generateParagraphs(7),
    paragraphs_long: generateParagraphs(15),
    htmlBlock: generateHTMLBlock(30),
    name_informal: firstName() + ' ' + lastName(),
    bs: bs(),
    catchPhrase: catchPhrase(),
    companyName: companyName()
  }
};
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInBhdHRlcm5zLmNvbmZpZy5qcyJdLCJuYW1lcyI6WyJmYWtlciIsInJlcXVpcmUiLCJfIiwiY29tcGFueSIsImJzIiwiY2F0Y2hQaHJhc2UiLCJjb21wYW55TmFtZSIsImxvcmVtIiwid29yZHMiLCJzZW50ZW5jZSIsInBhcmFncmFwaCIsIm5hbWUiLCJmaXJzdE5hbWUiLCJsYXN0TmFtZSIsImdlbmVyYXRlSFRNTFBhcmFncmFwaCIsIm51bVNlbnRlbmNlcyIsInNlbnRlbmNlcyIsInJhbmdlIiwibWFwIiwicyIsImNoYW5jZSIsInJhbmRvbSIsImpvaW4iLCJnZW5lcmF0ZVBhcmFncmFwaHMiLCJuIiwiZ2VuZXJhdGVIZWFkZXIiLCJsZXZlbCIsImdlbmVyYXRlSFRNTEJsb2NrIiwicGFyYWdyYXBocyIsIm5leHRIZWFkZXIiLCJibG9jayIsImkiLCJ0aGlzSGVhZGVyIiwibW9kdWxlIiwiZXhwb3J0cyIsImNvbnRleHQiLCJwYXJhZ3JhcGhzX21pZCIsInBhcmFncmFwaHNfbG9uZyIsImh0bWxCbG9jayIsIm5hbWVfaW5mb3JtYWwiXSwibWFwcGluZ3MiOiJBQUFBOztBQUNBLElBQU1BLFFBQVFDLFFBQVEsT0FBUixDQUFkO0FBQ0EsSUFBTUMsSUFBSUQsUUFBUSxRQUFSLENBQVY7O3FCQUV5Q0QsTUFBTUcsTztJQUF2Q0MsRSxrQkFBQUEsRTtJQUFJQyxXLGtCQUFBQSxXO0lBQWFDLFcsa0JBQUFBLFc7bUJBQ2NOLE1BQU1PLEs7SUFBckNDLEssZ0JBQUFBLEs7SUFBT0MsUSxnQkFBQUEsUTtJQUFVQyxTLGdCQUFBQSxTO2tCQUNPVixNQUFNVyxJO0lBQTlCQyxTLGVBQUFBLFM7SUFBV0MsUSxlQUFBQSxROzs7QUFFbkIsU0FBU0MscUJBQVQsR0FBaUQ7QUFBQSxNQUFsQkMsWUFBa0IsdUVBQUgsQ0FBRztBQUFBLE1BQ3ZDTixRQUR1QyxHQUMxQlQsTUFBTU8sS0FEb0IsQ0FDdkNFLFFBRHVDOztBQUUvQyxNQUFNTyxZQUFZZCxFQUFFZSxLQUFGLENBQVFGLFlBQVIsRUFBc0JHLEdBQXRCLENBQTBCLFlBQU07QUFDaEQsUUFBTUMsSUFBSVYsVUFBVjtBQUNBO0FBQ0EsUUFBTVcsU0FBU2xCLEVBQUVtQixNQUFGLENBQVMsQ0FBVCxFQUFXLENBQVgsQ0FBZjtBQUNBLFFBQUtELFNBQVMsQ0FBZCxFQUFrQixPQUFPRCxDQUFQO0FBQ2xCLFFBQUlDLFNBQVMsQ0FBYixFQUFpQiw4Q0FBNENELENBQTVDO0FBQ2pCLFFBQUlDLFNBQVMsQ0FBYixFQUFnQixvQkFBa0JELENBQWxCO0FBQ2hCLFFBQUlDLFNBQVMsQ0FBYixFQUFnQixnQkFBY0QsQ0FBZDtBQUNoQixXQUFPQSxDQUFQO0FBQ0QsR0FUaUIsQ0FBbEI7QUFVQSxpQkFBYUgsVUFBVU0sSUFBVixDQUFlLEdBQWYsQ0FBYjtBQUNEOztBQUVELFNBQVNDLGtCQUFULEdBQW1DO0FBQUEsTUFBUEMsQ0FBTyx1RUFBSCxDQUFHOztBQUNqQyxTQUFPdEIsRUFBRWUsS0FBRixDQUFRTyxDQUFSLEVBQVdOLEdBQVgsQ0FBZ0I7QUFBQSxnQkFBU0osdUJBQVQ7QUFBQSxHQUFoQixFQUFxRFEsSUFBckQsQ0FBMEQsSUFBMUQsQ0FBUDtBQUNEOztBQUVELFNBQVNHLGNBQVQsR0FBbUM7QUFBQSxNQUFYQyxLQUFXLHVFQUFILENBQUc7O0FBQ2pDLGdCQUFZQSxLQUFaLGlCQUE2QkEsS0FBN0IsVUFBdUNqQixVQUF2QyxXQUF1RGlCLEtBQXZEO0FBQ0Q7O0FBRUQsU0FBU0MsaUJBQVQsQ0FBMkJDLFVBQTNCLEVBQXVDO0FBQ3JDLE1BQUlDLGFBQWEsQ0FBakI7QUFDQSxNQUFNQyxRQUFRNUIsRUFBRWUsS0FBRixDQUFRVyxVQUFSLEVBQW9CVixHQUFwQixDQUF3QixVQUFDYSxDQUFELEVBQU87QUFDM0MsUUFBRzdCLEVBQUVtQixNQUFGLENBQVMsQ0FBVCxFQUFXLENBQVgsTUFBa0IsQ0FBckIsRUFBd0I7QUFBRTtBQUN4QixVQUFNVyxhQUFhSCxVQUFuQjtBQUNBQSxtQkFBYTNCLEVBQUVtQixNQUFGLENBQVMsQ0FBVCxFQUFXVyxhQUFhLENBQXhCLENBQWI7QUFDQSxhQUFVUCxlQUFlTyxVQUFmLEVBQTBCLEtBQTFCLENBQVYsWUFBaURsQix1QkFBakQ7QUFDRCxLQUpELE1BSU87QUFDTCxhQUFPQSx1QkFBUDtBQUNEO0FBQ0YsR0FSYSxFQVFYUSxJQVJXLENBUU4sSUFSTSxDQUFkO0FBU0EsU0FBT1EsS0FBUDtBQUNEOztBQUVERyxPQUFPQyxPQUFQLEdBQWlCO0FBQ2ZDLFdBQVM7QUFDUDNCLFdBQU9BLE9BREE7QUFFUEMsY0FBVUEsVUFGSDtBQUdQQyxlQUFXYSxtQkFBbUIsQ0FBbkIsQ0FISjtBQUlQSyxnQkFBWUwsbUJBQW1CLENBQW5CLENBSkw7QUFLUGEsb0JBQWdCYixtQkFBbUIsQ0FBbkIsQ0FMVDtBQU1QYyxxQkFBaUJkLG1CQUFtQixFQUFuQixDQU5WO0FBT1BlLGVBQVdYLGtCQUFrQixFQUFsQixDQVBKO0FBUVBZLG1CQUFrQjNCLFdBQWxCLFNBQWlDQyxVQVIxQjtBQVNQVCxRQUFJQSxJQVRHO0FBVVBDLGlCQUFhQSxhQVZOO0FBV1BDLGlCQUFhQTtBQVhOO0FBRE0sQ0FBakIiLCJmaWxlIjoicGF0dGVybnMuY29uZmlnLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBzdHJpY3QnO1xuY29uc3QgZmFrZXIgPSByZXF1aXJlKCdmYWtlcicpO1xuY29uc3QgXyA9IHJlcXVpcmUoJ2xvZGFzaCcpO1xuXG5jb25zdCB7IGJzLCBjYXRjaFBocmFzZSwgY29tcGFueU5hbWUgfSA9IGZha2VyLmNvbXBhbnk7XG5jb25zdCB7IHdvcmRzLCBzZW50ZW5jZSwgcGFyYWdyYXBoIH0gPSBmYWtlci5sb3JlbTtcbmNvbnN0IHsgZmlyc3ROYW1lLCBsYXN0TmFtZSB9ID0gZmFrZXIubmFtZTtcblxuZnVuY3Rpb24gZ2VuZXJhdGVIVE1MUGFyYWdyYXBoKG51bVNlbnRlbmNlcyA9IDYpIHtcbiAgY29uc3QgeyBzZW50ZW5jZSB9ID0gZmFrZXIubG9yZW07XG4gIGNvbnN0IHNlbnRlbmNlcyA9IF8ucmFuZ2UobnVtU2VudGVuY2VzKS5tYXAoKCkgPT4ge1xuICAgIGNvbnN0IHMgPSBzZW50ZW5jZSgpO1xuICAgIC8vIE1ha2Ugc29tZSBkZWNpc2lvbnMgYWJvdXQgaG93IHRoZSBzZW50ZW5jZXMgYXJlIGZvcm1hdHRlZC5cbiAgICBjb25zdCBjaGFuY2UgPSBfLnJhbmRvbSgwLDkpO1xuICAgIGlmICggY2hhbmNlIDwgNiApIHJldHVybiBzO1xuICAgIGlmIChjaGFuY2UgPCA3ICkgcmV0dXJuIGA8YSBocmVmPVwiaHR0cDovL3d3dy5leGFtcGxlLmNvbS9cIj4ke3N9PC9hPmA7XG4gICAgaWYgKGNoYW5jZSA8IDgpIHJldHVybiBgPHN0cm9uZz4ke3N9PC9zdHJvbmc+YDtcbiAgICBpZiAoY2hhbmNlIDwgOSkgcmV0dXJuIGA8ZW0+JHtzfTwvZW0+YDtcbiAgICByZXR1cm4gcztcbiAgfSk7XG4gIHJldHVybiBgPHA+JHtzZW50ZW5jZXMuam9pbignICcpfTwvcD5gO1xufVxuXG5mdW5jdGlvbiBnZW5lcmF0ZVBhcmFncmFwaHMobiA9IDEpIHtcbiAgcmV0dXJuIF8ucmFuZ2UobikubWFwKCAoKSA9PiBgJHtnZW5lcmF0ZUhUTUxQYXJhZ3JhcGgoKX1gICkuam9pbignXFxuJyk7XG59XG5cbmZ1bmN0aW9uIGdlbmVyYXRlSGVhZGVyKGxldmVsID0gMSkge1xuICByZXR1cm4gYDxoJHtsZXZlbH0gY2xhc3M9XCJoJHtsZXZlbH1cIj4ke3NlbnRlbmNlKCl9PC9oJHtsZXZlbH0+YDtcbn1cblxuZnVuY3Rpb24gZ2VuZXJhdGVIVE1MQmxvY2socGFyYWdyYXBocykge1xuICBsZXQgbmV4dEhlYWRlciA9IDI7XG4gIGNvbnN0IGJsb2NrID0gXy5yYW5nZShwYXJhZ3JhcGhzKS5tYXAoKGkpID0+IHtcbiAgICBpZihfLnJhbmRvbSgwLDkpID09PSAwKSB7IC8vIDEwJSBjaGFuY2Ugb2YgaGF2aW5nIGEgaGVhZGVyXG4gICAgICBjb25zdCB0aGlzSGVhZGVyID0gbmV4dEhlYWRlcjtcbiAgICAgIG5leHRIZWFkZXIgPSBfLnJhbmRvbSgyLHRoaXNIZWFkZXIgKyAxKTtcbiAgICAgIHJldHVybiBgJHtnZW5lcmF0ZUhlYWRlcih0aGlzSGVhZGVyLGZhbHNlKX1cXG5cXG4ke2dlbmVyYXRlSFRNTFBhcmFncmFwaCgpfWA7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBnZW5lcmF0ZUhUTUxQYXJhZ3JhcGgoKTtcbiAgICB9XG4gIH0pLmpvaW4oJ1xcbicpO1xuICByZXR1cm4gYmxvY2s7XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBjb250ZXh0OiB7XG4gICAgd29yZHM6IHdvcmRzKCksXG4gICAgc2VudGVuY2U6IHNlbnRlbmNlKCksXG4gICAgcGFyYWdyYXBoOiBnZW5lcmF0ZVBhcmFncmFwaHMoMSksXG4gICAgcGFyYWdyYXBoczogZ2VuZXJhdGVQYXJhZ3JhcGhzKDMpLFxuICAgIHBhcmFncmFwaHNfbWlkOiBnZW5lcmF0ZVBhcmFncmFwaHMoNyksXG4gICAgcGFyYWdyYXBoc19sb25nOiBnZW5lcmF0ZVBhcmFncmFwaHMoMTUpLFxuICAgIGh0bWxCbG9jazogZ2VuZXJhdGVIVE1MQmxvY2soMzApLFxuICAgIG5hbWVfaW5mb3JtYWw6IGAke2ZpcnN0TmFtZSgpfSAke2xhc3ROYW1lKCl9YCxcbiAgICBiczogYnMoKSxcbiAgICBjYXRjaFBocmFzZTogY2F0Y2hQaHJhc2UoKSxcbiAgICBjb21wYW55TmFtZTogY29tcGFueU5hbWUoKSxcbiAgfVxufTtcblxuIl19
