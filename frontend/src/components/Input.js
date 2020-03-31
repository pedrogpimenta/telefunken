import React, { Component } from 'react'

// Making the App component
class Input extends Component {
  render() {
    return (
      <input
        className="border border-solid border-teal-400 rounded py-1 px-2"
        id={this.props.id}
        type={this.props.text}
        placeholder={this.props.placeholder}
        value={this.props.username}
        onChange={this.props.onChange}
      />
    )
  }
}

export default Input
