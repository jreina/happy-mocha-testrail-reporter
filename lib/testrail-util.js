const R = require('ramda');

const resolveSectionPath = sectionPath => sections => {
  const section = R.reduce(
    (memo, key) => {
      const foundSection = R.find(sect => {
        return (
          R.toLower(sect.name) === R.toLower(key) && sect.parent_id === memo.id
        );
      }, sections);
      if (!foundSection)
        throw new Error(`Could not resolve path [${sectionPath}]`);
      return foundSection;
    },
    { id: null },
    sectionPath
  );

  return section;
};

module.exports = { resolveSectionPath };
