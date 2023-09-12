/**
 * Copyright 2017 DENSO Solutions
 * 
 * Accordion Reactコンポーネント
 * 
 * <Accordion>
 *     <Accordion.Item>
 *         <Accordion.ItemHeader>...itemheader</Accordion.ItemHeader>
 *         <Accordion.ItemBody>...itembody</Accordion.ItemBody>
 *     </Accordion.Item>
 *     <Accordion.Item>
 *         <Accordion.ItemHeader>...itemheader</Accordion.ItemHeader>
 *         <Accordion.ItemBody>...itembody</Accordion.ItemBody>
 *     </Accordion.Item>
 * </Accordion>
 *  
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {  } from 'react-bootstrap';

import AccordionItem from './AccordionItem';
import AccordionItemHeader from './AccordionItemHeader';
import AccordionItemBody from './AccordionItemBody';


/**
 * Accordion
 * @param {string} className クラス
 */
export default class Accordion extends Component {

    constructor(props) {
        super(props);
        this.state = {
            activeItems: this.preExpandedItems(),
        }

        this.renderItems = this.renderItems.bind(this)
    }

    preExpandedItems() {
        let activeItems = []
        React.Children.map(this.props.children, (item, index) => {
            if (item.props.expanded) {
                activeItems.push(item.props.customKey || index);
            }
        })
        if (activeItems.length === 0 && this.props.activeItems.length !== 0) {
            activeItems = this.props.activeItems.slice();
        }

        return activeItems
    }

    handleClick(key) {
        let activeItems = this.state.activeItems.slice()
        const index = activeItems.indexOf(key)
        const isActive = (index > -1)
        if (isActive) {
            activeItems.splice(index, 1);
        } else {
            activeItems.push(key);
        }
        this.setState({ activeItems: activeItems });

        this.props.onChange(activeItems);
    }

    renderItems() {
        const { children } = this.props;

        return React.Children.map(children, (item, index) => {
            let key = item.props.customKey || index;
            key = `accordion__item-${key}`;
            const expanded = (this.state.activeItems.indexOf(key) !== -1);

            return React.cloneElement(item, {
                expanded: expanded,
                key: key,
                id: key,
                onClick: this.handleClick.bind(this, key),
            })
        })

    }

    /**
     * render
     */
    render() {
        const { className } = this.props;
        const classes = {
            "accordion": true
        }

        return (
            <div className={classNames(className, classes)}>
                {this.renderItems()}
            </div>
        );
    }
}

Accordion.propTypes = {
    className: PropTypes.string,
    activeItems: PropTypes.array,
    children: PropTypes.node,
    onChange: PropTypes.func,
};

Accordion.defaultProps = {
    className: '',
    activeItems: [],
    onChange: () => {} 
}


Accordion.Item = AccordionItem
Accordion.ItemHeader = AccordionItemHeader
Accordion.ItemBody = AccordionItemBody
