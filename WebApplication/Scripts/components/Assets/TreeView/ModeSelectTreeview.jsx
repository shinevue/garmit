/**
 * 
 * モード選択ツリービュー表示
 *
 */
'use strict';
 
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, Tooltip,ButtonGroup, ButtonToolbar  } from 'react-bootstrap';
import TreeView from 'Common/Widget/TreeView';
import TreeViewModeSelectBar from 'Assets/TreeView/TreeViewModeSelectBar';

/**
 * モード選択ツリービューを表示します。
 */
export default class ModeSelectTreeView extends Component {

    /**
     * コンストラクタ
     */
    constructor(props) {
        super(props);
        this.state = {
            selectMode: this.props.defaultMode,
        };
    }

    //#region イベントハンドラ
    /**
     * モード変更イベント
     * @param value 変更後の値
     */
    handleChangeMode(value) {
        this.setState({ selectMode: value });
    }
    //#endregion

    /**
     * ツリービューのノードをすべて展開する
     */
    expandAll() {
        this.refs.tree.expandAll();
    }

    /**
     * ツリービューのノードをすべて閉じる
     */
    collapseAll() {
        this.refs.tree.collapseAll();
    }

    /**
     * ツリービューをすべて無効にする
     */
    disableAll() {
        this.refs.tree.disableAll();
    }

    /**
     * ツリービューをすべて有効にする
     */
    enableAll() {
        this.refs.tree.enableAll();
    }

    /**
     * render
     */
    render() {
        const { searchMode } = this.props;
        const { selectMode } = this.state;
        
        return (
            <div>
                <TreeViewModeSelectBar
                    disabled={searchMode}
                    selectMode={searchMode ? 'individual' : selectMode}
                    onChangeMode={(value) => this.handleChangeMode(value)}
                />
                <TreeView
                    ref="tree"
                    {...this.props}
                    checkMode = {selectMode}
                />
            </div>
        );
    }
}

ModeSelectTreeView.PropTypes = {
    defaultMode: PropTypes.oneOf(['individual', 'collective']),  //チェックモード初期値
}

ModeSelectTreeView.defaultProps = {
    defaultMode: 'collective'
}