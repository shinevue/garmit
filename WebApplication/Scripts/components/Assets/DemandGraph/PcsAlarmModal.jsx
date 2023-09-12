'use strict';

import React, { Component } from 'react';
import { connect } from 'react-redux';

import PropTypes from 'prop-types';

import { Modal, Table } from 'react-bootstrap';

import Button from 'Common/Widget/Button';
import Icon from 'Common/Widget/Icon';

export default class PcsAlarmModal extends Component {

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
        const { show, pcsAlarmItems } = this.props;

        return (
            <Modal bsSize="lg" show={show} backdrop="static" onHide={() => this.onHide()}>
                <Modal.Header closeButton>
                    <Modal.Title>アラーム一覧</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {pcsAlarmItems &&
                        <Table bordered responsive>
                            <thead>
                                <tr>
                                    <th>機器</th>
                                    <th>エラー種別</th>
                                    <th>発生日時</th>
                                    <th>復旧日時</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pcsAlarmItems.map((item, i) =>
                                    <tr key={i}>
                                        <td>{item.gateName}</td>
                                        <td>{item.errorType}</td>
                                        <td>{item.occurTime}</td>
                                        <td>{item.recoverTime}</td>
                                    </tr>
                                )}
                            </tbody>
                        </Table>
                    }
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={() => this.onHide()}>閉じる</Button>
                </Modal.Footer>
            </Modal>
        );
    }
}