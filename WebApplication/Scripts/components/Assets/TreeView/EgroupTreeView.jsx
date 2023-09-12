/**
 * @license Copyright 2017 DENSO
 * 
 * EgroupTreeView Reactコンポーネント
 * 
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types'
import { ButtonToolbar, Button, Grid, Row, Col } from 'react-bootstrap';
import TreeView from 'Common/Widget/TreeView';
import ModeSelectTreeview from 'Assets/TreeView/ModeSelectTreeview';
import { compareAscending } from 'sortCompare';

/**
 * 電源系統ツリービューコンポーネント
 */
export default class EgroupTreeView extends Component {

    /**
     * コンストラクタ
     */
    constructor(props) {
        super(props);

        this.state = {
            //初期表示で選択ロケーションがある場合とない場合
            treeData: this.makeTreeData()
        }
    }

    /**
     * コンポーネントのstateが変更されたときに呼ばれます。
     * パフォーマンス・チューニング時に行います
     * @param {object} nextProps 次のprops
     * @param {object} nextState 次のstate
     */
    shouldComponentUpdate(nextProps, nextState) {
        if ((nextProps.egroupList !== this.props.egroupList
            && JSON.stringify(nextProps.egroupList) !== JSON.stringify(this.props.egroupList))
            || nextProps.disabled != this.props.disabled) {
            return true;
        }
        if (nextState.searchMode !== this.state.searchMode) {
            return true;
        }
        return false;
    }

    /**
     * ノード選択イベント
     * @param value 選択したノード
     */
    nodeSelected(node, position) {
        if (this.props.onEgroupSelect) {
            this.props.onEgroupSelect(node, position);
        }
    }

    /**
     * ノードのチェック変更イベント
     * @param {any} nodes チェックされているノード
     */
    nodeCheckChanged(nodes) {
        if (this.props.onCheckedEgroupsChange) {
            this.props.onCheckedEgroupsChange(nodes);
        }
    }

    /**
     * ノードを選択する
     * @param {any} nodeId
     */
    selectNode(nodeId) {
        this.refs.tree.selectNode(nodeId);
    }

    /**
     * ルートノードから選択されたノードを展開する
     */
    revealNode() {
        this.refs.tree.revealNode();
    }

    /**
     * ツリービューを全て展開する
     */
    expandAll() {
        this.refs.tree.expandAll();
    }

    /**
     * ツリービューを全て閉じる
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
     * 有効なノードを取得する
     * @param {any} nodeId
     */
    getEnableNode(nodeId) {
        return this.refs.tree.getEnableNode(nodeId);
    }

    /**
     * ツリービューのデータを生成する
     * @param {any} egroupList
     */
    makeTreeData(egroupList) {
        const { selectedEgroup, checkedEgroups } = this.props
        let treeData;

        if (egroupList) {
            treeData = egroupList.map((item) => {
                let node = {
                    ...item,
                    id: item.egroupId,
                    text: item.egroupName,
                    state: {
                        selected: (selectedEgroup && selectedEgroup.egroupId == item.egroupId) ? true : false,
                        checked: (checkedEgroups && checkedEgroups.some((eg) => eg.egroupId === item.egroupId)) ? true : false
                    }
                };

                if (item.children && item.children.length > 0) {
                    node.nodes = this.makeTreeData(item.children);
                }

                return node;
            })

            treeData.sort((current, next) => compareAscending(current.dispIndex, next.dispIndex));
        }

        return treeData;
    }

    /**
     * render
     */
    render() {
        const { maxHeight, searchable, checkbox, egroupList, defaultCollapse, showAllExpandButton, disabled } = this.props;
        const { searchMode } = this.state;

        const treeData = this.makeTreeData(egroupList);

        return (
            <Grid fluid>
                <Row>
                    {checkbox ?
                        <ModeSelectTreeview
                            ref="tree"
                            data={treeData}
                            searchable={searchable}
                            showCheckbox={checkbox}
                            maxHeight={maxHeight}
                            onNodeSelect={(v, p) => this.nodeSelected(v, p)}
                            onNodeCheckChanged={(nodes) => this.nodeCheckChanged(nodes)}
                            onSearchModeChanged={(mode) => this.setState({ searchMode: mode })}
                            defaultCollapse={defaultCollapse}
                            disabled={disabled}
                            searchMode={searchMode}
                        />
                        :
                        <TreeView
                            ref="tree"
                            data={treeData}
                            searchable={searchable}
                            showCheckbox={checkbox}
                            maxHeight={maxHeight}
                            onNodeSelect={(v, p) => this.nodeSelected(v, p)}
                            onNodeCheckChanged={(nodes) => this.nodeCheckChanged(nodes)}
                            defaultCollapse={defaultCollapse}
                            disabled={disabled}
                        />
                    }
                </Row>
                {showAllExpandButton && !searchMode &&
                    <Row className="pa-1">
                        <ButtonToolbar className="pull-right">
                            <Button
                                bsStyle="success"
                                onClick={() => this.expandAll()}
                            >
                                全て展開
                            </Button>
                            <Button
                                bsStyle="lightgray"
                                onClick={() => this.collapseAll()}
                            >
                                全て閉じる
                            </Button>
                        </ButtonToolbar>
                    </Row>
                }
            </Grid>
        );
    }
}


EgroupTreeView.propTypes = {
    checkbox: PropTypes.bool,
    searchable: PropTypes.bool,
    maxHeight: PropTypes.number,
    egroupList: PropTypes.arrayOf(
        PropTypes.shape({
            egroupId: PropTypes.string.isRequired,
            egroupName: PropTypes.string.isRequired,
            children: PropTypes.arrayOf(PropTypes.object),
        })
    ),
    selectedEgroup: PropTypes.object,
    onEgroupSelect: PropTypes.func,
    checkedEgroups: PropTypes.array,
    onCheckedEgroupChange: PropTypes.func,
};

EgroupTreeView.defaultProps = {
    checkbox: false,
    searchable: false,
    maxHeight: null,
    egroupList: PropTypes.arrayOf(
        PropTypes.shape({
            egroupId: PropTypes.string.isRequired,
            egroupName: PropTypes.string.isRequired,
            children: PropTypes.arrayOf(PropTypes.object),
        })
    ),
    selectedEgroup: {},
    onEgroupSelect: () => { },
    checkedEgroups: [],
    onCheckedEgroupChange: () => { },
};
