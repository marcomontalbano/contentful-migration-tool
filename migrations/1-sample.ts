import { MigrationFunction } from 'contentful-migration'

const migrate: MigrationFunction = (migration) => {
  const author = migration.createContentType('author', {
    name: 'Author',
    displayField: 'name'
  })

  author.createField('name', {
    name: 'Name',
    type: 'Symbol',
    required: true
  })
}

export = migrate
