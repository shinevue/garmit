/**
 * @license Copyright 2018 DENSO
 * 
 * unitToolButtons Reactコンポーネント
 * 
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { ButtonGroup } from 'react-bootstrap';
import UnitQuickLaunch from './UnitQuickLaunch';

/**
 * ラック図に表示するユニットのツールボタンコンポーネント
 * @param {array} units 搭載ユニット一覧
 * @param {boolean} isReadOnly 読み取り専用かどうか
 * @param {object} container ツールチップのコンテナ
 * @param {function} onButtonEventTrigger ツールチップを表示するボタンのイベントが発生したときに呼び出す（ポップアップ用）
 */
export default class UnitToolButtons extends Component {
    
    /**
     * render
     */
    render() {
        const { units, isReadOnly, container } = this.props;
        return (
            <span className="tools" >
                <ButtonGroup>
                    <UnitQuickLaunch container={container} 
                                     units={units} 
                                     isReadOnly={isReadOnly} 
                                     specifyContainer={true} 
                                     onButtonEventTrigger={() => this.onButtonEventTrigger()}
                    />
                </ButtonGroup>
            </span>
        );
    }
    
    /**
     * クイックランチャーを表示するボタンのイベント発生をお知らせする
     */
    onButtonEventTrigger() {
        if (this.props.onButtonEventTrigger) {
            this.props.onButtonEventTrigger();
        }
    }
}

UnitToolButtons.propTypes = { 
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
    })),
    isReadOnly: PropTypes.bool,
    container: PropTypes.object,
    onButtonEventTrigger: PropTypes.func
}