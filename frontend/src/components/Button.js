import React, { Component } from 'react'

// Making the App component
class Button extends Component {
  render() {

    const classes = "border border-solid border-teal-600 hover:border-teal-400 bg-teal-600 hover:bg-teal-400 text-white rounded py-1 px-8"
    const styles = this.props.classes ? classes + ' ' + this.props.classes : classes

    return (
      <button
        className={styles}
        onClick={this.props.onClick}
      >
        {this.props.children}
      </button>
    )
  }
}

export default Button
