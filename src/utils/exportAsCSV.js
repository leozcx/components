export default function exportAsCSV (filename = 'filename.csv', content) {
  let fields = content.fields
  let data = content.data
  let defaultUndefinedValue = ''
  if (!(data instanceof Array)) {
    console.warn('data must be Array!')
    return
  }
  if (data.length === 0) {
    console.warn('data is empty!')
    return
  }
  if (!fields) {
    fields = Object.keys(data[0]).map((k) => {
      return {
        prop: k,
        label: k
      }
    })
  }
  let dataStr = ''
  let len = fields.length
  fields.forEach((f, index) => {
    dataStr += f.label
    if (index < len - 1) {
      dataStr += ','
    }
  })
  dataStr += '\r\n'
  data.forEach((d) => {
    fields.forEach((f, index) => {
      let value = d[f.prop]
      if (f.formatter) {
        value = f.formatter(value, d)
      }
      let type = typeof value
      if (type === 'undefined') {
        value = defaultUndefinedValue
      } else if (type === 'string') {
        value = `"${value}"`
      }
      dataStr += value
      if (index < len - 1) {
        dataStr += ','
      }
    })
    dataStr += '\r\n'
  })
  let csvData = new Blob(['\uFEFF', dataStr], { type: 'text/csv,charset=GB2312' })
  let uri = URL.createObjectURL(csvData)
  let link = document.createElement('a')
  link.setAttribute('href', uri)
  link.setAttribute('download', filename)
  link.click()
}
