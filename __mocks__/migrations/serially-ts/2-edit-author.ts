import { MigrationFunction } from 'contentful-migration'

const migrate: MigrationFunction = (migration) => {
  const author = migration.editContentType('author')

  author.editField('name', {
    name: 'Name',
    type: 'Symbol'
  })
}

export = migrate
