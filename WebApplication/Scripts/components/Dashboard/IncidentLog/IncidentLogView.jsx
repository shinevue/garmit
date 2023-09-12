/**
 * @license Copyright 2020 DENSO
 *
 * IncidentLogView Reactコンポーネント
 *
 */

'use strict';

import React, { Component } from 'react';
import { Panel } from "react-bootstrap";
import SearchResultTable from "Assets/SearchResultTable";

/**
 * IncidentLogView
 * @param {string} title パネルタイトル
 * @param {object} incidentLog インシデントログのオブジェクト
 * @param {function} onInit 初期化時のコールバック関数
 */
export default class IncidentLogView extends Component {

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
        const { incidentLog } = this.props;

        if (!incidentLog) {
            return null;
        }
        return (
            <div className="dashboard-item">
                <Panel header={this.props.title}>
                    <SearchResultTable
                        searchResult={incidentLog}
                        useCheckbox={false}
                        lengthSelect={false}
                        noFooter={true}
                    />
                    <div className="text-right mt-1">
                        <a href="/IncidentLog" className="btn btn-garmit-incident-log">インシデントログ</a>
                    </div>
                </Panel>
            </div>
        );
    }
}

IncidentLogView.defaultProps = {
    title: 'インシデントログ',
};