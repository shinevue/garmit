/**
 * @license Copyright 2020 DENSO
 *
 * OperationLogView Reactコンポーネント
 *
 */
'use strict';

import React, { Component } from 'react';
import { Panel } from "react-bootstrap";
import SearchResultTable from "Assets/SearchResultTable";

/**
 * IncidentLogView
 * @param {string} title パネルタイトル
 * @param {object} operationLog オペレーションログのオブジェクト
 * @param {function} onInit 初期化時のコールバック関数
 */
export default class OperationLogView extends Component {

    constructor() {
        super();
        this.state = {

        };
    }

    componentDidMount() {
        this.props.onInit && this.props.onInit();
    }

    /**
     * render
     */
    render() {
        const { operationLog } = this.props;

        if (!operationLog) {
            return null;
        }
        return (
            <div className="dashboard-item">
                <div className="operation-log">
                    <Panel header={this.props.title}>
                        <SearchResultTable
                               searchResult={operationLog}
                               useCheckbox={false}
                               lengthSelect={false}
                               noFooter={true}
                        />
                        <div className="text-right mt-1">
                            <a href="/OperationLog" className="btn btn-garmit-category-operation-log">オペレーションログ</a>
                        </div>
                    </Panel>
                </div>
            </div>
        );
    }
}

OperationLogView.defaultProps = {
    title: 'オペレーションログ',
};