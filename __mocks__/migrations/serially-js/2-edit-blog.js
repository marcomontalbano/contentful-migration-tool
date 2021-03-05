module.exports = function (migration) {
  const blog = migration.editContentType('blog')

  blog.editField('title', {
    required: false
  })
}
