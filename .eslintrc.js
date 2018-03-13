module.exports = {
  extends: ['airbnb-base', 'prettier'],
  env: {
    node: true,
    mocha: true,
    jasmine: true
  },
  rules: {
    'no-console': 0,
    'linebreak-style': 0,
    'prefer-arrow-callback': 0,
    'func-names': 0,
    'no-unused-expressions': 0,
    'no-underscore-dangle': 0,
    'arrow-body-style': 0,
    'no-warning-comments': 2,
    camelcase: 0
  }
};
