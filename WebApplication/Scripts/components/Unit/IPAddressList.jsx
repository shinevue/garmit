/**
 * @license Copyright 2018 DENSO
 * 
 * IPAddressList Reactコンポーネント
 * 
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Checkbox } from 'react-bootstrap';

import InputTable from 'Common/Form/InputTable';
import LabelForm from 'Common/Form/LabelForm';
import TextForm from 'Common/Form/TextForm';
import SelectForm from 'Common/Form/SelectForm';
import Button from 'Common/Widget/Button';
import MessageModal from 'Assets/Modal/MessageModal';

import { IP_ADDRESS_TYPE_MAP, MESSAGEMODAL_BUTTON } from 'constant';
import { validateText, validateSelect, VALIDATE_STATE, errorResult } from 'inputCheck';
import { MAXLENGTH_UNITNETWORK } from 'assetUtility';

const MAX_IPADDRESS_COUNT = 100;

/**
 * IPアドレス一覧のコンポーネントを定義します。
 * @param {array} ipAddresses IPアドレス一覧
 * @param {array} ports ポート一覧
 * @param {boolean} isApply IPアドレスへの適用しているかどうか
 * @param {boolean} isReadOnly 読み取り専用かどうか
 * @param {function} onChange ネットワーク設定情報が変更されたときに呼び出す
 */
export default class IPAddressList extends Component {
    
    /**
     * コンストラクタ
     */
    constructor(props) {
        super(props);
        this.state = { 
            allChecked: false,
            showMessage: false
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
        const { ipAddresses, ports, isReadOnly, isApply } = nextProps;
        if (!isReadOnly &&
            (isReadOnly != this.props.isReadOnly)) {
            this.setState({
                allChecked: false,
                showMessage: false
            });
        } else if (!isReadOnly && isApply && isApply != this.props.isApply) {
            var workIpAddresses = Object.assign([], ipAddresses);

            workIpAddresses.forEach((ipAddress) => {
                ports.some((port) => {
                    if (ipAddress.port && 
                        ipAddress.port.portSeqNo === port.portSeqNo && 
                        ipAddress.port.portNo !== port.portNo) {
                            ipAddress.port = null;
                            ipAddress.isError = this.isValidateError(this.validate(ipAddress, isReadOnly));
                            return true;
                    }
                });
                
            });

            this.onChange(workIpAddresses, this.isError(workIpAddresses, isApply));
        }
    }

    /**
     * render
     */
    render() {
        const { ipAddresses, isReadOnly, isApply } = this.props;
        const { showMessage } = this.state;
        return (
            <div>
                {!isApply &&
                    <div className="text-red" >ポート一覧の変更を適用してください。適用後に変更可能となります。選択中のポート番号が変更された場合はポートの選択がクリアされます。</div>
                }
                {!isReadOnly||(ipAddresses&&ipAddresses.length > 0) ?
                    <InputTable
                            headerInfo={this.tableHeader(isReadOnly, ipAddresses)}
                            inputComponentList={this.inputComponentList(isReadOnly)}
                            data={this.inputRowInfo(ipAddresses, isReadOnly)}
                    />
                :
                    <div>IPアドレスはありません</div>
                }
                {!isReadOnly&&
                    <Button className="mt-05" 
                            iconId="delete" 
                            bsSize="sm"
                            disabled={!isApply || ipAddresses&& (ipAddresses.length <= 0 || !ipAddresses.some((ipAddress) => ipAddress.checked))}
                            onClick={() => this.changeComfirmShowState()} >
                            削除
                    </Button>
                }
                {!isReadOnly&&
                    <Button disabled={!isApply || (ipAddresses ? ipAddresses.length >= MAX_IPADDRESS_COUNT : false)} 
                            className="ml-05 mt-05" 
                            iconId="add" 
                            bsSize="sm"
                            onClick={() => this.addRow()} >
                            追加
                    </Button>
                }
                <MessageModal show={showMessage} 
                              title='確認' 
                              bsSize='small'
                              buttonStyle={MESSAGEMODAL_BUTTON.confirm}
                              onOK={() => this.deleteRow()} 
                              onCancel={() => this.changeComfirmShowState()} >
                              <div>チェックされたIPアドレスを削除します。</div>
                              <div>よろしいですか？</div>
                </MessageModal>
            </div>
        );
    }

    /********************************************
     * InputTable作成用関数
     ********************************************/

    /**
     * ヘッダーのリストを作成する
     * @param {boolean} isReadOnly 読み取り専用かどうか
     * @param {array} ipAddresses IPアドレス一覧
     */
    tableHeader(isReadOnly, ipAddresses){
        var headerList = [
            { label: 'No.', columnSize: 1, isRequired: false },
            { label: '種別', columnSize: 1, isRequired: !isReadOnly },
            { label: '名称', columnSize: 2, isRequired: !isReadOnly },
            { label: 'IPアドレス', columnSize: 2, isRequired: !isReadOnly },
            { label: 'サブネットマスク', columnSize: 2, isRequired: false },
            { label: 'デフォルトゲートウェイ', columnSize: 2, isRequired: false },
            { label: 'ポート', columnSize: (isReadOnly?2:1), isRequired: false }
        ];

        if (!isReadOnly) {
            headerList.unshift({ 
                label: '削除', 
                columnSize: 1,
                showCheckBox: true,
                checkBoxDisabled: !(ipAddresses&&ipAddresses.length > 0) || !this.props.isApply,
                onChangeChecked: (value) => this.changeAllChecked(value), 
                checked: this.state.allChecked
            })
        }
        return headerList;
    }

    /**
     * 各列のコンポーネント要素リストを作成する
     * @param {boolean} isReadOnly 
     */
    inputComponentList(isReadOnly){
        var inputComponentList = [ LabelForm, SelectForm, TextForm, TextForm, TextForm, TextForm, SelectForm ];
        if (!isReadOnly) {
            inputComponentList.unshift(Checkbox);
        }
        return inputComponentList; 
    }

    /**
     * 入力行リストを作成する
     * @param {array} ipAddresses IPアドレス一覧
     * @param {boolean} isReadOnly 
     */
    inputRowInfo(ipAddresses, isReadOnly) {
        if (!ipAddresses && ipAddresses.length <= 0) {
            return null;
        }

        return ipAddresses.map((row, index) => {
                    return (
                        {
                            id: row.ipNo,
                            columnInfo: this.makeCellList(row, isReadOnly, index)
                        }
                    )
                });
    }

    /**
     * セルリストを作成する
     * @param {object} rowData 一行のデータ
     * @param {boolean} isReadOnly 読み取り専用かどうか
     * @param {number} index 行のインデックス
     */
    makeCellList(rowData, isReadOnly, index) {
        const { ports, isApply } = this.props;
        const validate = this.validate(rowData, isReadOnly);

        var cellList = [
            { 
                isReadOnly: isReadOnly || !isApply, 
                value: rowData.ipNo 
            },
            { 
                isReadOnly: isReadOnly || !isApply, 
                value: rowData.type, 
                options: IP_ADDRESS_TYPE_MAP, 
                validationState: validate.type.state, 
                helpText: validate.type.helpText, 
                onChange: (value) => this.changeValue(value, index, 'type')
            },
            { 
                isReadOnly: isReadOnly || !isApply, 
                value: rowData.name, 
                validationState: validate.name.state, 
                helpText: validate.name.helpText, 
                onChange: (value) => this.changeValue(value, index, 'name'), 
                placeholder: '名称', 
                maxlength: MAXLENGTH_UNITNETWORK.ipAddressName
            },
            { 
                isReadOnly: isReadOnly || !isApply, 
                value: rowData.address, 
                validationState: validate.address.state, 
                helpText: validate.address.helpText, 
                onChange: (value) => this.changeValue(value, index, 'address'),
                placeholder: 'IPアドレス', 
                maxlength: MAXLENGTH_UNITNETWORK.ipAddressString
            },
            { 
                isReadOnly: isReadOnly || !isApply, 
                value: rowData.subnetMask, 
                validationState: validate.subnetMask.state, 
                helpText: validate.subnetMask.helpText, 
                onChange: (value) => this.changeValue(value, index, 'subnetMask'),
                placeholder: 'サブネットマスク', 
                maxlength: MAXLENGTH_UNITNETWORK.ipAddressString
            },
            { 
                isReadOnly: isReadOnly || !isApply, 
                value: rowData.defaultGateway, 
                validationState: validate.defaultGateway.state, 
                helpText: validate.defaultGateway.helpText, 
                onChange: (value) => this.changeValue(value, index, 'defaultGateway'),
                placeholder: 'デフォルトゲートウェイ', 
                maxlength: MAXLENGTH_UNITNETWORK.ipAddressString
            },
            { 
                isReadOnly: isReadOnly || !isApply, 
                value: rowData.port&&rowData.port.portSeqNo, 
                options: (ports&&ports.map((port) => { return {value: port.portSeqNo, name: port.portNo}; })), 
                validationState: validate.port.state, 
                helpText: validate.port.helpText, 
                onChange: (value) => this.changeItemPort(value, index) 
            }
        ]
        if (!isReadOnly) {
            cellList.unshift(
                { 
                    disabled: !isApply,
                    checked: rowData.checked, 
                    bsClass: "flex-center", 
                    onChange:(e)=>this.changeItemChecked(e.target.checked, index) 
                }
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
            var ipAddresses = Object.assign([], this.props.ipAddresses);
            ipAddresses[index].checked = checked;
            this.setState({allChecked: this.isAllChecked(ipAddresses)});
            this.onChange(ipAddresses, this.isError(ipAddresses));
        }
    }

    /**
     * ポートを変更する
     * @param {string} portSeqNo ポートの連番
     * @param {number} index インデックス
     */
    changeItemPort(portSeqNo, index){
        const targetPort = this.props.ports.find((item) => item.portSeqNo === parseInt(portSeqNo));
        this.changeValue(targetPort, index, 'port');
    }
    /********************************************
     * 行の追加・削除
     ********************************************/

    /**
     * 行を追加する
     */
    addRow(){        
        if (this.props.onChange) {
            //新しいIPアドレス番号を発行する
            const { ipAddresses } = this.props;
            var ipNoList = ipAddresses ? ipAddresses.map((port) => port.ipNo) : [];
            const maxNumber = Math.max.apply(null, ipNoList);
            var newIpNo = 1;
            if(maxNumber > 0){
                newIpNo = maxNumber + 1;
            }

            var workIpAddresses = Object.assign([], ipAddresses);
            workIpAddresses.push({ 
                ipNo: newIpNo, 
                name: '', 
                type: null,
                address: '' , 
                subnetMask: '' ,
                defaultGateway: '' ,
                port: null,
                isError: true
            });
            
            this.setState({allChecked: this.isAllChecked(workIpAddresses)});
            this.onChange(workIpAddresses, this.isError(workIpAddresses));
        }
    }

    /**
     * チェックされた行を削除する
     */
    deleteRow(){
        if (this.props.onChange) {
            var workIpAddresses = Object.assign([], this.props.ipAddresses);            
            workIpAddresses = workIpAddresses.filter((ipAddress) => {
                return !ipAddress.checked;
            });
            this.setState({allChecked: this.isAllChecked(workIpAddresses), showMessage: false});
            this.onChange(workIpAddresses, this.isError(workIpAddresses), true);            
        }
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
            const workIpAddresses = Object.assign([], this.props.ipAddresses);
            workIpAddresses.some((ipAddress) => {
                ipAddress.checked = checked
            });
            
            this.setState({allChecked: checked});
            this.onChange(workIpAddresses, this.isError(workIpAddresses));
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
     * モーダル表示変更
     ********************************************/

    /**
     * 確認メッセージの表示状態を変更する
     */
    changeComfirmShowState() {
        var obj =  Object.assign({}, this.state);
        obj.showMessage = !obj.showMessage;
        this.setState(obj);
    }

    /********************************************
     * 入力検証
     ********************************************/

    /**
     * IPアドレス名称の入力検証
     * @param {string} value 名称
     * @returns {object} 検証結果
     */
    validateName(value) {
        return validateText(value, MAXLENGTH_UNITNETWORK.ipAddress);
    }

    /**
     * IPアドレス（サブネットマスク、デフォルトゲートウェイ）の入力検証
     * @param {string} value 対象の値
     * @param {boolean} isRequired 必須かどうか
     * @returns {object} 検証結果
     */
    validateIpAddressString(value, isRequired) {
        return validateText(value, MAXLENGTH_UNITNETWORK.ipAddressString, !isRequired);
    }

    /**
     * 入力検証する
     * @param {object} ipAddress IPアドレス情報
     * @param {boolean} isReadOnly 読み取り専用かどうか
     * @returns {object} 検証結果
     */
    validate(ipAddress, isReadOnly){
        var validate = { name: { state: null }, type: { state: null }, address: { state: null }, subnetMask: { state: null }, defaultGateway: { state: null }, port: { state: null } };
        if (!isReadOnly) {
            validate.name = this.validateName(ipAddress.name);
            validate.type = validateSelect(ipAddress.type);
            validate.address = this.validateIpAddressString(ipAddress.address, true);
            validate.subnetMask = this.validateIpAddressString(ipAddress.subnetMask, false);
            validate.defaultGateway = this.validateIpAddressString(ipAddress.defaultGateway, false);
            validate.port =  { state: VALIDATE_STATE.success };
        }
        return validate;
    }

    /**
     * IPアドレス一覧にエラーがあるかどうか
     * @param {array} ports ポート一覧
     * @returns {boolean} エラーかどうか
     */
    isError(ipAddresses, isApply) {
        const apply = isApply ? isApply: this.props.isApply;
        if (apply) {
            return ipAddresses ? ipAddresses.some((ipAddress) => ipAddress.isError) : false;
        } else {
            return true;
        }
    }

    /********************************************
     * その他
     ********************************************/
    
    /**
     * IPアドレス情報の値を変更する
     * @param {*} value 変更後の値
     * @param {number} index インデックス
     * @param {string} key 変更対象キー
     */
    changeValue(value, index, key) {
        let ipAddresses = Object.assign([], this.props.ipAddresses);
        if (ipAddresses[index][key] && typeof ipAddresses[index][key] === 'object') {
            ipAddresses[index][key] = value && Object.assign({}, value);
        } else {
            ipAddresses[index][key] = value;
        }
        
        ipAddresses[index].isError = this.isValidateError(this.validate(ipAddresses[index], this.props.isReadOnly));
        
        this.onChange(ipAddresses, this.isError(ipAddresses));
    }

    /**
     * IPアドレス一覧の変更イベントを呼び出す
     * @param {array} ipAddresses IPアドレス一覧
     * @param {boolean} isError エラーかどうか
     */
    onChange(ipAddresses, isError) {
        if (this.props.onChange) {
            this.props.onChange(ipAddresses, isError);
        }
    }

    /**
     * 検証エラーがあるかどうか
     * @param {object} validate 検証結果
     * @returns {boolean} 検証エラーがあるかどうか
     */
    isValidateError(validate){
        if (validate.name.state !== VALIDATE_STATE.success ||
            validate.type.state !== VALIDATE_STATE.success ||
            validate.address.state !== VALIDATE_STATE.success ||
            validate.subnetMask.state !== VALIDATE_STATE.success ||
            validate.defaultGateway.state !== VALIDATE_STATE.success ||
            validate.port.state !== VALIDATE_STATE.success) {
                return true;
        }
        return false;
    }
}

IPAddressList.propTypes = {
    ipAddresses: PropTypes.arrayOf(PropTypes.shape({
        IpNo: PropTypes.number,
        Name: PropTypes.string,
        Type: PropTypes.number,
        Address: PropTypes.string,
        SubnetMask: PropTypes.string,
        DefaultGateway: PropTypes.string,
        Port: PropTypes.shape({
            portSeqNo: PropTypes.number,
            portNo: PropTypes.number,
            name: PropTypes.string
        })
    })),
    ports: PropTypes.arrayOf(PropTypes.shape({
        portSeqNo: PropTypes.number,
        portNo: PropTypes.number,
        name: PropTypes.string
    })),
    isApply: PropTypes.bool,
    isReadOnly: PropTypes.bool,
    onChange: PropTypes.func
}
