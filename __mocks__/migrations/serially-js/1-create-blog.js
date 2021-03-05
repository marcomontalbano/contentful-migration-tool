module.exports = function (migration) {
  const blog = migration.createContentType('blog', {
    name: 'Blog',
    displayField: 'title'
  })

  blog.createField('title', {
    name: 'Title',
    type: 'Symbol',
    required: true
  })
}
