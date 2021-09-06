import { MigrationFunction } from 'contentful-migration'

const migrate: MigrationFunction = (migration) => {
  const post = migration.createContentType('post', {
    name: 'Post',
    displayField: 'title'
  })

  post.createField('title', {
    name: 'Title',
    type: 'Symbol',
    required: true
  })
}

export = migrate
