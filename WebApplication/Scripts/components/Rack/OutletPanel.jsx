/**
 * @license Copyright 2018 DENSO
 * 
 * OutletPanel Reactコンポーネント
 * 
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Checkbox, Clearfix } from 'react-bootstrap';
import Button from 'Common/Widget/Button';
import InputTable from 'Common/Form/InputTable';
import LabelForm from 'Common/Form/LabelForm';
import TextForm from 'Common/Form/TextForm';
import SelectForm from 'Common/Form/SelectForm';
import PointSelectModal from 'Assets/Modal/PointSelectModal';
import MessageModal from 'Assets/Modal/MessageModal';
import { validateInteger, VALIDATE_STATE } from 'inputCheck';
import { convertNumber } from 'numberUtility';
import { MESSAGEMODAL_BUTTON } from 'constant';
import { isNumber } from 'numberUtility';

/**
 * アウトレット設定コンポーネントを定義します。
 * 項目を変更すると、アウトレットの全てのデータがonChange()で返ります
 * @param {number} psNo 電源番号
 * @param {array} outlets アウトレット一覧
 * @param {array} connectors 電源コネクタリスト
 * @param {number} outletCount アウトレット数
 * @param {boolean} isReadOnly 読み取り専用かどうか
 * @param {object} lookUp 検索条件指定用のルックアップ
 * @param {function} onChange アウトレットが変更されたときに呼び出します。アウトレットをすべて返却する。
 */
export default class OutletPanel extends Component {
    
    /**
     * コンストラクタ
     */
    constructor(props) {
        super(props);
        this.state = {
            allChecked: false,
            showModal: {
                point: false,
                message: false
            },
            pointChangedIndex: null,
            searchCondition: null
        };
    }

    /********************************************
     * Reactライフサイクルメソッド
     ********************************************/
    
    /**
     * 新しいpropsを受け取るときに呼び出されます。
     * propsによってstateを変更する場合はここでthis.setState()を行います。このsetStateでrenderを呼ぶことはありません。
     * @param {*} nextProps 新しいprops
     */
    componentWillReceiveProps( nextProps ){
        const { psNo, isReadOnly } = nextProps;
        if (!isReadOnly &&
            (isReadOnly != this.props.isReadOnly || psNo != this.props.psNo)) {
            this.setState({
                allChecked: false
            });
        }
    }

    /**
     * render
     */
    render() {
        const { outlets, isReadOnly, outletCount, lookUp } = this.props;
        const { showModal, pointChangedIndex, searchCondition } = this.state;
        const useOutlets = outlets.filter((outlet) => outlet.inUse === true && outlet.checked === true);
        return (
            <div>
                <InputTable
                        headerInfo={this.tableHeader(isReadOnly, outlets)}
                        inputComponentList={this.inputComponentList(isReadOnly)}
                        data={this.inputRowInfo(outlets, isReadOnly)}
                />
                {!isReadOnly&&
                    <Button className="mt-05" 
                            iconId="delete"
                            bsSize="sm" 
                            disabled={outlets&&(outlets.length <= 0 || !outlets.some((outlet) => outlet.checked))}
                            onClick={() => this.changeComfirmShowState()} >
                            削除
                    </Button>
                }
                {!isReadOnly&&
                    <Button disabled={outlets&&outletCount ? outlets.length >= outletCount : false} 
                            className="ml-05 mt-05" 
                            iconId="add"
                            bsSize="sm" 
                            onClick={() => this.addRow()} >
                            追加
                    </Button>
                }
                <PointSelectModal showModal={showModal.point} 
                                　lookUp={lookUp}
                                  multiSelect={false}
                                  onSubmit={(point) => this.changePoint(pointChangedIndex, point)} 
                                  onCancel={() => this.changePointModalShowState()}
                />
                <MessageModal show={showModal.message} 
                              title='確認' 
                              bsSize='small'
                              buttonStyle={MESSAGEMODAL_BUTTON.confirm} 
                              onOK={() => this.deleteRow()} 
                              onCancel={() => this.changeComfirmShowState()} >
                              {showModal.message&&this.removeMessage(useOutlets)}
                </MessageModal>
            </div>
        );
    }
    
    /**
     * 削除メッセージ
     * @param {array} useOutlets 使用中のアウトレットリスト
     * @returns {array} メッセージコンポーネントリスト
     */
    removeMessage(useOutlets) {
        var messages = [];
        messages.push(<div>チェックされたアウトレットを削除します。</div>);
        messages.push(<div>よろしいですか？</div>);
                
        if (useOutlets.length > 0) {
            messages.push(<strong><div className="mt-1" >!!!注意!!!</div></strong>);
            messages.push(<strong>
                            <div>ユニットにて使用中のアウトレットがあります。</div>
                            <div>ユニットの電源設定も削除されます。</div>
                        </strong>);
            messages.push(<div className="mt-05">アウトレット番号：{useOutlets.map((outlet) => outlet.outletNo).join(', ')}</div>)            
        }
        messages.push(<div></div>);
        return messages;
    }

    /********************************************
     * InputTable作成用関数
     ********************************************/

    /**
     * ヘッダーのリストを作成する
     * @param {boolean} isReadOnly 読み取り専用かどうか
     * @param {array} outlets アウトレット一覧
     */
    tableHeader(isReadOnly, outlets){
        var headerList = [
            { label: 'アウトレット番号', columnSize: 2, isRequired: !isReadOnly },
            { label: 'アウトレット形状', columnSize: 4, isRequired: false },
            { label: 'ポイント', columnSize: (isReadOnly?6:5), isRequired: false }
        ]
        if (!isReadOnly) {
            headerList.unshift({
                label: '削除', 
                columnSize: 1, 
                showCheckBox: true, 
                checkBoxDisabled: !(outlets&&outlets.length > 0),
                onChangeChecked: (value) => this.changeAllChecked(value), checked: this.state.allChecked });
        }
        return headerList;
    }

    /**
     * 各列のコンポーネント要素リストを作成する
     * @param {boolean} isReadOnly 
     */
    inputComponentList(isReadOnly){
        var inputComponentList = [ TextForm, SelectForm, LabelForm ];
        if (!isReadOnly) {
            inputComponentList.unshift(Checkbox);
        }
        return inputComponentList; 
    }

    /**
     * 入力行リストを作成する
     * @param {array} outlets アウトレット一覧
     * @param {boolean} isReadOnly 読み取り専用かどうか
     */
    inputRowInfo(outlets, isReadOnly) {
        if (!outlets||outlets.length <= 0) {
            return null;
        }

        return outlets.map((row, index) => {
                    return (
                        {
                            id: index,
                            columnInfo: this.makeCellList(row, index, isReadOnly)
                        }
                    );
                });
    }

    /**
     * セルリストを作成する
     * @param {object} rowData 一行のデータ
     * @param {number} index 行のインデックス
     * @param {boolean} isReadOnly 読み取り専用かどうか
     * @returns {array} 1行分のセルのpropsリスト
     */
    makeCellList(rowData, index, isReadOnly) {
        const { connectors } = this.props;
        const { outletNo, outletType, point, isNew } = rowData;
        const connectorList = connectors ? connectors.map((item) => ({ name: item.connectorName, value: item.connectorNo })) : [];
        const validate = this.validate(rowData, isReadOnly, index);
        
        var cellList = [
            { 
                isReadOnly: (isReadOnly? true : !isNew),
                value: outletNo,
                validationState: validate.outletNo.state, 
                helpText: validate.outletNo.helpText, 
                placeholder: 'アウトレット番号' ,
                onChange: (value)=>this.changeItemOutletNo(value, index)
            },
            { 
                isReadOnly: isReadOnly, 
                value: outletType&&outletType.connectorNo, 
                options: connectorList, 
                validationState: validate.outletType.state, 
                onChange: (value) => this.changeItemConnector(value, index) 
            },
            { 
                isReadOnly: isReadOnly, 
                value: (point?point.pointName:'(なし)'), 
                addonButton: (!isReadOnly&&
                    [
                      {key:1, iconId:'link', isCircle:true, tooltipLabel:'ポイント選択', onClick:() => this.changePointModalShowState(index) },
                      {key:2, iconId:'unlink', isCircle:true, tooltipLabel:'解除', onClick: () => this.clearPoint(index)}
                    ]  
                )
            }
        ];

        if (!isReadOnly) {
            cellList.unshift(
                { checked: rowData.checked, bsClass: "flex-center", onChange:(e)=>this.changeItemChecked(e.target.checked, index) }
            );
        }
        return cellList;
    }

    /********************************************
     * イベント
     ********************************************/

    /**
     * チェック状態変更イベント
     * @param {boolean} checked 変更後のチェック状態
     * @param {number} index インデックス
     */
    changeItemChecked(checked, index) {
        if (this.props.onChange) {
            var outlets = Object.assign([], this.props.outlets);
            outlets[index].checked = checked;
            this.setState({allChecked: this.isAllChecked(outlets)});
            this.props.onChange(outlets, this.isError(outlets));
        }
    }

    /**
     * アウトレット番号の変更イベント
     * @param {string} value 変更後のアウトレット番号
     * @param {number} index インデックス
     */
    changeItemOutletNo(value, index){
        var outlets = Object.assign([], this.props.outlets);
        outlets[index].outletNo = value;
        outlets[index].isError = this.isValidateError(this.validate(outlets[index], this.props.isReadOnly, index));
        this.props.onChange(outlets, this.isError(outlets));
    }
    
    /**
     * アウトレット形状の変更イベント
     * @param {string} value 変更後のアウトレット形状No
     * @param {number} index インデックス
     */
    changeItemConnector(value, index){        
        var outlets = Object.assign([], this.props.outlets);
        let targetType = this.props.connectors.find((connector) => connector.connectorNo === convertNumber(value));
        outlets[index].outletType = targetType ? Object.assign({}, targetType) : null;
        this.props.onChange(outlets, this.isError(outlets));
    }

    /********************************************
     * 行の追加・削除
     ********************************************/

    /**
     * 行を追加する
     */
    addRow(){        
        if (this.props.onChange) {
            //新しいアウトレット番号を発行する(新しい番号を振りなおす)
            const { outlets } = this.props;
            var outletNoList = outlets ? outlets.map((outlet) => outlet.outletNo) : [];
            const maxNumber = Math.max.apply(null, outletNoList);
            var newOutletNo = 1;
            if(maxNumber > 0){
                newOutletNo = maxNumber + 1;
            }

            var workOutlets = Object.assign([], outlets);
            workOutlets.push({ outletNo: newOutletNo, outletType: null, point: null , isError: false, isNew: true });
            
            this.props.onChange(workOutlets, this.isError(workOutlets));
        }
    }

    /**
     * チェックされた行を削除する
     */
    deleteRow(){
        if (this.props.onChange) {
            var workOutlets = Object.assign([], this.props.outlets);            
            workOutlets = workOutlets.filter((outlet) => {
                return !outlet.checked;
            });
            this.setState({allChecked: this.isAllChecked(workOutlets), showModal: { message: false }});
            this.props.onChange(workOutlets, this.isError(workOutlets));            
        }
    }

    /********************************************
     * モーダル表示変更
     ********************************************/

    /**
     * 確認メッセージの表示状態を変更する
     */
    changeComfirmShowState() {
        var obj =  Object.assign({}, this.state);
        obj.showModal.message = !obj.showModal.message;
        this.setState(obj);
    }

    /**
     * ポイント選択モーダルの表示状態を変更する
     */
    changePointModalShowState(index) {
        var obj =  Object.assign({}, this.state);
        obj.showModal.point = !obj.showModal.point;
        obj.pointChangedIndex = index;        //ポイントを変更するインデックスを保持しておく
        this.setState(obj);
    }

    /**
     * ポイントを変更する
     * @param {number} index インデックス
     * @param {object} point 変更するポイント
     */
    changePoint(index, point) {
        var outlets = Object.assign([], this.props.outlets);
        outlets[index].point = {
            systemId: point.systemId,
            pointNo: point.pointNo,
            pointName: point.pointName
        };
        this.changePointModalShowState();
        this.props.onChange(outlets, this.isError(outlets));
    }

    /**
     * ポイントの設定をクリアする
     * @param {number} index インデックス
     */
    clearPoint(index) {
        var outlets = Object.assign([], this.props.outlets);
        outlets[index].point = null;
        this.props.onChange(outlets, this.isError(outlets));
    }

    /********************************************
     * 削除用チェックボックスの関数
     ********************************************/

    /**
     * 全チェックする
     * @param {boolean} checked 変更後のチェック状態
     */
    changeAllChecked(checked){
        if (this.props.onChange) {
            const workOutlets = Object.assign([], this.props.outlets);
            workOutlets.some((outlet) => {
                outlet.checked = checked
            })
            
            this.setState({allChecked: checked});
            this.props.onChange(workOutlets, this.isError(workOutlets));
        }
    }

    /**
     * 全てチェックされているかどうか
     * @param {array} list 対象のリスト 
     */
    isAllChecked(list) {
        return list&&list.length>0 ? list.every((item) => item.checked === true) : false;
    }

    /********************************************
     * 入力検証
     ********************************************/
    
    /**
     * 入力検証する
     * @param {object} outlet アウトレット情報
     * @param {boolean} isReadOnly 読み取り専用かどうか
     * @param {number} index インデックス
     * @returns {object} 検証結果
     */
    validate(outlet, isReadOnly, index){
        var validate = { outletNo: { state: null }, outletType: { state: null } };
        if (!isReadOnly) {
            validate.outletNo = this.validateOutletNo(outlet.outletNo, index);
            validate.outletType =  { state: VALIDATE_STATE.success };
        }
        return validate;
    }

    /**
     * アウトレット番号の入力チェック
     * @param {string} value アウトレット番号
     * @param {number} index インデックス
     * @returns {object} 検証結果
     */
    validateOutletNo(value, index) {
        const { outlets} = this.props;
        var validate = validateInteger(value, 1, 100);
        if (validate.state === VALIDATE_STATE.success &&
            outlets&&outlets.some((outlet, i) => {
                let isMatch = false;
                if (!isNumber(outlet.outletNo) && !isNumber(value)) {
                    isMatch = outlet.outletNo === value;
                } else {
                    isMatch = outlet.outletNo === parseInt(value);
                }
                return isMatch && index !== i;
            })) {
            validate = {  
                state: VALIDATE_STATE.error,
                helpText: 'アウトレット番号が重複しています。'
            };
        }        
        return validate;
    }

    /**
     * アウトレット情報にエラーがあるかどうか
     * @param {array} outlets アウトレットリスト
     * @returns {boolean} エラーかどうか
     */
    isError(outlets) {
        return outlets ? outlets.some((outlet) => outlet.isError) : false;
    }

    /**
     * 検証エラーがあるかどうか
     * @param {object} validate 検証結果
     * @returns {boolean} 検証エラーがあるかどうか
     */
    isValidateError(validate){
        return (validate.outletNo.state !== VALIDATE_STATE.success);
    }

}

OutletPanel.propTypes = {
    psNo: PropTypes.number.isRequired,
    outlets: PropTypes.arrayOf(PropTypes.shape({
        outletNo: PropTypes.number.isRequired,
        outletType: PropTypes.shape({
            connectorNo: PropTypes.number.isRequired,
            connectorName: PropTypes.string.isRequired
        }),
        point: PropTypes.object
    })),
    connectors: PropTypes.arrayOf(PropTypes.shape({
        connectorNo: PropTypes.number.isRequired,
        connectorName: PropTypes.string.isRequired
    })),
    outletCount: PropTypes.number,
    lookUp: PropTypes.object,
    isReadOnly: PropTypes.bool,
    onChange: PropTypes.func
}
