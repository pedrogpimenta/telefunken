import React, { Component } from 'react'

// Making the App component
class Button extends Component {
  render() {
    var attributes = {}
    attributes['disabled'] = this.props.disabled ? 'disabled' : null

    const disabledClasses = this.props.disabled ? 'opacity-50 cursor-not-allowed' : ''
    const classes = `border border-solid border-teal-600 hover:border-teal-400 bg-teal-600 hover:bg-teal-400 text-white rounded py-1 px-8 ${disabledClasses}`
    const styles = this.props.classes ? classes + ' ' + this.props.classes : classes

    return (
      <button
        {...attributes}
        className={styles}
        onClick={this.props.onClick}
      >
        {this.props.children}
      </button>
    )
  }
}

export default Button
