'use strict';

import React, { Component } from 'react';
import { connect } from 'react-redux';

import PropTypes from 'prop-types';

import { Modal } from 'react-bootstrap';

import Button from 'Common/Widget/Button';

import DemandGraph from 'Assets/DemandGraph/DemandGraph';

export default class DetailGraphModal extends Component {

    constructor(props) {
        super(props);
        this.state = {

        };
    }

    /**
     * 閉じるボタンクリックイベント
     */
    onHide() {
        if (this.props.onHide) {
            this.props.onHide();
        }
    }

    /**
     * render
     */
    render() {
        const { show, detailGraph, measuredDataType, displayTimeSpanId } = this.props;

        return (
            <Modal bsSize="lg" show={show} backdrop="static" onHide={() => this.onHide()}>
                <Modal.Header closeButton>
                    <Modal.Title>詳細グラフ</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {detailGraph.graphParameters.map((graphParameter, i) =>
                        <DemandGraph
                            key={i}
                            graphParameter={graphParameter}
                            measuredDataType={measuredDataType}
                            displayTimeSpanId={displayTimeSpanId}
                            isArea={detailGraph.isArea}
                            startDate={detailGraph.startDate}
                            endDate={detailGraph.endDate}
                            showBarBorder={true}
                        />
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={() => this.onHide()}>閉じる</Button>
                </Modal.Footer>
            </Modal>
        );
    }
}