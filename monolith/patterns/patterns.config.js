'use strict';
const faker = require('faker');
const _ = require('lodash');

const { bs, catchPhrase, companyName } = faker.company;
const { words, sentence, paragraph } = faker.lorem;
const { firstName, lastName } = faker.name;

function generateHTMLParagraph(numSentences = 6) {
  const { sentence } = faker.lorem;
  const sentences = _.range(numSentences).map(() => {
    const s = sentence();
    // Make some decisions about how the sentences are formatted.
    const chance = _.random(0,9);
    if ( chance < 6 ) return s;
    if (chance < 7 ) return `<a href="http://www.example.com/">${s}</a>`;
    if (chance < 8) return `<strong>${s}</strong>`;
    if (chance < 9) return `<em>${s}</em>`;
    return s;
  });
  return `<p>${sentences.join(' ')}</p>`;
}

function generateParagraphs(n = 1) {
  return _.range(n).map( () => `${generateHTMLParagraph()}` ).join('\n');
}

function generateHeader(level = 1) {
  return `<h${level} class="h${level}">${sentence()}</h${level}>`;
}

function generateHTMLBlock(paragraphs) {
  let nextHeader = 2;
  const block = _.range(paragraphs).map((i) => {
    if(_.random(0,9) === 0) { // 10% chance of having a header
      const thisHeader = nextHeader;
      nextHeader = _.random(2,thisHeader + 1);
      return `${generateHeader(thisHeader,false)}\n\n${generateHTMLParagraph()}`;
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
    htmlBlock: generateHTMLBlock(10),
    name_informal: `${firstName()} ${lastName()}`,
    bs: bs(),
    catchPhrase: catchPhrase(),
    companyName: companyName(),
    contactNavigation: { items: ['Contact Us','Location & Maps'] },
    footerNavigation: { items: ['The Arts','Emergency','TCCS','Athletics','Employment','Accessibility'] },
    legal: { items: ['Privacy','Feedback','Directory'] },
    mainNavigation: { items: ['Admissions & Aid', 'Academics', 'Life @ Pomona', 'Home', 'News & Events', 'About', 'Alumni & Families'] },
    quicklinks: { items: ['A-Z Directory' ,'Academic Calendar' ,'Athletics' ,'Campus Map' ,'Catalog' ,'Dining Menus' ,'Give Today'] },
    pagesFor: { items: ['New Students', 'Students', 'Faculty', 'Staff'] }
  }
};
