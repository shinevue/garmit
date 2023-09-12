/**
 * @license Copyright 2018 DENSO
 * 
 * IconToolButton Reactコンポーネント
 * 
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { OverlayTrigger, Tooltip, Button } from 'react-bootstrap';
import Icon from 'Common/Widget/Icon';

/**
 * ボックスツールのアイコンボタンコンポーネント
 * @param {string} label アイコンボタンのタイトル（マウスオーバーすると表示される）
 * @param {string} iconClass 表示するアイコンのクラス
 * @param {boolean} isReadOnly 読み取り専用かどうか
 * @param {boolean} specifyContainer ツールチップのコンテナを指定するかどうか
 * @param {object} container ツールチップのコンテナ
 * @param {function} onButtonEventTrigger ツールチップを表示するボタンのイベントが発生したときに呼び出す（ポップアップ用）
 * @param {function} onClick ボタンクリック時に呼び出す
 */
export default class IconToolButton extends Component {
    
    /**
     * コンストラクタ
     */
    constructor(props) {
        super(props);
        // this.state = {
        //      target: undefined
        // };
    }
    
    render() {
        const { label, iconClass, isReadOnly, target, container } = this.props;
        //const { target } = this.state;
        return (
            <OverlayTrigger container={container} placement="bottom" overlay={
                <Tooltip>{label}</Tooltip>
                } >
                <Button className="btn-box-tool" bsStyle="" disabled={isReadOnly} 
                        onMouseOver={() => this.onButtonEventTrigger()} 
                        onFocus={() => this.onButtonEventTrigger()}
                        onClick={() => this.handleClick()}
                        >                                                
                    <Icon className={iconClass} />   
                </Button>
            </OverlayTrigger> 
        );
    }

    /**
     * クリックイベント
     */
    handleClick(e) {
        this.onButtonEventTrigger();
        if (this.props.onClick) {
            this.props.onClick();
        }
    }

    /**
     * ツールチップを表示するボタンのイベント発生をお知らせする
     */
    onButtonEventTrigger() {
        if (this.props.specifyContainer && this.props.onButtonEventTrigger) {
            this.props.onButtonEventTrigger();
        }
    }
}

IconToolButton.propTypes = {
    label: PropTypes.string,
    iconClass: PropTypes.string.isRequired,
    isReadOnly: PropTypes.bool,
    specifyContainer: PropTypes.bool,
    container: PropTypes.object,
    onButtonEventTrigger: PropTypes.func,
    onClick: PropTypes.func
}