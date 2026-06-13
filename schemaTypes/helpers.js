export function requiredRule(Rule) {
  return Rule.required()
}

export function titleFromName(name) {
  return name
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

export function defineTableDocument({name, title, fields, previewField = 'name'}) {
  return {
    name,
    title,
    type: 'document',
    fields,
    preview: {
      select: {
        title: previewField,
        subtitle: 'category'
      },
      prepare({title: previewTitle, subtitle}) {
        return {
          title: previewTitle || title,
          subtitle
        }
      }
    }
  }
}
