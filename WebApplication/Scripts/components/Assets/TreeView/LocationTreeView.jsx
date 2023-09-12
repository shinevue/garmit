/**
 * @license Copyright 2018 DENSO
 * 
 * ロケーションツリービュー表示
 * 
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { ButtonToolbar, Button, Grid, Row } from 'react-bootstrap';
import ModeSelectTreeview from 'Assets/TreeView/ModeSelectTreeview';
import TreeView from 'Common/Widget/TreeView';
import { compareAscending } from 'sortCompare';

/**
 * ロケーションツリービューコンポーネント
 * ロケーションの選択、チェックを行う。
 * ロケーションツリーを表示させる場合は、ロケーションのツリー構造配列を渡す必要がある。 * 
 * @param {array} locationList ロケーションのツリー構造配列
 * @param {object} selectedLocation 選択中のロケーション
 * @param {array} checkedLocations チェックを入れているロケーション
 * @param {boolean} showCheckbox チェックボックスを表示するか
 * @param {boolean} showAllExpandButton 全て展開/閉じるボタンを表示するか
 * @param {boolean} separateCheckMode 個別チェックモードかどうか 
 * @param {function} onLocationSelect ロケーション選択時に呼び出す
 * @param {function} onLocationChangeChecked ロケーションのチェックを変更したときに呼び出す
 */
export default class LocationTreeView extends Component {
    
    /**
     * コンストラクタ
     */
    constructor(props) {
        super(props);       
        this.state = {
            treeData: this.makeTreeData(props.locationList, props.selectedLocation, props.checkedLocations)
        }        
    }

    /**
     * 新しいpropsを受け取るときに呼び出されます。
     * propsによってstateを変更する場合はここでthis.setState()を行います。このsetStateでrenderを呼ぶことはありません。
     * @param {object} nextProps 新しいprops
     */
    componentWillReceiveProps(nextProps) {
        if (JSON.stringify(nextProps.locationList) !== JSON.stringify(this.props.locationList)) {
            this.setState({ treeData: this.makeTreeData(nextProps.locationList, nextProps.selectedLocation, nextProps.checkedLocations) });
        }
    }

    /**
     * コンポーネントのstateが変更されたときに呼ばれます。
     * パフォーマンス・チューニング時に行います
     * @param {object} nextProps 次のprops
     * @param {object} nextState 次のstate
     */
    shouldComponentUpdate(nextProps, nextState) {
        if (JSON.stringify(nextProps.locationList) !== JSON.stringify(this.props.locationList)
            || nextProps.disabled != this.props.disabled) {
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
    collapseAll(){
        this.refs.tree.collapseAll();
    }
    
    /**
     * ノード選択イベント
     * @param {object} node 選択したノード
     * @param {array} position ノードの位置情報（配列） 例：[{id:'1', name:'東京第一センター'},{id:'11', name:'A棟'},{id:'111', name:'1階'},{id:'1111', name:'1列'},{id:'11111', name:'RackA1101'}]
     */
    nodeSelected(node, position){
        if (this.props.onLocationSelect) {
            this.props.onLocationSelect(node, position);
        }
    }
 
    /**
     * ノードのチェック変更イベント
     * @param  values チェックされたノード一覧
     */
    nodeCheckChanged(nodes){
        if (this.props.onLocationChangeChecked) {
            const allowCheckedLocations = nodes.filter((node) => node.isAllowed);
            this.props.onLocationChangeChecked(allowCheckedLocations);
        }
    }
    
    /**
     * ツリーデータを作成する
     * @param {array} locationList ロケーションリスト
     * @param {object} selectedLocation 選択中のロケーション
     * @param {array} expandLocIds 
     * @param {boolean} parentChecked 親ロケーションがチェックされているかどうか
     */
    makeTreeData(locationList, selectedLocation, checkedLocations, parentChecked) {
        var treeData = [];

        if (locationList && locationList.length > 0) {
            treeData = locationList.map((location) => {
                const { locationId, name, children, isAllowed, disabled, unselectable } = location;
                var node = {
                    ...location,
                    id: locationId,
                    text: name,
                    tag: locationId,
                    icon: ((!isAllowed || disabled || unselectable) && 'fal fa-ban tree-node-allow'),
                    unselectable: (!isAllowed || unselectable),
                    state: {
                        checked: (parentChecked || (checkedLocations && checkedLocations.some((item) => item.locationId === locationId))) ? true : false,
                        selected: (selectedLocation && selectedLocation.locationId === locationId) ? true : false,
                        disabled: disabled
                    }
                }
                
                if (children && children.length > 0) {
                    node.nodes = this.makeTreeData(children, selectedLocation, checkedLocations, (!this.props.separateCheckMode&&node.state.checked));      //再帰処理
                    node.state.checked = !this.props.separateCheckMode ? node.nodes.every((n) => n.state.checked) : node.state.checked;
                }
                
                return node;

            });

            treeData.sort((current, next) => compareAscending(current.dispIndex, next.dispIndex));
            
        }
        
        return treeData;
    }

    /**
     * render
     */
    render() {
        const { showCheckbox, showAllExpandButton, separateCheckMode, maxHeight, locationList, selectedLocation, checkedLocations, disabled } = this.props;
        const { treeData, searchMode } = this.state; 

        return (
            <Grid fluid>
                <Row>
                    {showCheckbox && separateCheckMode ?
                        <ModeSelectTreeview
                            ref="tree"
                            data={treeData}
                            searchable={true}
                            showCheckbox={showCheckbox}
                            maxHeight={maxHeight}
                            onNodeSelect={(v, p) => this.nodeSelected(v, p)}
                            onNodeCheckChanged={(nodes) => this.nodeCheckChanged(nodes)}
                            onSearchModeChanged={(mode) => this.setState({ searchMode: mode })}
                            defaultCollapse={true}
                            disabled={disabled}
                            searchMode={searchMode}
                        />
                        :
                        <TreeView
                            ref="tree"
                            data={treeData}
                            searchable={true}
                            showCheckbox={showCheckbox}
                            maxHeight={maxHeight}
                            onNodeSelect={(v, p) => this.nodeSelected(v, p)}
                            onNodeCheckChanged={(v) => this.nodeCheckChanged(v)}
                            disabled={disabled}
                        />
                    }
                </Row>
                {showAllExpandButton && !searchMode &&
                    <Row className="pa-1">
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

LocationTreeView.propTypes = {
    locationList: PropTypes.arrayOf(
        PropTypes.shape({
            locationId: PropTypes.string.isRequired,
            name: PropTypes.string.isRequired,
            children: PropTypes.arrayOf(PropTypes.object),
            isChecked: PropTypes.bool,
            dispIndex: PropTypes.number,
            isRack: PropTypes.bool
        })
    ),
    selectedLocation: PropTypes.object,
    checkedLocations: PropTypes.array,
    separateCheckMode: PropTypes.bool,
    separateCheck: PropTypes.bool,
    showAllExpandButton: PropTypes.bool,
    onLocationSelect: PropTypes.func,
    onLocationChangeChecked: PropTypes.func
};
