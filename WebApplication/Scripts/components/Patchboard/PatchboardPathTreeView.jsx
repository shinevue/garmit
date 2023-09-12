'use strict';

import React, { Component } from 'react';

import PropTypes from 'prop-types';

import TreeView from 'Common/Widget/TreeView';

export default class PatchboardPathTreeView extends Component {

    constructor(props) {
        super(props);
        this.state = {

        };
    }

    /**
     * コンポーネントのstateが変更されたときに呼ばれます。
     * パフォーマンス・チューニング時に行います
     * @param nextProps 次のprops
     * @param nextState 次のstate
     */
    shouldComponentUpdate(nextProps, nextState) {
        if (JSON.stringify(nextProps) !== JSON.stringify(this.props)) {
            return true;
        }
        return false;
    }

    /**
     * ノード選択イベント
     * @param value 選択したノード
     */
    nodeSelected(node, position) {
        if (this.props.onPatchboardSelect) {
            this.props.onPatchboardSelect(node, position);
        }
    }

    /**
     * ツリービューのデータを生成する
     * @param {any} patchboardTreeList
     * @param {any} selectedPatchboard
     * @param {any} selectedPathNo
     */
    makeTreeData(patchboardTreeList, selectedPatchboard, selectedPathNo) {
        let treeData = [];
        if (patchboardTreeList && patchboardTreeList.length > 0) {
            treeData = patchboardTreeList.map((patchboardTree) => {
                const { patchboardId, patchboardName, children, pathNo } = patchboardTree;

                let node = {
                    ...patchboardTree,
                    id: patchboardId,
                    text: patchboardName,
                    tag: patchboardId,
                    state: {
                        selected: (selectedPatchboard && selectedPatchboard.patchboardId == patchboardId && selectedPathNo == pathNo) ? true : false
                    }
                }

                if (children && children.length > 0) {
                    node.nodes = this.makeTreeData(children, selectedPatchboard, selectedPathNo);   //再帰処理
                }

                return node;
            });
        }

        return treeData;
    }

    /**
     * render
     */
    render() {
        const { patchboardTree, selectedPatchboard, selectedPathNo } = this.props;

        const treeData = this.makeTreeData(patchboardTree && [patchboardTree], selectedPatchboard, selectedPathNo);

        return (
            <TreeView
                ref="tree"
                data={treeData}
                searchable={false}
                showCheckbox={false}
                maxHeight={550}
                onNodeSelect={(v, p) => this.nodeSelected(v, p)}
                disabled={false}
                levels={1000}
            />
        );
    }
}

PatchboardPathTreeView.propTypes = {
    patchboardTree: PropTypes.object,
    selectedPatchboard: PropTypes.object,
    onPatchboardSelect: PropTypes.func,
    selectedPathNo: PropTypes.number
};