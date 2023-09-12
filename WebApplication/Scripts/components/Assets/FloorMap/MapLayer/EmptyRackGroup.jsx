/**
 * Copyright 2017 DENSO Solutions
 * 
 * 連続空きラック情報表示レイヤ（キャパシティ） Reactコンポーネント
 *  
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';

import RackGroupFrameObject from 'Assets/FloorMap/Object/RackGroupFrameObject.jsx';
import EgroupStatusObject from 'Assets/FloorMap/Object/EgroupStatusObject.jsx';

/**
 * 連続空きラック情報表示レイヤ（キャパシティ）
 */
export default class EmptyRackGroup extends Component {

    constructor(props) {
        super(props);
        const layoutObjects = _.get(this.props, "layoutObjects");
        this.state = {
            emptyRackGroupList: this.generateRackGroups(_.get(this.props, "emptyRackGroupList"), layoutObjects),
            selectEmptyRackGroup: this.generateRackGroup(_.get(this.props, "selectEmptyRackGroup"), layoutObjects),
            linkEgroupObjects: this.generateEgroupObjects(_.get(this.props, "linkEgroupObjects"), layoutObjects)
        };
    }

    /**********************************
    * 
    * ライフサイクルイベント
    * 
    **********************************/

    /**
     * Propsが更新されたときに呼ばれます。
     */
    componentWillReceiveProps(nextProps) {
        //レイアウトオブジェクトが更新されている場合オブジェクトがずれてしまうため、サイズと位置はlayoutObjects情報のものを使用する
        if (JSON.stringify(nextProps.emptyRackGroupList) !== JSON.stringify(this.state.emptyRackGroupList)) {
            this.setState({ emptyRackGroupList: this.generateRackGroups(nextProps.emptyRackGroupList, nextProps.layoutObjects) })
        }
        if (JSON.stringify(nextProps.selectEmptyRackGroup) !== JSON.stringify(this.props.selectEmptyRackGroup)) {
            this.setState({ selectEmptyRackGroup: this.generateRackGroup(nextProps.selectEmptyRackGroup, nextProps.layoutObjects) });
        }
        if (JSON.stringify(nextProps.linkEgroupObjects) !== JSON.stringify(this.props.linkEgroupObjects)) {
            this.setState({ linkEgroupObjects: this.generateEgroupObjects(nextProps.linkEgroupObjects, nextProps.layoutObjects) })
        }
    }

    /**
     * コンポーネントをアップデートするかどうか
     */
    shouldComponentUpdate(nextProps, nextState) {
        if (JSON.stringify(nextProps.emptyRackGroupList) !== JSON.stringify(this.props.emptyRackGroupList)) {
            return true;    //空きラック群情報が変更されている場合
        }
        if (JSON.stringify(nextProps.selectEmptyRackGroup) !== JSON.stringify(this.props.selectEmptyRackGroup)) {
            return true;    //選択中空きラック群情報が変更されている場合
        }
        if (JSON.stringify(nextProps.linkEgroupObjects) !== JSON.stringify(this.props.linkEgroupObjects)) {
            return true;    //選択中空きラックグループに紐づく分電盤情報が変更されている場合
        }
    }

    /**********************************
    * 
    * イベントハンドラ
    * 
    **********************************/

    /**
     * 空きラック選択イベント
     */
    handleSelectEmptyRack(selectObject, groupObjects) {
        if (this.props.onSelectEmptyRack) {
            this.props.onSelectEmptyRack(selectObject, groupObjects);
        }
    }

    /**
    * 電源系統オブジェクト選択イベント
    * @param {object} selectObject　選択したオブジェクト
    */
    handleClickEgroup(selectObject) {
        if (this.props.onClickEgroup) {
            this.props.onClickEgroup(selectObject);
        }
    }

    /**********************************
    * 
    * ゲッターメソッド
    * 
    **********************************/

    /**
    * 選択中ラック関連情報（空きラックグループの枠とそれに紐づく分電盤オブジェクト）
    * @param {obj} selectEmptyRackGroup　選択した空きラックグループ
    * @param {obj} linkEgroupObjects　　選択した空きラックグループに紐づく分電盤情報
    */
    getSelectRackObjects(selectEmptyRackGroup, linkEgroupObjects) {
        return (
            <g>
                <RackGroupFrameObject
                    id="selectEmptyRack"
                    isSelect={true}
                    emptyRackObjects={selectEmptyRackGroup}
                />
                {linkEgroupObjects && linkEgroupObjects.length > 0 &&
                    <EgroupStatusObject
                        egroupObjects={linkEgroupObjects}
                        onClickEgroup={(selectObject) => this.handleClickEgroup(selectObject)}
                    />
                }
            </g>
        );
    }

    /**
     * render
     */
    render() {
        const { emptyRackGroupList, selectEmptyRackGroup, linkEgroupObjects } = this.state;

        return (
            <g id="emptyRack">
                {emptyRackGroupList &&
                    emptyRackGroupList.map((object, index) => {
                        return (<RackGroupFrameObject
                            id={index}
                            isSelect={false}
                            emptyRackObjects={emptyRackGroupList[index]}
                            onSelectEmptyRack={(selectObject, groupObjects) => this.handleSelectEmptyRack(selectObject, groupObjects)}
                        />);
                    }, this)
                }
                {selectEmptyRackGroup && selectEmptyRackGroup.length > 0 &&
                    this.getSelectRackObjects(selectEmptyRackGroup, linkEgroupObjects)
                }
            </g>
        );
    }

    /**
    * ラック群オブジェクト情報の配列を生成する
    * @param {array} updateObjects　更新されたオブジェクト情報
    * @param {array} sourceObjects　もともとのレイアウトオブジェクト情報（位置情報とサイズはこれを使用）
    */
    generateRackGroups(updateObjects, sourceObjects) {
        const rackGroups = [];
        updateObjects &&
            updateObjects.map((objectInfo) => {
                rackGroups.push(this.generateRackGroup(objectInfo, sourceObjects));
            })

        return rackGroups;
    }

    /**
    * ラック群オブジェクト情報を生成する
    * @param {array} updateObject　 更新されたオブジェクト情報
    * @param {array} sourceObjects　もともとのレイアウトオブジェクト情報（位置情報とサイズはこれを使用）
    */
    generateRackGroup(updateObject, sourceObjects) {
        const rackGroup = [];
        const length = _.size(updateObject);
        if (length > 0) {
            for (let i = 0; length > i; i++) {
                const matchData = this.searchMatchData(updateObject[i], sourceObjects);
                if (matchData) {
                    var update = $.extend({}, updateObject[i]);
                    update.position = matchData.position;
                    update.size = matchData.size;
                    rackGroup.push(update);
                }
            }
        }
        return rackGroup;
    }

    /**
    * 接続先電源系統情報を生成する
    * @param {array} updateObjects　 更新されたオブジェクト情報
    * @param {array} sourceObjects　もともとのレイアウトオブジェクト情報（位置情報とサイズ、リンク種別はこれを使用）
    */
    generateEgroupObjects(updateObjects, sourceObjects) {
        const egroupObjects = []
        const length = _.size(updateObjects);
        if (length > 0) {
            for (let i = 0; length > i; i++) {
                const matchData = this.searchMatchData(updateObjects[i], sourceObjects);
                if (matchData) {
                    var update = $.extend({}, updateObjects[i]);
                    update.position = matchData.position;
                    update.size = matchData.size;
                    update.linkType = matchData.linkType;
                    update.egroup = Object.assign({}, update.egroup, { egroupId: _.get(matchData.egroup, 'egroupId')});
                    egroupObjects.push(update);
                }
            }
        }
        return egroupObjects;
    }

    /**
    * 一致するレイアウトオブジェクト情報を検索する
    * @param {object} updateObject　更新されたオブジェクト情報
    * @param {array} sourceObjects　もともとのレイアウトオブジェクト情報（位置情報はこれを使用）
    */
    searchMatchData(updateObject, sourceObjects) {
        return sourceObjects.find((obj) => {
            if (obj.layoutId === updateObject.layoutId && obj.objectId === updateObject.objectId) {
                return obj;
            }
        })
        return null;    //一致するデータがない場合はnullを返す
    }
}

EmptyRackGroup.propTypes = {
    emptyRackGroupList: PropTypes.array,    //空きラックグループ一覧
    selectEmptyRackGroup: PropTypes.array,  //選択空きラックグループ
    linkEgroupObjects: PropTypes.array,     //選択空きラックグループに紐づく分電盤情報
    layoutObjects: PropTypes.array,         //レイアウトオブジェクト情報
    onSelectEmptyRack: PropTypes.func,      //空きラックオブジェクト選択イベント
    onClickEGroup: PropTypes.func           //分電盤オブジェクトクリックイベント
};
