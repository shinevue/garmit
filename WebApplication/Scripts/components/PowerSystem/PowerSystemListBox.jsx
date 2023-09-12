/**
 * Copyright 2017 DENSO Solutions
 * 
 * 電源系統選択ボックス Reactコンポーネント
 * <PowerSystemListBox />
 *  
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Tooltip, OverlayTrigger } from 'react-bootstrap';

import Box from 'Common/Layout/Box';
import Button from 'Common/Widget/Button';
import Icon from 'Common/Widget/Icon';
import TreeView from 'Common/Widget/TreeView';

import EgroupTreeView from 'Assets/TreeView/EgroupTreeView';
import SortableListBox from 'Assets/SortableListBox';

import { makeEgroupTree } from 'treeViewUtility';
import { makeSortList, getSortEgroups } from 'sortableTreeUtility';

/**
 * 電源系統選択ボックス
 * <PowerSystemListBox layoutInfo={}></PowerSystemListBox>
 * @param {object} layoutInfo レイアウト情報
 */
export default class PowerSystemListBox extends Component {

    constructor(props) {
        super(props);
        this.state = {

        };
    }

    //並べ替えボタン押下イベント
    handleClickSort() {
        if (this.props.onClickSort) {
            this.props.onClickSort()
        }
    }

    //並べ替えキャンセルボタンクリックイベント
    handleClickCancel() {
        if (this.props.onClickCancel) {
            this.props.onClickCancel();
        }
    }

    //並べ替え保存ボタンクリックイベント
    handleClickSave() {
        var sorted = getSortEgroups(this.props.sortTargetEgroups);
        if (this.props.onClickSave) {
            this.props.onClickSave(sorted);
        }
    }

    /**
     * 電源系統選択イベントハンドラ
     * @param {any} node クリックされたノード
     * @param {any} egroupList 選択された電源系統までの親電源系統
     */
    handleSelectEgroup(node, egroupList) {
        if (this.props.onSelectEgroup) {
            this.props.onSelectEgroup(node, egroupList);
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
     * 有効なノードを取得する
     * @param {any} nodeId
     */
    getEnableNode(nodeId) {
        return this.refs.tree.getEnableNode(nodeId);
    }

    /**
     * render
     */
    render() {
        const { isReadOnly, disabled, isLoading, isSortMode, egroups, selectedEgroup, selectedEgroupPosition, sortTargetEgroups } = this.props;

        return (
            <div>
                {isSortMode ?
                    <SortableListBox
                        boxTitle="電源系統並べ替え"
                        isSortMode={isSortMode}
                        sortList={isSortMode && makeSortList([], makeEgroupTree(egroups.slice()), selectedEgroupPosition, sortTargetEgroups, 0)}
                        onClickSave={() => this.handleClickSave()}
                        onClickCancel={() => this.handleClickCancel()}
                    />
                    :
                    <Box isLoading={isLoading}>
                        <Box.Header>
                            <Box.Title>電源系統一覧</Box.Title>
                        </Box.Header>
                        <Box.Body>
                            {!isReadOnly &&
                                <div className="clearfix">
                                    <OverlayTrigger placement="bottom" overlay={<Tooltip>並べ替え</Tooltip>}>
                                        <Button
                                            className="pull-right"
                                            disabled={disabled || (selectedEgroup ? false : true)}
                                            bsStyle="primary"
                                            isCircle={true}
                                            onClick={() => this.handleClickSort()}
                                        >
                                            <Icon className="fal fa-sort" />
                                        </Button>
                                    </OverlayTrigger>
                                </div>
                            }
                            <EgroupTreeView
                                ref="tree"
                                className="pa-0"
                                maxHeight={550}
                                searchable={true}
                                showAllExpandButton={true}
                                egroupList={egroups}
                                selectedEgroup={selectedEgroup}
                                onEgroupSelect={(egroup, position) => this.handleSelectEgroup(egroup, position)}
                                disabled={disabled}
                            />
                        </Box.Body>
                    </Box>
                }
            </div>
        );
    }
}

PowerSystemListBox.propTypes = {
    
};

