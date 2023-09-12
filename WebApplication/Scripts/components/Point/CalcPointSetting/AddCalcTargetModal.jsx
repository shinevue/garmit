/**
 * Copyright 2017 DENSO Solutions
 * 
 * 演算対象ポイント追加モーダル Reactコンポーネント
 *  
 */
'use strict';

import React, { Component } from 'react';
import { Modal } from 'react-bootstrap';
import { OPERATION, OPERAND_TYPE } from 'expressionUtility';
import { CancelButton, ApplyButton } from 'Assets/GarmitButton';
import AddPointContents from 'Point/CalcPointSetting/AddPointContents';
import MessageModal from 'Assets/Modal/MessageModal';

/**
 * 演算対象ポイント追加モーダル
 */
export default class AddCalcTargetModal extends Component {

    constructor(props) {
        super(props);
        this.state = {
            modalInfo: {    //メッセージモーダル情報
                show: false,
                title:"",
                message:""
            },
            isLoading: false,
            applicable: false,    //適用できるかどうか
            checkedIndexes: []    //検索結果テーブルのチェックされている行のインデックス配列
        }
    }

    /**
     * 新しいpropsを受け取ると実行される
     * @param {any} nextProps
     */
    componentWillReceiveProps(nextProps) {
        if (!nextProps.show && this.props.show) {
            // モーダルを閉じるとき
            this.setState({
                applicable: false,
                checkedIndexes: []
            });
        }
    }

    //#region イベントハンドラ
    /**
     * ボタンクリックイベント
     */
    handleClick(type, value) {
        switch (type) {
            case OPERATION.apply:
                if (this.props.addableNumber < _.size(this.state.checkedIndexes)) {
                    const modalInfo = {
                        show: true,
                        title: "適用不可",
                        message: "1つの演算項に対して20個以上の演算対象ポイントは登録できません。" 
                    }
                    this.setState({ modalInfo:modalInfo });
                }
                else {
                    this.apply();                       //適用ボタン押下時
                }
            case OPERATION.cancel:
                if (this.props.onClick) {
                    this.props.onClick(type, value); //その他ボタン押下時（キャンセル、×）
                }
                break;
            default: break;
        }
    }

    /**
     * チェック状態変更イベント
     * @param {array} changed   変更された値
     */
    handleChangeChecked(changed) {        
        this.setState({ checkedIndexes: changed, applicable: changed.length > 0 ? true : false });
    }
    //#endregion

    //#region render
    /**
     * render
     */
    render() {
        const { editingPointNo, calcInfo, addableNumber, show, lookUp, isGroupAlarm } = this.props;
        const { modalInfo, isLoading, checkedIndexes, applicable } = this.state;

        return (
            <Modal bsSize="large" show={show} onHide={() => this.handleClick(OPERATION.cancel)} backdrop="static">
                <Modal.Header closeButton>
                    <Modal.Title>{isGroupAlarm ? "アラーム対象ポイント追加" : "演算対象追加"}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <AddPointContents
                        ref="pointList"
                        lookUp={lookUp}
                        checked={checkedIndexes}
                        editingPointNo={editingPointNo}
                        selectedPointNoList={calcInfo && _.map(calcInfo.calcDetails, (detail) => { return detail.point } )}
                        onChangeLoadState={(changed) => this.setState({ isLoading: changed })}
                        onChangeCheck={(changed) => this.handleChangeChecked(changed)}
                    />
                </Modal.Body>
                <Modal.Footer>
                    <ApplyButton
                        disabled={isLoading || !applicable}
                        onClick={() => this.handleClick(OPERATION.apply)}
                    />
                    <CancelButton
                        disabled={isLoading}
                        onClick={() => this.handleClick(OPERATION.cancel)}
                    />
                </Modal.Footer>
                <MessageModal
                    {...modalInfo}
                    children={modalInfo.message}
                    bsSize="small"
                    buttonStyle="message"
                    onCancel={() => this.setState({ modalInfo: { show: false, message: "", title: "" } })}
                />
            </Modal>
        )
    }
    //#endregion

    //#region その他関数
    /**
     * 演算対象の追加を適用する
     */
    apply() {
        if (this.props.onChangeCalcDetails) {
            let calcdetails = [];
            this.createPointCalcDetails(this.state.checkedIndexes, this.props.startNo, this.props.isCoef, (calcdetails) => {
                if (this.props.onChangeCalcDetails) {
                    this.props.onChangeCalcDetails(calcdetails);
                }
            });
        }
    }

    /**
     * ポイントの登録用情報作成
     */
    createPointCalcDetails(checkedIndexes, startNo, isCoef, callback) {
        let calcDetails = [];
        let detailNo = startNo;
        this.refs.pointList.getCheckedPoint(checkedIndexes, (pointList) => {
            pointList.forEach((point) => {
                const calcDetail = {
                    detailNo: detailNo,
                    valueType: OPERAND_TYPE.point,
                    point: _.pick(point, ['systemId', 'pointNo', 'pointName']),      //必要な情報のみにする
                    isCoef: isCoef
                }
                calcDetails.push(calcDetail);
                detailNo++;
            })
            callback && callback(calcDetails);
        });
    }
}