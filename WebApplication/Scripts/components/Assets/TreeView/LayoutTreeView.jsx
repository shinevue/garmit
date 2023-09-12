/**
 * Copyright 2017 DENSO Solutions
 * 
 * レイアウト選択ツリービュー Reactコンポーネント
 * <LayoutTreeView />
 *  
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Col, Grid, Row, ButtonToolbar } from 'react-bootstrap';

import TreeView from 'Common/Widget/TreeView';
import Button from 'Common/Widget/Button';

/**
 * レイアウト選択ツリービュー
 * <LayoutTreeView layoutInfo={}></LayoutSelectForm>
 * @param {array} layoutList レイアウト一覧
 * @param {object} selectLayout 選択中レイアウト情報
 */
export default class LayoutTreeView extends Component {

    constructor(props) {
        super(props);
        this.state = {
            treeData: this.props.layoutList && this.convertTreeData(this.props.selectLayout, this.props.layoutList, []),
            selectNode: null //選択中ノード情報
        };
    }

    /**
     * 新たなPropsを受け取ったときに実行される
     */ 
    componentWillReceiveProps(nextProps) {
        if (this.props.layoutList !== nextProps.layoutList
            || _.get(this.state.selectNode, 'layoutId') !== _.get(nextProps.selectLayout, 'layoutId')) {
            this.setState({ treeData: this.convertTreeData(nextProps.selectLayout, nextProps.layoutList, []) });
        }

        //ロード中にツリービューをdisableにする
        if (this.props.disabled !== nextProps.disabled) {
            if (nextProps.disabled) {
                //展開されているノードを保存しておく
                this.setState({ expanded: this.refs.tree.getExpanded() });
                this.refs.tree.disableAll();
            }
            else {
                this.refs.tree.enableAll();
                const { expanded, selected } = this.state;
                expanded && expanded.forEach((node) => {
                    this.refs.tree.expandTargetNode(node.nodeId);
                });
                this.setState({ expanded: null });
            }
        }
    }

    /**
     * レイアウト一覧をツリービュー表示用のフォーマットに変換する
     */
    convertTreeData(selectLayout, layoutList, treeData) {
        for (var i = 0; layoutList.length > i; i++) {
            const state = {
                selected: selectLayout && selectLayout.layoutId === layoutList[i].layoutId ? true : false
            };
            const isAllowed = (_.get(layoutList[i], "location.isAllowed") || !_.get(layoutList[i], "location"));
            let addNode = {
                ...layoutList[i],
                text: layoutList[i].layoutName,
                state: state,
                icon: !isAllowed && 'fal fa-ban tree-node-allow',
                unselectable: !isAllowed
            };
            if (layoutList[i].children && layoutList[i].children.length >0) {
                const nodes = this.convertTreeData(selectLayout, layoutList[i].children, []);
                addNode.nodes = nodes;
            }
            treeData.push(addNode);
        }
        return treeData;
    }

    /**
     * レイアウト選択イベント
     */
    handleSelectLayout=(node, position)=> {
        if (this.props.onSelectLayout) {
            if (node.icon) {
                return; //権限無しレイアウトの場合は何もしない
            }
            if (this.props.isGetDuplicateSelectEvent) {
                this.props.onSelectLayout(node, position);   //重複選択イベントを発生させる場合
            }
            else if(_.get(this.props, "selectLayout.layoutId") !== node.layoutId) {   //発生させない場合
                this.props.onSelectLayout(node, position);
                this.setState({ selectNode: node });
            }
        }      
    }

    /**
     * render
     */
    render() {
        const { selectLayout, layoutList, isGetDuplicateSelectEvent, disabled, maxHeight } = this.props;
        const { show, layoutNameList, treeData } = this.state;
        const isReadOnly = false;

        if (!layoutList || layoutList.length === 0) {
            return <span>レイアウトがありません。</span>
        }
        return (
            <Grid fluid>
                <Row>
                    <TreeView
                        ref="tree"
                        data={treeData}
                        searchable={true}
                        showCheckbox={false}
                        isGetDuplicateSelectEvent={isGetDuplicateSelectEvent}
                        maxHeight={maxHeight}
                        onNodeSelect={this.handleSelectLayout}
                    />
                </Row>
                <Row className="pa-1">
                    <ButtonToolbar className="pull-right">
                        <Button bsStyle="success" disabled={disabled} onClick={() => this.refs.tree.expandAll()}>全て展開</Button>
                        <Button bsStyle="lightgray" disabled={disabled} onClick={() => this.refs.tree.collapseAll()}>全て閉じる</Button>
                    </ButtonToolbar>
                </Row>
            </Grid>
        );
    }
}

LayoutTreeView.propTypes = {
    layoutList: PropTypes.array,
    selectLayout: PropTypes.object,
    isGetDuplicateSelectEvent: PropTypes.bool,  //選択中ノードが再度クリックされた場合にイベントを発生させるかどうか
    onSelectLayout: PropTypes.func
};