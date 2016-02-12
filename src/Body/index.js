import React, { PropTypes } from 'react'
import { findDOMNode } from 'react-dom'
import Component from 'react-class'
import { Item } from 'react-flex'
import getDataRangeToRender from './getDataRangeToRender'
import assign from 'object-assign'
import join from '../utils/join'

import EmptyText from './EmptyText'

import Scroller from './Scroller'
import ColumnGroup from './ColumnGroup'

class Body extends Component {

  constructor(props){
    super(props)

    this.state = {
      bodyHeight: 0,
      scrollTop: 0,
      overRowId: null
    }
  }
  
  componentDidMount(){
    this.setBodyHeight()
  }

  // todo func getBodyHeight
  render(){
    const props = this.props
    const {data, columns} = props
    const {loading} = props
    const className = join(
        'react-datagrid__body'
      )

    return <Item 
      {...props} 
      flex 
      column 
      className={className}
      data={null}
      ref="body"
    >
      {props.resizeTool}
      {!loading && this.renderScroller()}
    </Item>
  }

  renderScroller(){
    const props = this.props
    const {
      data, 
      contentHeight
    } = props

    if (!data) {
      console.error(
          `Something went wrong with dataSource, most likely loading prop is set to false, and promise did not resolve` 
        )
      return
    }

    return <Scroller 
      contentHeight={contentHeight}
      onScroll={this.onScroll}
      ref="scroller"
    >
      {this.renderColumnGroups()}
    </Scroller>
  }

  renderColumnGroups(){
    const props = this.props
    const {
      data,
      columns,
      rowHeight,
      contentHeight,
      renderRow,
      rowProps,
      selected,
      isMultiselect,
      hasSelection,
      onRowClick
    } = props

    const bodyHeight = this.state.bodyHeight
    const scrollTop = this.state.scrollTop
    const {from, to} = getDataRangeToRender(bodyHeight, rowHeight, scrollTop)
    const offsetTop = from * rowHeight
    const columnGrupHeight = bodyHeight + (scrollTop - offsetTop)

    const columnGroupProps = {
      data,
      offsetTop,
      scrollTop,
      rowHeight,
      isMultiselect,
      hasSelection,
      rowProps,
      from,
      to,
      renderRow,
      selected,
      viewportHeight: bodyHeight,
      globalProps: props,
      height: columnGrupHeight,
      onRowMouseEnter: this.onRowMouseEnter,
      onRowMouseLeave: this.onRowMouseLeave,
      onRowClick: onRowClick, 
      overRowId: this.state.overRowId
    }

    /**
     * If no coumnGroup is specified, create a ColumGroup with all passed columns
     */
    if (!props.children) {
      return <ColumnGroup 
        {...columnGroupProps} 
        columns={columns} 
        width={'100%'}
      />  
    } else {
    /**
     * Children are specified, take each Columngroup and insert props
     */
      return React.Children.map(props.children, (child, index) => {
         return React.cloneElement(
            child, 
            assign(
              {}, 
              child.props, 
              columnGroupProps,
              { key: index }
            )
          )
      })
    }
  }

  onRowMouseEnter(event, rowProps){
    this.setState({
      overRowId: rowProps.id
    })

    this.props.onRowMouseEnter(event, rowProps)
  }

  onRowMouseLeave(event, rowProps){
    // remove id if still present
    if (this.state.overRowId === rowProps.id) {
      this.setState({
        overRowId: null 
      })
    }

    this.props.onRowMouseLeave(event, rowProps)
  }

  onScroll(scrollTop, event){  
    this.setState({
        scrollTop
    })

    // There is an error of one pixel in chrome, add -2 to be safe
    if (this.props.contentHeight - 2 <= scrollTop + this.state.bodyHeight) {
      this.props.onScrollBottom()
    }

    if (this.props.onScroll) {
      this.props.onScroll(scrollTop, event)
    }
  }

  onResize(){
    this.setBodyHeight()
  }

  setBodyHeight(){
    const bodyNode = findDOMNode(this.refs.body)
    let bodyHeight

    if (bodyNode) {
      bodyHeight = bodyNode.offsetHeight
    } else {
      bodyHeight = 0
    }

    this.setState({
      bodyHeight: bodyHeight
    })
  }
}

Body.defaultProps = {
  rowHeight: 40,
  onRowMouseEnter: () => {},
  onRowMouseLeave: () => {},
  onScrollBottom: () => {}
}

Body.propTypes = {
  loading: PropTypes.bool,
  onScroll: PropTypes.func,
  onRowMouseEnter: PropTypes.func,
  onRowMouseLeave: PropTypes.func,
  onScrollBottom: PropTypes.func
}

import resizeNotifier from 'react-notify-resize'

export default resizeNotifier(Body)