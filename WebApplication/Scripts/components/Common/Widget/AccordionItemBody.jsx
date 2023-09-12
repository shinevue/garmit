/**
 * Copyright 2017 DENSO Solutions
 * 
 * AccordionItemBody Reactコンポーネント
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
 * Accordion
 * @param {string} className クラス
 */
export default class AccordionItemBody extends Component {
    static accordionElementName = 'AccordionItemBody';

    constructor(props) {
        super(props)
    }


    /**
     * render
     */
    render() {
        const { id, expanded, children, className } = this.props;
        const classes = {
            "accordion__body": true
        }
        const ariaHidden = !expanded;

        return (
            <div
                id={id}
                aria-hidden={ariaHidden}
                aria-labelledby={id.replace('accordion__body-', 'accordion__header-')}
                className={classNames(className, classes)}
            >
                {children}
            </div>
        );
    }
}

AccordionItemBody.propTypes = {
    className: PropTypes.string,
    id: PropTypes.string,
    expanded: PropTypes.bool,
    children: PropTypes.node,
};

AccordionItemBody.defaultProps = {
    className: '',
    id: '',
    expanded: false
}