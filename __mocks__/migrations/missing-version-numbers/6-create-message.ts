import { MigrationFunction } from 'contentful-migration'

const migrate: MigrationFunction = (migration) => {
  const message = migration.createContentType('message', {
    name: 'Message',
    displayField: 'text'
  })

  message.createField('text', {
    name: 'Text',
    type: 'Symbol',
    required: true
  })
}

export = migrate
