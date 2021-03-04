import { MigrationFunction } from 'contentful-migration'

const migrate: MigrationFunction = (migration) => {
  const author = migration.editContentType('author', {
    name: 'Author',
    displayField: 'name'
  })

  author.editField('name', {
    name: 'Name',
    type: 'Symbol',
    required: false
  })
}

export = migrate
