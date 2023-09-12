/**
 * @license Copyright 2017 DENSO
 * 
 * EnterpriseTreeView Reactコンポーネント
 * 
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types'
import { ButtonToolbar, Button, Grid, Row, Col } from 'react-bootstrap';
import ModeSelectTreeview from 'Assets/TreeView/ModeSelectTreeview';
import { compareAscending } from 'sortCompare';

/**
 * 所属ツリービューコンポーネント
 */
export default class EnterpriseTreeView extends Component {

    /**
     * コンストラクタ
     */
    constructor(props) {
        super(props);
        this.state = {

        }
    }

    /**
     * 最初のレンダリング時にクライアントに一度だけ呼び出されます。
     * Componentがレンダリングされた直後に呼び出されるメソッドです。
     * ここでsetStateを行うと、renderがもう一度呼び出されるためあまり行わないほうがよいです。
     */
    componentDidMount() {

    }

    /**
     * 新しいpropsを受け取るときに呼び出されます。
     * propsによってstateを変更する場合はここでthis.setState()を行います。このsetStateでrenderを呼ぶことはありません。
     * @param {*} nextProps 新しいprops
     */
    componentWillReceiveProps(nextProps) {

    }

    /**
     * Componentがアンマウントされるときに呼び出されます。
     * リソースの開放などを記述します。
     */
    componentWillUnmount() {
    }

    /**
     * コンポーネントのstateが変更されたときに呼ばれます。
     * パフォーマンス・チューニング時に行います
     * @param nextProps 次のprops
     * @param nextState 次のstate
     */
    shouldComponentUpdate(nextProps, nextState) {
        if (JSON.stringify(nextProps.enterpriseList) !== JSON.stringify(this.props.enterpriseList)) {
            return true;
        }
        if (nextState.searchMode !== this.state.searchMode) {
            return true;
        }
        return false;
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
     * ノード選択イベント
     * @param value 選択したノード
     */
    nodeSelected(node, position) {
        if (this.props.onEnterpriseSelect) {
            this.props.onEnterpriseSelect(node, position);
        }
    }

    /**
     * ノードのチェック変更イベント
     * @param {any} nodes チェックされているノード
     */
    nodeCheckChanged(nodes) {
        if (this.props.onCheckedEnterpriseChange) {
            this.props.onCheckedEnterpriseChange(nodes);
        }
    }

    /**
     * ツリービューのデータを生成する
     * @param {any} enterpriseList
     */
    makeTreeData(enterpriseList, selectedEnterprise, checkedEnterprises) {
        let treeData = [];

        if (enterpriseList && enterpriseList.length > 0) {
            treeData = enterpriseList.map((enterprise) => {
                const { enterpriseId, enterpriseName, children } = enterprise;

                let node = {
                    ...enterprise,
                    id: enterpriseId,
                    text: enterpriseName,
                    tag: enterpriseId,
                    state: {
                        selected: (selectedEnterprise && selectedEnterprise.enterpriseId == enterpriseId) ? true : false,
                        checked: (checkedEnterprises && checkedEnterprises.some((ent) => ent.enterpriseId === enterpriseId)) ? true : false
                    }
                }

                if (children && children.length > 0) {
                    node.nodes = this.makeTreeData(children, selectedEnterprise, checkedEnterprises);  //再帰処理
                }

                return node;
            })

            treeData.sort((current, next) => compareAscending(current.dispIndex, next.dispIndex))
        }

        return treeData;
    }

    /**
     * render
     */
    render() {
        const { enterpriseList, selectedEnterprise, checkedEnterprises, maxHeight, initialTreeMode, showAllExpandButton, searchable, checkbox, defaultCollapse } = this.props;
        const { searchMode } = this.state;

        const treeData = this.makeTreeData(enterpriseList, selectedEnterprise, checkedEnterprises);

        return (
            <Grid fluid>
                <Row>
                    <ModeSelectTreeview
                        ref="tree"
                        data={treeData}
                        searchable={searchable}
                        showCheckbox={checkbox}
                        maxHeight={maxHeight}
                        defaultMode={initialTreeMode}
                        onNodeSelect={(v, p) => this.nodeSelected(v, p)}
                        onNodeCheckChanged={(nodes) => this.nodeCheckChanged(nodes)}
                        onSearchModeChanged={(mode) => this.setState({ searchMode: mode })}
                        defaultCollapse={defaultCollapse}
                        maxHeight={maxHeight}
                        defaultMode="individual"
                        searchMode={searchMode}
                    />
                </Row>
                {showAllExpandButton && !searchMode &&
                    <Row>
                        <ButtonToolbar className="pull-right">
                            <Button bsStyle="success" onClick={() => this.expandAll()}>全て展開</Button>
                            <Button bsStyle="lightgray" onClick={() => this.collapseAll()}>全て閉じる</Button>
                        </ButtonToolbar>
                    </Row>
                }
            </Grid>
        );
    }
}

EnterpriseTreeView.propTypes = {
    checkbox: PropTypes.bool,
    searchable: PropTypes.bool,
    maxHeight: PropTypes.number,
    initialTreeMode: PropTypes.oneOf(['individual', 'collective']),  //チェックモード初期値
    enterpriseList: PropTypes.arrayOf(
        PropTypes.shape({
            enterpriseId: PropTypes.string.isRequired,
            enterpriseName: PropTypes.string.isRequired,
            children: PropTypes.arrayOf(PropTypes.object),
        })
    ),
    selectedEnterprise: PropTypes.object,
    onEnterpriseSelect: PropTypes.func,
    checkedEnterprises: PropTypes.array,
    onCheckedEnterpriseChange: PropTypes.func,
    initialExpandedEntIds: PropTypes.array,
    onExpandedIdsChange: PropTypes.func,
    showAllExpandButton: PropTypes.bool,
};

EnterpriseTreeView.defaultProps = {
    checkbox: false,
    searchable: false,
    maxHeight: null,
    enterpriseList: PropTypes.arrayOf(
        PropTypes.shape({
            enterpriseId: PropTypes.string.isRequired,
            enterpriseName: PropTypes.string.isRequired,
            children: PropTypes.arrayOf(PropTypes.object),
        })
    ),
    selectedEnterprise: {},
    onEnterpriseSelect: () => { },
    checkedEnterprises: [],
    onCheckedEnterpriseChange: () => { },
    initialExpandedEntIds: [],
    onExpandedIdsChange: () => { },
    showAllExpandButton: false
};
