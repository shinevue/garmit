/**
 * Copyright 2017 DENSO Solutions
 * 
 * ポイント登録コンテンツ Reactコンポーネント
 *  
 */
'use strict';

import React, { Component } from 'react';
import { sendData, EnumHttpMethod, NETWORKERROR_MESSAGE } from 'http-request';
import ListDisplayTable from 'Assets/ListDisplayTable';
import SearchConditionBox from 'Assets/Condition/SearchConditionBox';
import Box from 'Common/Layout/Box';
import MessageModal from 'Assets/Modal/MessageModal';

const HEADER_SET = ["ポイント番号", "ポイント名称"];
/**
* ポイント登録コンテンツ
*/
export default class AddPointContents extends Component {
    constructor(props) {
        super(props)
        this.state = {
            duplicateErrorShow: false,  //重複エラーメッセージモーダル表示状態
            sourceErrorShow: false,      //元ポイントエラーメッセージモーダル表示状態
            networkErrorShow: false,
            points: null,           //テーブル表示用データ
            searchCondition: null,  //検索条件
            currentPage: 1,         //検索結果テーブルの表示中ページ番号
            isLoading: false
        }
    }

    /**
     * 検索ボタンクリック時
     * @param {any} condition
     */
    handleSearchClick(condition) {
        this.changeLoadState(true);
        sendData(EnumHttpMethod.post, '../../api/Point/getPointsByLookUp', condition, (info, networkError) => {  
            if (info) {         
                this.setState({ points: this.convertPoints(info) });
            }
            if (networkError) {
                this.setState({ networkErrorShow: true });
            }
            this.changeLoadState(false);
        });
    }

    /**
     * 検索結果のstate変更イベント
     * @param {any} checked
     */
    handleChangeCheck = (checked) => {
        let checkedIndexes = checked;
        const { editingPointNo, selectedPointNoList } = this.props;
        const matchEditIndex = _.findIndex(checked, (index) => {
            return this.state.points[index].cells[0].value === editingPointNo;
        });
        const matchSelectIndex = _.findIndex(checked, (index) => {
            return _.indexOf(_.map(selectedPointNoList, 'pointNo'), this.state.points[index].cells[0].value)!==-1;
        });
        if (matchEditIndex !== -1) {
            this.setState({ sourceErrorShow: true });  //編集元ポイントがチェックされた場合
            checkedIndexes.splice(matchEditIndex, 1);
        }
        if (matchSelectIndex !== -1){
            this.setState({ duplicateErrorShow: true });  //選択済みポイントがチェックされた場合
            checkedIndexes.splice(matchSelectIndex, 1);
        }
        this.props.onChangeCheck(checkedIndexes);
    }

    /**
     * render
     */
    render() {
        const { lookUp, checked } = this.props;
        const { duplicateErrorShow, sourceErrorShow, networkErrorShow, points, isLoading, searchCondition } = this.state;

        return (
            <div>
                <SearchConditionBox
                    isLoading={isLoading}
                    targets={['locations', 'enterprises', 'tags', 'egroups', 'hashTags']}
                    lookUp={lookUp}
                    searchCondition={searchCondition}
                    onSearchClick={(condition) => this.handleSearchClick(condition)}
                    onChange={(condition) => this.setState({ searchCondition: condition })}
                />
                <Box isLoading={isLoading}>
                    <Box.Header>
                        <Box.Title>検索結果</Box.Title>
                    </Box.Header >
                    <Box.Body>
                        {points &&
                            <ListDisplayTable
                                id="pointList"
                                order={[[1, 'asc']]}
                                useCheckbox={true}
                                checked={checked}
                                headerCheckbox={true}
                                headerSet={HEADER_SET}
                                data={points}
                                onChangeCheckState={this.handleChangeCheck}
                            />
                        }
                    </Box.Body>
                </Box>
                <MessageModal
                    show={duplicateErrorShow}
                    title="選択不可"
                    children="演算対象ポイントは重複して登録できません。"
                    bsSize="small"
                    buttonStyle="message"
                    onCancel={() => this.setState({ duplicateErrorShow: false })}
                />
                <MessageModal
                    show={sourceErrorShow}
                    title="選択不可"
                    children="元となる演算ポイントは演算対象ポイントに登録できません。"
                    bsSize="small"
                    buttonStyle="message"
                    onCancel={() => this.setState({ sourceErrorShow: false })}
                />
                <MessageModal
                    show={networkErrorShow}
                    title="エラー"
                    children={NETWORKERROR_MESSAGE}
                    bsSize="small"
                    buttonStyle="message"
                    onCancel={() => this.setState({ networkErrorShow: false })}
                />
            </div>
        )

    }

    //#region その他関数
    /**
     * ロード状態を変更する
     */
    changeLoadState(state) {
        this.setState({ isLoading: state });
        if (this.props.onChangeLoadState) {
            this.props.onChangeLoadState(state);
        }
    }

    /**
     * Pointnの配列をテーブル表示用に変換する
     */
    convertPoints(points) {
        let result = [];
        points.forEach((point) => {
            result.push({ cells: [{ value: point.pointNo }, { value: point.pointName }] })
        });
        return result;
    }

    /**
     * チェックされているポイント情報を取得する(親モーダルからの呼び出しに使用)
     * * @param {array} checkedIndexes  チェックされている行のインデックス配列
     * * @param {func} callback
     */
    getCheckedPoint(checkedIndexes, callback) {        
        //チェックされている行のポイント番号配列取得
        let pointNoList = this.getPointNoList(checkedIndexes, this.state.points);

        this.changeLoadState(true);
        //ポイント情報取得取得
        this.getPointInfo(pointNoList)
            .then((pointsInfo) => {
                //成功
                callback && callback(pointsInfo);
            }).catch(() => { 
                //エラー処理

            }).then(() => {
                //終了後ロード状態解除
                this.changeLoadState(false);
            })
            
    }

    /**
     * チェックされているインデックスの一覧からポイント番号の一覧を取得する
     */
    getPointNoList(indexes, pointRows) {
        //ポイント番号取得
        let pointNoList = [];
        indexes.forEach((index) => {
            pointNoList.push(pointRows[index].cells[0].value);
        });
        return pointNoList;
    }

    /**
     * チェックされているインデックスの一覧からポイント番号の一覧を取得する
     */
    getPointInfo(pointNoList) {
        return new Promise((resolve, reject) => {
            sendData(EnumHttpMethod.post, '../../api/Point/getPoints', pointNoList, (info, networkError) => {
                if (networkError) {
                    this.setState({ networkErrorShow: true });
                }
                if (info && info.points.length > 0) {
                    resolve(info.points);
                }
                else {
                    reject();
                }
           });
        });
    }
    //#endregion
}

AddPointContents.propTypes = {
    lookUp: PropTypes.bool,               //検索条件選択肢情報
    checked:PropTypes.bool,               //チェック状態ポイント行インデックス
    editingPointNo: PropTypes.number,     //編集中ポイント番号
    selectedPointNoList:PropTypes.array,  //選択済みポイント番号配列
    onChangeLoadState: PropTypes.func,    //ロード状態変更イベント関数
    onChangeCheck: PropTypes.func,      　//チェック状態変更イベント関数
}