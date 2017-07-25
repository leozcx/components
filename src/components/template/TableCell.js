export default {
  name: 'table-cell',
  props: {
    renderContent: Function,
    scope: Object,
    prop: String,
    userInfo: Object,
    option: Object
  },
  render (h) {
    const prop = this.prop
    const scope = this.scope
    const userInfo = this.userInfo
    return (
      this.renderContent ? this.renderContent.call(this._renderProxy, h, { row: scope.row, userInfo: userInfo }) : (
        <span>{ scope.row[prop] }</span>
      )
    )
  }
}
/*
          <template scope="scope">
            <table-cell :renderContent="col.render" :scope="scope" :prop="col.prop" :userInfo="userInfo" :option="col">
            </table-cell>
          </template>
          */
