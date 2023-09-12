/**
 * @license Copyright 2018 DENSO
 * 
 * unitBadges Reactコンポーネント
 * 
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';

/**
 * ラック搭載図に表示するユニットのステータスなどのバッチコンポーネント
 * @param {object} unitView 表示ユニット情報
 */
export default class UnitBadges extends Component {
    
    /**
     * render
     */
    render() {
        return (
            <span className="unit-badge" >
                {this.makeUnitBadges()}
            </span>
        );
    }

    /**
     * ユニットのバッチを作成する
     * @returns {array} 表示するバッチ群
     */
    makeUnitBadges(){
        const { unitView } = this.props;
        const { status, hasAlarm, alarmName, units } = unitView;
        const isMultiple = units && units.length >= 2; 
        var badges = [];
        
        //ステータス + 複数ユニットかどうか
        badges.push(<span className={isMultiple?'fa fa-check text-black':''} style={{backgroundColor: status.color}} ></span>);
        
        //アラート
        if (hasAlarm === true){
            badges.push(<span className={'fa fa-exclamation ' + this.getAlarmClass(alarmName)} ></span>);
        }

        return badges;
    }

    getAlarmClass(alarmName) {
        var prefixAlarmClass = 'alert-';
        switch (alarmName) {
            case 'error':
                return prefixAlarmClass + 'danger';
            case 'warn':
                return prefixAlarmClass + 'warning';
            default:
                return '';
        }
    }
}

UnitBadges.propTypes = { 
    unitView: PropTypes.shape({
        status: PropTypes.shape({
            color: PropTypes.string.isRequired
        }).isRequired,
        hasAlarm: PropTypes.bool,
        alarmName: PropTypes.string,
        units: PropTypes.arrayOf(PropTypes.shape({
            unitId: PropTypes.string.isRequired,
            unitNo: PropTypes.number.isRequired,
            name: PropTypes.string.isRequired,
            type: PropTypes.shape({
                name: PropTypes.string.isRequired
            }),
            position: PropTypes.shape({
                x: PropTypes.number.isRequired,
                y: PropTypes.number.isRequired
            }).isRequired,
            size: PropTypes.shape({
                height: PropTypes.number.isRequired,
                width: PropTypes.number.isRequired
            }).isRequired,
            links: PropTypes.arrayOf(PropTypes.shape({
                title: PropTypes.string.isRequired,
                url: PropTypes.string.isRequired
            }))
        }))
    }),
}