/**
 * @license Copyright 2020 DENSO
 *
 * IncidentLogSetting Reactコンポーネント
 *
 */

'use strict';

import React, { Component } from 'react';
import { SettingWidget } from "Assets/Widget/Widget";

/**
 * IncidentLogSetting
 * @param {string} title パネルタイトル
 */
export default class IncidentLogSetting extends Component {

    /**
     * render
     */
    render() {
        return (
            <div className="dashboard-item" data-dashboard-function-name="incidentLog">
                <SettingWidget title={this.props.title} hasSetting={false} />
            </div>
        );
    }
}

IncidentLogSetting.defaultProps = {
    title: 'インシデントログ',
};