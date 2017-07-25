<template>
  <table cellpadding=0 cellspacing=0>
    <thead>
      <tr>
        <th v-for="key in options.columnDefs" :key="key.field" v-bind:class="getHeaderClass(key)">
          <div v-if="key.empty" v-html="getRawHtml(key)"></div>
          <div v-else>{{ key.displayName }}</div>
        </th>
      </tr>
      <tr v-if="options.showAggregation">
        <th v-for="(key, colIndex) in options.columnDefs" :key="key.field" v-bind:class="getHeaderClass(key)">
          <div v-if="key.empty"></div>
          <div v-bind:class="getTdClass(key, 1, colIndex)" class="header__measure" v-else>{{ getAggregationValue(key) }}</div>
        </th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(entry, rowIndex) in filteredData" v-show="expanded(entry, rowIndex)" v-bind:class="getTrClass(rowIndex, entry)">
        <td v-for="(key, colIndex) in options.columnDefs" :key="key.field" @click="toggleRow(entry, rowIndex, key, colIndex)" v-bind:class="getTdClass(key, rowIndex, colIndex, entry)">
          <span v-if="key.showAlarm !== undefined && key.showAlarm(entry, colIndex, key)" class="alarm">
            <i class="fa fa-exclamation-triangle" aria-hidden="true" v-if="colIndex === 0"></i>
            {{getDisplayValue(entry, key)}}
          </span>
          <span v-else>
            {{getDisplayValue(entry, key)}}
          </span>
          <span class="fa fa-caret-down triangle" v-if="entry && entry.$$treeLevel === 0 && key.treeView" v-bind:class="{'up':  entry && entry.$$expanded}"></span>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script>
  function numberFilter (value) {
    if (value === undefined || value === null) {
      return '-'
    }
    if (!isNaN(value)) {
      return Number(Number(value).toFixed(0)).toLocaleString()
    }
    return value
  }
  export default {
    name: 'grid',
    props: {
      options: Object,
      data: Array,
      aggregationData: Object
    },
    methods: {
      getAggregationValue (colDef) {
        if (colDef.displayName === '') {
          return
        }
        let val
        if (colDef.aggregationFn) {
          val = colDef.aggregationFn(this.data, colDef, this.aggregationData)
        } else {
          val = this.defaultAggregationFn(colDef)
        }
        return this.doGetDisplayValue(val, colDef)
      },
      defaultAggregationFn (colDef) {
        let aggType = colDef.aggregationType || 'sum'
        if (aggType === 'sum' || aggType === 'avg') {
          let length = 0
          let noValue = false
          let sum = this.data.reduce((acc, cur) => {
            // 默认只算第0级，下面的级包含在第0级里
            // 没有$$treeLevel的话说明不分级
            let curVal = 0
            if (!cur.$$treeLevel) {
              curVal = this.getValue(cur, colDef)
              length++
            }
            if (isNaN(curVal) && !noValue) {
              noValue = true
            }
            let val = isNaN(curVal) ? 0 : curVal
            return acc + val
          }, 0)
          if (noValue) {
            return
          }
          return aggType === 'sum' ? sum : (length === 0 ? '' : sum / length)
        } else if (aggType === 'server') {
          return this.aggregationData ? this.getValue(this.aggregationData, colDef) : undefined
        }
      },
      getRawHtml (colDef) {
        return colDef.getHeaderHtml ? colDef.getHeaderHtml() : ''
      },
      getHeaderClass (colDef) {
        return colDef.headerClass ? colDef.headerClass : ''
      },
      getHeaderName (colDef) {
        return colDef.displayName
      },
      getTrClass (rowIndex, rowItem) {
        let ret = rowIndex % 2 === 0 ? 'even' : 'odd'
        if (rowItem.$$parent) {
          ret += ' children'
        }
        return ret
      },
      getValue (rowItem, colDef) {
        if (colDef.empty) {
          return
        }
        let v = rowItem[colDef.field]
        let fieldVal = (!isNaN(v) || colDef.type === 'number') ? Number(v) : v
        return colDef.getValue ? colDef.getValue(rowItem, colDef) : fieldVal
      },
      getDisplayValue (rowItem, colDef) {
        let value = this.getValue(rowItem, colDef)
        return this.doGetDisplayValue(value, colDef)
      },
      doGetDisplayValue (value, colDef) {
        if (colDef.empty) {
          return
        }
        let formatter = colDef.formatter
        if (formatter) {
          return formatter(value)
        }
        if (colDef.type === undefined || colDef.type === 'number') {
          let val = numberFilter(value)
          return val
        }
        return value
      },
      getTdClass (colDef, rowIndex, colIndex, rowItem) {
        let ret = ''
        if (colDef.treeView && colIndex === 0) {
          ret += 'tree__header expandable'
        }
        if (colDef.bodyClass) {
          ret += ' ' + colDef.bodyClass
        }
        if (this.clickable(rowItem, rowIndex, colDef, colIndex)) {
          ret += ' pointer'
        }
        return ret
      },
      toggleRow (rowItem, rowIndex, colDef, colIndex) {
        if (!this.clickable(rowItem, rowIndex, colDef, colIndex)) {
          return
        }
        rowItem.$$expanded = !rowItem.$$expanded
        if (rowItem.$$expanded) {
          colDef.onExpand && colDef.onExpand(rowItem, colIndex)
        } else {
          colDef.onCollapse && colDef.onCollapse(rowItem, colIndex)
        }
        if (this.options.saveState) {
          let expandedStr = this.data.filter((d) => { return d.$$expanded }).map((d) => { return d[this.options.idProperty] }).join(',')
          localStorage.setItem(this.options.id, expandedStr)
        }
      },
      clickable (rowItem, rowIndex, colDef, colIndex) {
        return rowItem && colIndex === 0 && rowItem.$$treeLevel === 0 && colDef.treeView
      },
      expanded (item, rowIndex) {
        let data = item // this.filteredData[rowIndex]
        let ret = (data.$$parent === undefined) || data.$$parent.$$expanded
        return ret
      },
      setOption (options) {
        if (options) {
          Object.assign(this.options, options)
          this.preExpand()
        }
      },
      preExpand () {
        if (!this.options.saveState) {
          return
        }
        let expandedIds = localStorage.getItem(this.options.id)
        if (expandedIds && this.data) {
          let expandedIdArray = expandedIds.split(',')
          this.data.forEach((d) => {
            if (expandedIdArray.indexOf(d[this.options.idProperty]) !== -1) {
              d.$$expanded = true
              // TODO 默认只有第0列是可点击的
              let colDef = this.options.columnDefs[0]
              colDef.onExpand && colDef.onExpand(d, 0)
            }
          })
        }
      }
    },
    computed: {
      filteredData () {
        return this.data
      }
    },
    created () {
    }
  }
</script>

<style scoped>
  table {
    width: 100%;
    border-radius: 3px;
    background-color: #fff;
    overflow-x: auto;
  }

  th {
    background-color: #1E2526;
    color: #849193;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
  }

  tr {
    color: white;
    background-color: #252E30 !important;
  }
  td {
    border-bottom: 1px solid rgba(132,145,147, 0.3);
  }

  th, td {
    padding: 0.4rem;
  }
  .header__id {
    width: 5rem;
  }
  .header__measure {
    color: white;
    font-size: 1rem;
  }
  .children td.expandable {
    background-color: #2B3437;
    color: #849193;
  }
  .children td {
    border: none;
    opacity: .7;
  }

  th.active {
    color: #fff;
  }

  th.active .arrow {
    opacity: 1;
  }
  tr.children.odd {
    background-color: #333D40;
  }
  tr.children.even {
    background-color: #3B484B;
  }
  tr.children {
    background-color: #2b3437;
  }
  .tree__header {
    color: #849193;
    text-align: right;
    padding-right: 1rem;
  }
  .number--highlight {
    color: #00fff0;
  }
  .table__empty {
    padding-left: 1rem;
    padding-right: 1rem;
  }
  .table__empty--lg {
    padding-left: 1.5rem;
    padding-right: 1.5rem;
  }
  .body__empty {
    background-color: #2B3437;
    border: none;
  }
</style>
