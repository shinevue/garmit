'use strict';

import React, { Component } from 'react';
import { connect } from 'react-redux';

import { Button } from 'react-bootstrap';

export default class MoveButtonGroup extends Component {

    constructor(props) {
        super(props);
        this.state = {

        }
    }

    /**
     * render
     */
    render() {
        return (
            <div className={this.props.className}>
                <Button
                    style={{ marginRight: 5, width: 35 }}
                    onClick={() => this.props.onDoubleLeftClick()}
                >
                    <i className="fal fa-angle-double-left" />
                </Button>
                <Button
                    style={{ marginRight: 100, width: 35 }}
                    onClick={() => this.props.onLeftClick()}
                >
                    <i className="fal fa-angle-left" />
                </Button>
                <Button
                    style={{ marginRight: 5, width: 35 }}
                    onClick={() => this.props.onRightClick()}
                >
                    <i className="fal fa-angle-right" />
                </Button>
                <Button
                    style={{ width: 35 }}
                    onClick={() => this.props.onDoubleRightClick()}
                >
                    <i className="fal fa-angle-double-right" />
                </Button>
            </div>
        );
    }
}

MoveButtonGroup.propTypes = {
    onDoubleLeftClick: PropTypes.func,
    onLeftClick: PropTypes.func,
    onRightClick: PropTypes.func,
    onDoubleRightClick: PropTypes.func
}

MoveButtonGroup.defaultProps = {
    onDoubleLeftClick: () => { },
    onLeftClick: () => { },
    onRightClick: () => { },
    onDoubleRightClick: () => { },
}