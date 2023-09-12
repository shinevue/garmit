/**
 * 
 * ツリービュー用モードセレクトボタンツールバー表示
 * 
 */
'use strict';
 
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, Tooltip,ButtonGroup, ButtonToolbar  } from 'react-bootstrap';
import TreeView from 'Common/Widget/TreeView';

/**
 * ツリービュー用モードセレクトボタンツールバーを表示します。
 */
export default class TreeViewModeSelectBar extends Component {

    /**
     * コンストラクタ
     */
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    /**
     * チェックモード変更イベント
     * @param value 変更後の値
     */
    handleChangeMode(value) {
        if (this.props.onChangeMode) {
            this.props.onChangeMode(value);
        };
    }


    /**
     * render
     */
    render() {
        const { selectMode, disabled } = this.props;
        return (
            <ButtonToolbar>
                <ButtonGroup data-toggle="buttons" className="pull-right">
                    <Button
                        disabled={disabled}
                        active={selectMode === "individual" ? true : false}
                        onClick={() => this.handleChangeMode("individual")}
                    >
                        <input type="radio" />個別チェック
                            </Button>
                    <Button
                        disabled={disabled}
                        active={selectMode === "collective" ? true : false}
                        onClick={() => this.handleChangeMode("collective")}
                    >
                        <input type="radio" />まとめてチェック
                            </Button>
                </ButtonGroup>
            </ButtonToolbar>
        );
    }
}

TreeViewModeSelectBar.PropTypes = {
    selectMode: PropTypes.oneOf(['individual', 'collective']),  //選択中モード
    onChangeMode:PropTypes.func                                //モード変更イベント関数
}