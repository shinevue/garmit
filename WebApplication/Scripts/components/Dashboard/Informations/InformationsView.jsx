/**
 * @license Copyright 2020 DENSO
 *
 * InformationsView Reactコンポーネント
 *
 */

'use strict';

import React, { Component } from 'react';
import {Panel, ListGroup, ListGroupItem, Button, Modal} from "react-bootstrap";

const DEFAULT_ITEM_COUNT = 5;

/**
 * InformationsView
 * @param {string} title パネルタイトル
 * @param {object} informations お知らせのリスト
 * @param {function} onInit 初期化時のコールバック関数
 */
export default class InformationsView extends Component {

    constructor() {
        super();
        this.state = {
            isModalShow: false
        };
    }

    /**
     * 最初のレンダリング時にクライアントに一度だけ呼び出されます。
     * Componentがレンダリングされた直後に呼び出されるメソッドです。
     * ここでsetStateを行うと、renderがもう一度呼び出されるためあまり行わないほうがよいです。
     */
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
        const currentTime = moment();

        // 表示条件を満たすものを抽出
        // ソート関数内で moment の演算が発生しないように s, e を使用
        const currentInformations = this.props.informations.map(
            item => Object.assign(
                {},
                item,
                {s: moment(item.startTime), e: moment(item.endTime) })
        ).filter(
            item => (currentTime >= item.s && currentTime <= item.e)
        ).sort(
            (a, b) => (a.s === b.s ? b.no - a.no : b.s - a.s)
        );
        const currentInformationCount = currentInformations.length;

        const informations = currentInformations.map(item => {
            return (
                <ListGroupItem>{item.message}</ListGroupItem>
            )
        });

        if (!informations.length) {
            return null;
        }

        return (
            <div className="dashboard-item">
                <div className="informations">
                    <Panel header={this.props.title}>
                        <ListGroup>
                            { informations.slice(0, DEFAULT_ITEM_COUNT) }
                        </ListGroup>
                        {
                            currentInformationCount > DEFAULT_ITEM_COUNT &&
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
                        { informations }
                    </Modal.Body>
                    <Modal.Footer>
                        <Button onClick={() => { this.hideModal() }}>閉じる</Button>
                    </Modal.Footer>
                </Modal>
            </div>
        );
    }
}

InformationsView.defaultProps = {
    title: 'お知らせ',
};