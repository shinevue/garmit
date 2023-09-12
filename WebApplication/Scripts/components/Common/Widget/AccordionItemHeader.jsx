/**
 * Copyright 2017 DENSO Solutions
 * 
 * AccordionItemHeader Reactコンポーネント
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
export default class AccordionItemHeader extends Component {
    static accordionElementName = 'AccordionItemHeader';

    constructor(props) {
        super(props)
    }

    /**
     * render
     */
    render() {
        const { id, expanded, ariaControls, onClick, children, className } = this.props;
        const classes = {
            "accordion__header": true
        }

        return (
            <div
                id={id}
                aria-expanded={expanded}
                aria-controls={ariaControls}　// aria-expandedのターゲット ?
                onClick={onClick}
                role="button"
                className={classNames(className, classes)}
            >
                {expanded ?
                    <i className="fal fa-caret-up mr-1" aria-hidden="true"></i>
                    : <i className="fal fa-caret-down mr-1" aria-hidden="true"></i>
                }
                {children}
            </div>
        );
    }
}

AccordionItemHeader.propTypes = {
    className: PropTypes.string,
    id: PropTypes.string,
    expanded: PropTypes.boolean,
    onClick: PropTypes.func,
    ariaControls: PropTypes.string,
    children: PropTypes.node
};

AccordionItemHeader.Title = {
    className: '',
    id: '',
    expanded: false,
    onClick: () => {},
    ariaControls: ''
}