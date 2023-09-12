/**
 * Copyright 2017 DENSO Solutions
 * 
 * 並べ替え可能ツリー表示ボックス Reactコンポーネント
 *  
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Row, Col } from 'react-bootstrap';

import TreeView from 'Common/Widget/TreeView';
import Button from 'Common/Widget/Button';
import Icon from 'Common/Widget/Icon';
import { SortCircleButton } from 'Assets/GarmitButton';
import GarmitBox from 'Assets/GarmitBox';

import { makeLocationTree, makeAddLocations, makeAddChildLocations, NEW_LOCATION_NODE } from 'treeViewUtility';

/**
 * 並べ替え可能ツリー表示ボックス
 */
export default class SortableTreeDispBox extends Component {

    constructor(props) {
        super(props);
        this.state = {
            addTree: null,      //追加時表示用に新規ノードを追加したツリーデータ
            addNodeId: -1        //追加途中のノードのID(addTree)
        };
    }

    //#region ライフサイクル関数
    /**
    * componentDidUpdate
    */
    componentDidUpdate(prevProps, prevState) {
        if (!this.props.isSortMode && prevProps.isSortMode) {   //ソートモード解除時
            //変更したノードのみ開く
            this.refs.tree.expandNode(prevProps.selectNode.nodeId);
        }
        else if (this.state.addTree && !prevState.addTree) { //AddMode設定時
            //新規登録中ノードのnodeIdを保存しておく
            if (this.refs.addTree.getSelectedNodes().length > 0) {
                this.setState({ addNodeId: this.refs.addTree.getSelectedNodes()[0].nodeId });
            }
        }
        else if (JSON.stringify(this.props.tree) !== JSON.stringify(prevProps.tree)) {
            if (_.get(this.props, "selectNode.nodeId") && _.get(this.props, "selectNode.nodeId") !== _.get(prevProps, "selectNode.nodeId")) {
                //選択ノードまで開く
                //this.refs.tree.expandNode(this.props.selectNode.nodeId);
            }
        }
    }

    /**
    * コンポーネントが新しいpropsを受け取ったときに実行
    */
    componentWillReceiveProps(nextProps) {
        if (nextProps.isAddMode && !this.props.isAddMode) {
            //ノード追加モード設定時
            const addTreeLocations = makeAddLocations(nextProps.tree, nextProps.selectNodePosition, 0, nextProps.addingNodePosition);
            this.setState({ addTree: makeLocationTree(addTreeLocations, -1) });
        }
        else if (nextProps.isAddChildMode && !this.props.isAddChildMode) {
            //子ノード追加モード設定時
            const addTreeLocations = makeAddChildLocations(nextProps.tree, nextProps.selectNodePosition, 0, nextProps.addingNodePosition);
            this.setState({ addTree: makeLocationTree(addTreeLocations, -1) });
        }
        else if ((!nextProps.isAddMode && this.props.isAddMode) || (!nextProps.isAddChildMode && this.props.isAddChildMode)) {
            //追加モード解除時
            this.setState({ addTree: null });
            if (this.props.selectNode) {
                //this.refs.tree.expandNode(this.props.selectNode.nodeId);
            }
        }
    }
    //#endregion

    //#region イベントハンドラ
    /**
     * 並べ替えボタン押下イベント
     */
    handleClickSort() {
        if (this.props.onClickSort) {
            this.props.onClickSort();
        }
    }

    /**
    * ノード選択イベントハンドラ
    * @param {object} node クリックされたノード
    * @param {array} locationList 選択されたロケーションまでの親ロケーション
    */
    handleNodeSelect(node, locationList) {
        if (this.props.onNodeSelect) {
            this.props.onNodeSelect(node, locationList);
        }
    }

    /**
    * 追加用ツリーノード選択イベントハンドラ
    * @param {object} node クリックされたノード
    * @param {array} locationList 選択されたロケーションまでの親ロケーション
    */
    handleAddNodeSelect(node, locationList) {
        if (node.id !== -1) {
            this.refs.addTree.selectNode(this.state.addNodeId);
        }
    }

    //#endregion

    //#region render
    /**
     * render
     */
    render() {
        const { tree, boxTitle, isSortMode, selectNode, isLoading, isReadOnly, hideOperationButton } = this.props;
        const { addTree } = this.state;

        return (
            <GarmitBox isLoading={isLoading} title={boxTitle}>
                <div>
                    {!hideOperationButton &&
                        <SortCircleButton
                            className="mb-05 pull-right"
                            disabled={isReadOnly || addTree ? true : false}
                            onClick={() => this.handleClickSort()}
                        />
                    }
                    <div style={{ display: addTree ? "none" : "block" }} >
                        <TreeView
                            searchFormClassName="sort-button-search"
                            ref="tree"
                            data={tree}
                            searchable={true}
                            showCheckbox={false}
                            showTags={true}
                            onNodeSelect={(node, locationList) => this.handleNodeSelect(node, locationList)}
                            maxHeight={550}
                        />
                    </div>
                    {addTree &&
                        <TreeView
                            searchFormClassName="sort-button-search"
                            ref="addTree"
                            data={addTree}
                            searchable={true}
                            showCheckbox={false}
                            showTags={true}
                            onNodeSelect={(node, locationList) => this.handleAddNodeSelect(node, locationList)}
                            maxHeight={550}
                        />
                    }
                </div>
                <div>
                    <div className="pull-right mt-01">
                        <Button bsStyle="success" className="mr-05" onClick={() => { addTree ? this.refs.addTree.expandAll() : this.refs.tree.expandAll() }}>全て展開</Button>
                        <Button bsStyle="lightgray" onClick={() => { addTree ? this.refs.addTree.collapseAll() : this.refs.tree.collapseAll() }}>全て閉じる</Button>
                    </div>
                </div>
            </GarmitBox>
        );
    }
    //#endregion
}

SortableTreeDispBox.propTypes = {
    boxTitle: PropTypes.string,             //ボックスのタイトル
    tree: PropTypes.array,                  //ロケーションツリーデータ
    isSortMode: PropTypes.bool,             //並べ替えモードかどうか
    isAddMode: PropTypes.bool,              //ノード追加モードかどうか
    isAddChildMode: PropTypes.bool,         //子ノードモードかどうか
    selectNode: PropTypes.object,           //選択中ノード
    selectNodePosition: PropTypes.array,    //選択中ノードの位置
    isLoading: PropTypes.bool,              //ロード中かどうか
    isReadOnly: PropTypes.bool,             //読み取り専用かどうか
    hideOperationButton: PropTypes.bool,    //操作ボタンを非表示にするかどうか
    onNodeSelect: PropTypes.func,           //ノード選択イベント関数
    onClickSort: PropTypes.func             //並べ替えボタンクリックイベント関数
};

