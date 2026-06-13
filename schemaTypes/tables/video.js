import {defineTableDocument, requiredRule} from '../helpers.js'

export const video = defineTableDocument({
  name: 'video',
  title: 'Video',
  fields: [
    {name: 'name', title: 'Name', type: 'string', validation: requiredRule},
    {name: 'file', title: 'File', type: 'string'},
    {name: 'filetype', title: 'File Type', type: 'string'},
    {name: 'note', title: 'Note', type: 'text', rows: 4},
    {name: 'ref', title: 'Reference', type: 'string'},
    {name: 'category', title: 'Category', type: 'string'},
    {name: 'hash', title: 'Hash', type: 'string'},
    {name: 'cover', title: 'Cover', type: 'string'},
    {name: 'fileSize', title: 'File Size', type: 'number'}
  ]
})
