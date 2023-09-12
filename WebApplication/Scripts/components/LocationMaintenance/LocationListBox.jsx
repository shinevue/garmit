/**
 * Copyright 2017 DENSO Solutions
 * 
 * ロケーション一覧ボックス Reactコンポーネント
 *  
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';

import TreeView from 'Common/Widget/TreeView';
import Button from 'Common/Widget/Button';
import Icon from 'Common/Widget/Icon';

import SortableListBox from 'Assets/SortableListBox';

import LocationTreeDispBox from './LocationTreeDispBox';

import { makeLocationTree } from 'treeViewUtility';
import { makeSortList, getSortLocations } from 'sortableTreeUtility';

/**
 * ロケーション一覧ボックス
 */
export default class LocationListBox extends Component {

    constructor(props) {
        super(props);
        this.state = {
            tree: makeLocationTree(props.locations, _.get(props.selectLocation, "locationId")),     //ツリー表示用データ
            sortList: null       //並べ替え表示用データ
        };
    }

    //#region ライフサイクル関数
    /**
     * コンポーネントが新しいPropsを受け取ったときに実行される
     */
    componentWillReceiveProps(nextProps) {
        if (this.props.locations !== nextProps.locations || (this.props.selectLocation && !nextProps.selectLocation)) { //ロケーション一覧更新または選択解除
            this.setState({ tree: makeLocationTree(nextProps.locations, _.get(nextProps.selectLocation, "locationId")) }); //ロケーション一覧情報更新時
        }
        if (nextProps.sortLocations && !this.props.sortLocations) {
            //並べ替えモード設定時
            this.setState({ sortList: this.state.tree && nextProps.selectLocPosition.length > 0 && nextProps.sortLocations ? makeSortList([], Object.assign([], this.state.tree), nextProps.selectLocPosition, nextProps.sortLocations, 0) : null });
        }
        else if (!nextProps.sortLocations && this.props.sortLocations) {    //並べ替えモード解除時
            this.setState({ sortList: null });
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
     * 並べ替えキャンセルボタン押下イベントハンドラ
     */
    handleClickCancel() {
        if (this.props.onClickCancel) {
            this.props.onClickCancel();
        }
    }

    /**
     * 並べ替え保存ボタンクリックイベント
     */
    handleClickSave() {
        var sorted = getSortLocations(this.props.sortLocations);
        if (this.props.onClickSave) {
            this.props.onClickSave(sorted);
        }
    }

    /**
     * ロケーション選択イベントハンドラ
     * @param {object} node クリックされたノード
     * @param {array} locationList 選択されたロケーションまでの親ロケーション
     */
    handleSelectLocation(node, locationList) {
        if (this.props.onSelectLocation) {
            this.props.onSelectLocation(node, locationList);
        }
    }

    //#endregion

    //#region render
    /**
     * render
     */
    render() {
        const { locations, selectLocation, selectLocPosition, sortLocations, isSortMode, isAddMode, isAddChildMode, isLoading, isReadOnly, hideOperationButton, addingNodePosition } = this.props;
        const { tree, sortList } = this.state;

        return (
            <div>
                {!isSortMode &&
                    <LocationTreeDispBox
                        isLoading={isLoading}
                        isReadOnly={isReadOnly}
                        hideOperationButton={hideOperationButton}
                        boxTitle="ロケーション一覧"
                        tree={tree}
                        locations={locations}
                        isSortMode={isSortMode}
                        isAddMode={isAddMode}
                        isAddChildMode={isAddChildMode}
                        addingNodePosition={addingNodePosition}
                        selectNode={selectLocation}
                        selectNodePosition={selectLocPosition}
                        onNodeSelect={(node, locationList) => this.handleSelectLocation(node, locationList)}
                        onClickSort={() => this.handleClickSort()}
                    />
                }
                {isSortMode &&
                    <SortableListBox
                        isLoading={isLoading}
                        boxTitle="ロケーション並べ替え"
                        sortList={sortList}
                        onClickSave={() => this.handleClickSave()}
                        onClickCancel={() => this.handleClickCancel()}
                    />
                }
            </div>
        );
    }
    //#endregion
}

LocationListBox.propTypes = {
    locations: PropTypes.array,             //ロケーション一覧
    selectLocation: PropTypes.object,       //選択中ロケーション情報
    selectLocPosition: PropTypes.array,     //選択ロケーションまでの親ロケーション一覧
    sortLocations: PropTypes.array,         //並べ替え対象ロケーション一覧
    isSortMode: PropTypes.bool,             //並べ替えモードかどうか
    isAddMode: PropTypes.bool,               //ノード追加モードかどうか
    isAddChildMode: PropTypes.bool,         //子ノード追加モードかどうか
    isLoading: PropTypes.bool,              //ロード中かどうか
    isReadOnly: PropTypes.bool,             //読み取り専用かどうか
    hideOperationButton: PropTypes.bool,    //操作ボタンを非表示にするかどうか
    onSelectLocation: PropTypes.func,       //ロケーション選択イベント関数
    onClickSort: PropTypes.func,            //並べ替えボタンクリックイベント関数
    onClickCancel: PropTypes.func,          //並べ替えキャンセルイベント関数
    onClickSave: PropTypes.func             //並べ替え保存イベント関数
};

