const formatter = require('../../lib/formatter');

describe('formatter', function() {
  describe('#parsePath', function() {
    const tree = {
      title: '[deeply.nested.test.section] this is a description',
      parent: {
        title: 'section',
        parent: {
          title: 'test',
          parent: {
            title: 'nested',
            parent: {
              title: 'deeply',
              parent: {
                title: ''
              }
            }
          }
        }
      }
    };
    it('should find the path from tree', function() {
      const input = Object.assign({}, tree, { title: 'this is a description' });
      const expected = ['deeply', 'nested', 'test', 'section'];
      const actual = formatter.parsePath(input);

      expect(actual).toEqual(expected);
    });

    it('should find the path from description', function() {
      const expected = ['deeply', 'nested', 'test', 'section'];
      const actual = formatter.parsePath(tree);

      expect(actual).toEqual(expected);
    });

    it('should return a path of length 1', function() {
      const input = {
        title: 'test case',
        parent: {
          title: 'this is a description'
        }
      };
      const actual = formatter.parsePath(input);

      expect(actual.length).toBe(1);
    });
  });
});
