import {defineTableDocument, requiredRule} from '../helpers.js'

export const music = defineTableDocument({
  name: 'music',
  title: 'Music',
  fields: [
    {name: 'name', title: 'Name', type: 'string', validation: requiredRule},
    {name: 'file', title: 'File', type: 'string'},
    {name: 'filetype', title: 'File Type', type: 'string'},
    {name: 'lyrics', title: 'Lyrics', type: 'text', rows: 12},
    {name: 'note', title: 'Note', type: 'text', rows: 4},
    {name: 'ref', title: 'Reference', type: 'string'},
    {name: 'category', title: 'Category', type: 'string'},
    {name: 'hash', title: 'Hash', type: 'string'},
    {name: 'language', title: 'Language', type: 'string'},
    {name: 'cover', title: 'Cover', type: 'string'}
  ]
})
