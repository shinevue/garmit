'use strict';

import React, { Component } from 'react';
import { connect } from 'react-redux';

import PropTypes from 'prop-types';

import { Modal, Button, ButtonToolbar } from 'react-bootstrap';

import DemandGraph from 'Assets/DemandGraph/DemandGraph';
import ToggleSwitch from 'Common/Widget/ToggleSwitch';
import CheckboxSwitch from 'Common/Widget/CheckboxSwitch';

export default class DemandGraphModal extends Component {

    constructor() {
        super();
        this.state = {
            
        };
    }

    /**
     * 閉じるをクリックされた時
     */
    onHide() {
        this.props.onHide();
    }

    /**
     * デマンドグラフ種別が変更された時
     * @param {any} val
     */
    onChangeDisplayGraphType(val) {
        if (val != this.props.displayGraphType) {
            this.props.onChangeDisplayGraphType(val);
        }
    }

    /**
     * グラフモードが変更された時
     * @param {any} val
     */
    onChangeDemandGraphMode(val) {
        if (val != this.props.demandGraphMode) {
            this.props.onChangeDemandGraphMode(val);
        }
    }

    /**
     * render
     */
    render() {
        const { show, demandGraph, measuredDataType, displayTimeSpanId, displayGraphType, demandGraphMode, isPvEnergyLapped, isLoading } = this.props;

        const maxAxisCount = demandGraph && demandGraph.graphParameters.reduce((max, cur) => Math.max(max, cur.yAxes.length), 0);

        return (
            <Modal bsSize="lg" show={show} backdrop="static" onHide={() => this.onHide()}>
                <Modal.Header closeButton>
                    <Modal.Title>デマンドグラフ</Modal.Title>
                </Modal.Header>
                <Modal.Body className="overlay-wrapper">
                    <ButtonToolbar className="mb-2">
                        <ToggleSwitch
                            bsSize="xs"
                            value={displayGraphType}
                            name="displayGraphType"
                            swichValues={[
                                { value: 1, text: 'デマンド' },
                                { value: 2, text: '電力量' }
                            ]}
                            onChange={(val) => this.onChangeDisplayGraphType(val)}
                        />
                        {displayGraphType == 2 &&
                            <ToggleSwitch
                                bsSize="xs"
                                value={demandGraphMode}
                                name="demandGraphMode"
                                swichValues={[
                                    { value: 1, text: 'エリア内訳' },
                                    { value: 2, text: '用途別' }
                                ]}
                                onChange={(val) => this.onChangeDemandGraphMode(val)}
                            />
                        }
                        {displayGraphType == 2 &&
                            <CheckboxSwitch
                                text="発電量を重ねて表示"
                                bsSize="xs"
                                checked={isPvEnergyLapped}
                                onChange={(val) => this.props.onChangeIsPvEnergyLapped(val)}
                            />
                        }
                    </ButtonToolbar>
                    {demandGraph && demandGraph.graphParameters.map((graphParameter) => 
                        <DemandGraph
                            graphParameter={graphParameter}
                            measuredDataType={measuredDataType}
                            displayTimeSpanId={displayTimeSpanId}
                            isArea={demandGraph.isArea}
                            paddingRight={maxAxisCount * 80}
                            startDate={demandGraph.startDate}
                            endDate={demandGraph.endDate}
                        />
                    )}
                    {isLoading && <div className="overlay"><i className="fa fa-sync-alt fa-spin"></i></div>}
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={() => this.onHide()}>閉じる</Button>
                </Modal.Footer>
            </Modal>
        );
    }
}