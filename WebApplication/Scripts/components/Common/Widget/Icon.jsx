/**
 * Copyright 2017 DENSO Solutions
 * 
 * Iconコンポーネント
 * 
 */
'use strict';

import React, { Component } from 'react';

/**
 * Iconコンポーネント
 * @param className class
 */
export default class Icon extends Component {

    /**
     * render
     */
    render() {
        return (
            <i className={this.props.className} 
               onClick={() => this.handleClick()}
               onMouseDown={() => this.handleMouseDown()} 
               onMouseUp={() => this.handleMouseUp()} 
               onMouseLeave={() => this.handleMouseLeave()}
               onTouchStart={() => this.handleTouchStart()}
               onTouchEnd={() => this.handleTouchEnd()} 
            >
                {this.props.children}
            </i>
        );
    }

    handleClick(){
        if (this.props.onClick) {
            this.props.onClick();
        }
    }

    handleMouseDown() {
        if (this.props.onMouseDown) {
            this.props.onMouseDown();
        }
    }
    
    handleMouseUp() {
        if (this.props.onMouseUp) {
            this.props.onMouseUp();
        }
    }

    handleMouseLeave() {
        if (this.props.onMouseLeave) {
            this.props.onMouseLeave();
        }
    }

    handleTouchStart() {
        if (this.props.onTouchStart) {
            this.props.onTouchStart();
        }
    }
    
    handleTouchEnd() {
        if (this.props.onTouchEnd) {
            this.props.onTouchEnd();
        }
    }
}
