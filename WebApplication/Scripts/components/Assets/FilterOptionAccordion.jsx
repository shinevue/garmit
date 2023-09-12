/**
 * Copyright 2017 DENSO Solutions
 * 
 * FilterOptionAccordion Reactコンポーネント
 *  
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Checkbox } from 'react-bootstrap'; 

import Accordion from 'Common/Widget/Accordion';
import CheckboxList from 'Common/Widget/CheckboxList';

export default class FilterOptionAccordion extends Component {

    constructor(props) {
        super(props)
        this.state = {

        }
    }

    makeAccordionItems() {
        const { dataTypes, checkedDataTypes, incidentTypes, checkedIncidentTypes, incidentState, alarmOccuringOnly } = this.props;

        let accordionItems = [];

        if (dataTypes) {
            accordionItems.push(
                <Accordion.Item>
                    <Accordion.ItemHeader>
                        データ種別
                        </Accordion.ItemHeader>
                    <Accordion.ItemBody>
                        <CheckboxList
                            items={dataTypes.map((dataType) => {
                                return { key: dataType.dtType, name: dataType.name }
                            })}
                            checkedItems={checkedDataTypes}
                            useAll={true}
                            onChange={this.props.checkedDataTypesChanged}
                        />
                    </Accordion.ItemBody>
                </Accordion.Item>
            )
        }

        if (incidentTypes) {
            accordionItems.push(
                <Accordion.Item>
                    <Accordion.ItemHeader>
                        インシデント種別
                        </Accordion.ItemHeader>
                    <Accordion.ItemBody>
                        <CheckboxList
                            items={incidentTypes.map((incidentType) => {
                                return { key: incidentType.alarmType, name: incidentType.name }
                            })}
                            checkedItems={checkedIncidentTypes}
                            useAll={true}
                            onChange={this.props.checkedIncidentTypesChanged}
                        />
                    </Accordion.ItemBody>
                </Accordion.Item>
            )
        }

        if (incidentState) {
            accordionItems.push(
                <Accordion.Item>
                    <Accordion.ItemHeader>
                        インシデント状態
                        </Accordion.ItemHeader>
                    <Accordion.ItemBody>
                        <Checkbox
                            className="mtb-0"
                            checked={alarmOccuringOnly}
                            onClick={this.props.alarmOccuringOnlyChanged}
                        >
                            アラーム発生中のみ
                        </Checkbox>
                    </Accordion.ItemBody>
                </Accordion.Item>
            )
        }

        return accordionItems;
    }

    /**
     * render
     */
    render() {
        return (
            <Accordion>
                {this.makeAccordionItems()}
            </Accordion>
        )
    }
}

FilterOptionAccordion.propTypes = {
    modal: PropTypes.element,
    onFocusTextBox: PropTypes.func,
    onRemoveClick: PropTypes.func,
    searchTargets: PropTypes.object,
    readOnly: PropTypes.bool
}