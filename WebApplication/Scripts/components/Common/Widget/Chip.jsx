'use strict';

import React, { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Chip
 * @param {string} name
 * @param {bool} removeButton
 * @param {func} onRemoveClick
 */
export default class Chip extends Component {

    constructor() {
        super();
        this.state = {

        }
    }

    onRemoveClick(e) {
        e.stopPropagation();
        this.props.onRemoveClick();
    }

    onClick(e) {
        e.stopPropagation();
        this.props.onClick();
    }

    render() {
        const { name, removeButton, onClick, selected, disabled, className, style } = this.props
        const classes = {
            chip: true,
            selected: selected,
            disabled: disabled
        }
        return (
            <span className={classNames(classes, className)} style={style} >
                <span onClick={(e) => this.onClick(e)}>{name}</span>
                {removeButton &&
                    <span className="chip-remove-button" onClick={(e) => this.onRemoveClick(e)}>
                        <i class="material-icons">delete_forever</i>
                    </span>
                }
            </span>
        );
    }
}

Chip.propTypes = {
    name: PropTypes.string,
    removeButton: PropTypes.bool,
    className:PropTypes.string,
    onRemoveClick: PropTypes.func,
    onClick: PropTypes.func
}

Chip.defaultProps = {
    name: "",
    removeButton: false,
    onRemoveClick: () => { },
    onClick: () => { }
}