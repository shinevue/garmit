/**
 * Copyright 2017 DENSO Solutions
 * 
 * 計測値表示ラベル Reactコンポーネント
 *  
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Row, Col, OverlayTrigger, Tooltip } from 'react-bootstrap';
import Icon from 'Common/Widget/Icon';

/**
 * 計測値表示ラベル
 */
export default class PointValueDispLabel extends Component {

    /**
     * コンポーネントをアップデートするかどうか
     */
    shouldComponentUpdate(nextProps) {
        if (nextProps !== this.props) {
            return true;
        }
    }

    /**
     * componentDidMount
     */
    componentDidMount() {
        this.setTooltip();
    }

    /**
     * componentDidUpdate
     */
    componentDidUpdate() {
        this.setTooltip();
    }

    setTooltip() {
        var items = $('.value-label .ellipsis-container');
        items && items.map((item) => {
            if (item.offsetWidth > item.scrollWidth) {

            }
        })

    }

    /**
     * render
     */
    render() {
        const { displayString, scaledValue, unconvertedValue, unconvertedUnit, format: formatString, unconvertedFormatString, unit, dispOnly, alarmClassName, valueClassName, isConvert } = this.props;
        const value = this.getValue(displayString, scaledValue, formatString);
        const optionalValue = isConvert && this.getOptionalValue(unconvertedValue, unconvertedFormatString);
        const buttonTooltip = (
            <Tooltip>詳細</Tooltip>
        );
        return (
            <div className={classNames("value-label", dispOnly ? "flex-center" : "flex-between-end")} >
                <div className="flex-bottom">
                    <div className={classNames(valueClassName, "text-" + (this.getAlarmClassName(alarmClassName)))}>
                        <strong className="pa-r-2">{value ? value : ' ― '}</strong>
                    </div>
                    {unit && <span>{displayString ? null : unit}</span>}
                    {isConvert && unconvertedValue &&
                        <div className="flex-bottom">
                            <span>(</span>
                            <div className={classNames( valueClassName, "text-" + (this.getAlarmClassName(alarmClassName)))}>
                            <strong className="pa-r-1 pa-l-1">{optionalValue ? optionalValue : ' ― '}</strong>
                            </div>
                            <span>{unconvertedUnit && unconvertedUnit}</span>
                            <span>)</span>
                        </div>
                    }
                </div>
                {!dispOnly &&
                    <div style={{ flexBasis: "30px" }} className="flex-center">
                        <OverlayTrigger placement="bottom" overlay={buttonTooltip}>
                            <Icon
                                className="icon-garmit-detail hover-icon"
                                style={{ color: "black" }}
                                onClick={(e) => this.props.onClick(e)}
                            />
                        </OverlayTrigger>
                    </div>
                }
            </div>
        );
    }

    /**
     * 表示する値を取得
     */
    getValue(displayString, scaledValue, formatString) {
        if (displayString) {
            return displayString;
        }
        else {
            return (scaledValue || scaledValue === 0) && formatString ? format(formatString, scaledValue) : scaledValue;
        }
    }

    /**
     * 表示する値を取得(換算値表示時の通常の値)
     */
    getOptionalValue(unconvertedValue, unconvertedFormatString) {
        return unconvertedValue && unconvertedFormatString ? format(unconvertedFormatString, unconvertedValue) : unconvertedValue;
    }

    /**
     * アラームクラス名称を取得
     * @param {any} alarmClassName
     */
    getAlarmClassName(alarmClassName) {
        switch (alarmClassName) {
            case 'error':
                return 'danger';
            case 'warn':
                return 'warning';
            default:
                return 'success';
        }
    }
}

PointValueDispLabel.propTypes = {
    displayString: PropTypes.string,                         //オンメッセージオフメッセージ
    scaledValue: PropTypes.number,                           //計測値(displayStringがnullの場合に使用)
    unconvertedValue: PropTypes.number,                      //計測値（常に換算されていないの値が入る）
    format: PropTypes.string,                                //フォーマット
    unit: PropTypes.string,                                  //単位（通常の単位or換算値の単位）
    unconvertedUnit: PropTypes.string,                       //換算していない場合の単位
    unconvertedFormatString: PropTypes.string,               //換算していない場合のフォーマット
    valueClassName: PropTypes.string,                        //計測値カラムに設定するクラス名称
    alarmClassName: PropTypes.oneOf(['error', 'warn']),      //アラーム状態を表すクラス名称
    dispOnly: PropTypes.bool,                                //設定アイコンを非表示にするか
    isConvert: PropTypes.bool,                               //換算値表示かどうか
    onClick: PropTypes.func                                  //クリックイベント関数
};

