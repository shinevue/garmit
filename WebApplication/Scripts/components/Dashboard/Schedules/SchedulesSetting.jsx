/**
 * @license Copyright 2020 DENSO
 *
 * SchedulesSetting Reactコンポーネント
 *
 */

'use strict';

import React, { Component } from 'react';
import { SettingWidget } from "Assets/Widget/Widget";

/**
 * SchedulesSetting
 * @param {string} title パネルタイトル
 */
export default class SchedulesSetting extends Component {

    /**
     * render
     */
    render() {
        return (
            <div className="dashboard-item" data-dashboard-function-name="schedules">
                <SettingWidget title={this.props.title} hasSetting={false} />
            </div>
        );
    }
}

SchedulesSetting.defaultProps = {
    title: '作業スケジュール',
};