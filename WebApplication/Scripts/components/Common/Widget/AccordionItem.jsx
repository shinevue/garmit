/**
 * Copyright 2017 DENSO Solutions
 * 
 * AccordionItem Reactコンポーネント
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
import { } from 'react-bootstrap';

/**
 * AccordionItem
 * @param {bool} expanded 初期状態で開いているか
 * @param {string} customKey キー
 * @param {string} className クラス
 */
export default class AccordionItem extends Component {

    constructor(props) {
        super(props);
        this.state = {

        }

        this.renderChildren = this.renderChildren.bind(this);
    }

    renderChildren() {
        const { expanded, children, onClick, id } = this.props

        return React.Children.map(children, (item) => {
            const itemProps = {};

            if (item.type.accordionElementName === 'AccordionItemHeader') {
                itemProps.expanded = expanded;
                itemProps.onClick = onClick;
                itemProps.key = "header";
                itemProps.id = id.replace('accordion__item-', 'accordion__header-');
                itemProps.ariaControls = id.replace('accordion__item-', 'accordion__body-')

                return React.cloneElement(item, itemProps);
            } else if (item.type.accordionElementName === 'AccordionItemBody') {
                itemProps.expanded = expanded;
                itemProps.key = "body";
                itemProps.id = id.replace('accordion__item-', 'accordion__body-');

                return React.cloneElement(item, itemProps);
            }

            return item;
        });
    }


    /**
     * render
     */
    render() {
        const { className } = this.props;
        const classes = {
            "accordion__item": true
        }

        return (
            <div className={classNames(className, classes)}>
                {this.renderChildren()}
            </div>
        );
    }
}

AccordionItem.propTypes = {
    className: PropTypes.string,
    expanded: PropTypes.bool,
    onClick: PropTypes.func,
    children: PropTypes.node,
    key: PropTypes.string,
    id: PropTypes.string
};

AccordionItem.defaultProps = {
    className: '',
    expanded: false,
    onClick: () => {},
    key: ''
}
