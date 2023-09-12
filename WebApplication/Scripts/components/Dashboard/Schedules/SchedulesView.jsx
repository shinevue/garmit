/**
 * @license Copyright 2020 DENSO
 *
 * SchedulesView Reactコンポーネント
 *
 */

'use strict';

import React, { Component } from 'react';
import {Panel, ListGroup, ListGroupItem, Button, Modal} from "react-bootstrap";

const DEFAULT_ITEM_COUNT = 5;

/**
 * SchedulesView
 * @param {string} title パネルタイトル
 * @param {object} schedules スケジュールのリスト
 * @param {function} onInit 初期化時のコールバック関数
 */
export default class SchedulesView extends Component {

    constructor() {
        super();
        this.state = {
            isModalShow: false
        };
    }

    componentDidMount() {
        this.props.onInit && this.props.onInit();
    }

    showModal() {
        this.setState({isModalShow: true});
    }

    hideModal() {
        this.setState({isModalShow: false});
    }
    /**
     * render
     */
    render() {
        const schedulesCount = this.props.schedules.length;
        const schedules = this.props.schedules.slice(0)
            .sort((a, b) => (a.index - b.index))
            .map(item => <ListGroupItem>{item.name}</ListGroupItem>);

        return (
            <div className="dashboard-item">
                <div className="schedules">
                    <Panel header={this.props.title}>
                        <ListGroup>
                            {schedules.slice(0, DEFAULT_ITEM_COUNT)}
                        </ListGroup>
                        {
                            schedulesCount > DEFAULT_ITEM_COUNT &&
                            <div className="text-right">
                                <Button className="btn btn-garmit-detail btn-link" onClick={() => { this.showModal(); }}>もっと見る</Button>
                            </div>
                        }
                    </Panel>
                </div>
                <Modal
                    show={this.state.isModalShow}
                    bsSize="lg"
                    onHide={() => { this.hideModal() }}
                >
                    <Modal.Header closeButton>
                        <Modal.Title>{this.props.title}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        { schedules }
                    </Modal.Body>
                    <Modal.Footer>
                        <Button onClick={() => { this.hideModal() }}>閉じる</Button>
                    </Modal.Footer>
                </Modal>
            </div>
        );
    }
}

SchedulesView.defaultProps = {
    title: '作業スケジュール',
};