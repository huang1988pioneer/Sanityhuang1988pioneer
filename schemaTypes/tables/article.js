import {defineTableDocument} from '../helpers.js'

export const article = defineTableDocument({
  name: 'article',
  title: 'Article',
  previewField: 'title',
  fields: [
    {name: 'title', title: 'Title', type: 'string'},
    {name: 'content', title: 'Content', type: 'text', rows: 12},
    {name: 'category', title: 'Category', type: 'string'},
    {name: 'ref', title: 'Reference', type: 'string'},
    {name: 'newDate', title: 'New Date', type: 'datetime'},
    {name: 'url1', title: 'URL 1', type: 'url'},
    {name: 'url2', title: 'URL 2', type: 'url'},
    {name: 'url3', title: 'URL 3', type: 'url'},
    {name: 'file1', title: 'File 1', type: 'string'},
    {name: 'file1name', title: 'File 1 Name', type: 'string'},
    {name: 'file1type', title: 'File 1 Type', type: 'string'},
    {name: 'file2', title: 'File 2', type: 'string'},
    {name: 'file2name', title: 'File 2 Name', type: 'string'},
    {name: 'file2type', title: 'File 2 Type', type: 'string'},
    {name: 'file3', title: 'File 3', type: 'string'},
    {name: 'file3name', title: 'File 3 Name', type: 'string'},
    {name: 'file3type', title: 'File 3 Type', type: 'string'}
  ]
})
