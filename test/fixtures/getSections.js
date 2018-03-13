module.exports = [
  {
    id: 100,
    suite_id: 1,
    name: 'Foo',
    description: 'Test section',
    parent_id: null,
    display_order: 1,
    depth: 0
  },
  {
    id: 200,
    suite_id: 1,
    name: 'Bar',
    description: 'Test section',
    parent_id: 100,
    display_order: 1,
    depth: 1
  },
  {
    id: 300,
    suite_id: 1,
    name: 'Baz',
    description: 'Test section',
    parent_id: 200,
    display_order: 1,
    depth: 2
  },
  {
    id: 400,
    suite_id: 1,
    name: 'Biz',
    description: 'Test section',
    parent_id: 300,
    display_order: 1,
    depth: 3
  }
];
