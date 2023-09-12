/**
 * @license Copyright 2018 DENSO
 * 
 * NetworkPortList Reactコンポーネント
 * 
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Checkbox } from 'react-bootstrap';

import Icon from 'Common/Widget/Icon';
import InputTable from 'Common/Form/InputTable';
import TextForm from 'Common/Form/TextForm';
import SelectForm from 'Common/Form/SelectForm';
import Button from 'Common/Widget/Button';
import MessageModal from 'Assets/Modal/MessageModal';

import { validateText, validateInteger, VALIDATE_STATE, errorResult } from 'inputCheck';
import { MESSAGEMODAL_BUTTON } from 'constant';
import { MAXLENGTH_UNITNETWORK } from 'assetUtility';
import { isNumber } from 'numberUtility';

/**
 * ネットワークポート一覧コンポーネント
 * @param {array} ports ポート一覧
 * @param {array} connectors ネットワークコネクタ一覧
 * @param {array} ipAddresses IPアドレス一覧
 * @param {number} portCount ポート数
 * @param {boolean} isApply IPアドレスへの適用しているかどうか
 * @param {boolean} isReadOnly 読み取り専用かどうか
 * @param {function} onChange ネットワーク設定情報が変更されたときに呼び出す
 * @param {function} onApply IPアドレスへの適用ボタンをクリック時に呼び出す
 */
export default class NetworkPortList extends Component {
    
    /**
     * コンストラクタ
     */
    constructor(props) {
        super(props);
        this.state = { 
            allChecked: false,
            showMessage: false,
            maxPortSeqNo: 0,
            isError: false
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
        const { ports, isReadOnly } = nextProps;
        if (!isReadOnly &&
            (isReadOnly != this.props.isReadOnly)) {
            this.setState({
                allChecked: false,
                maxPortSeqNo: this.getMaxPortSeqNo(ports),
                isError: false
            });
        }
    }

    /**
     * render
     */
    render() {
        const { ports, connectors, portCount, ipAddresses, isReadOnly, isApply } = this.props;
        const { showMessage, isError } = this.state;
        const networkPorts = ports.filter((port) => port.networks.length > 0  && port.checked === true);
        const usePorts = ports.filter((port) => ipAddresses.some((ip) => (ip.port && ip.port.portSeqNo === port.portSeqNo) && port.checked === true));
        return (
            <div>
                {!isReadOnly||(ports&&ports.length > 0) ?
                    <InputTable
                        headerInfo={this.tableHeader(isReadOnly, ports)}
                        inputComponentList={this.inputComponentList(isReadOnly)}
                        data={this.inputRowInfo(ports, isReadOnly)}
                    />
                :
                    <div>ネットワークポートはありません</div>
                }
                {!isReadOnly&&
                    <Button className="mt-05" 
                            iconId="delete" 
                            bsSize="sm" 
                            disabled={ports&& (ports.length <= 0 || !ports.some((port) => port.checked)) }
                            onClick={() => this.changeComfirmShowState()} >
                            削除
                    </Button>
                }
                {!isReadOnly&&
                    <Button disabled={ports&&(portCount||portCount===0) ? ports.length >= portCount : false} 
                            className="ml-05 mt-05" 
                            iconId="add"
                            bsSize="sm" 
                            onClick={() => this.addRow()} >
                            追加
                    </Button>
                }
                {!isReadOnly&&
                    <div>
                        <Button className='pull-right' bsStyle="primary" disabled={isApply||isError} onClick={() => this.onApply()} >
                            <Icon className='fal fa-angle-double-down mr-05' />
                            IPアドレス一覧へ適用
                        </Button>
                    </div>
                }
                <MessageModal show={showMessage} 
                              title='確認' 
                              bsSize='small'
                              buttonStyle={usePorts.length > 0 ? MESSAGEMODAL_BUTTON.message : MESSAGEMODAL_BUTTON.confirm} 
                              onOK={() => this.deleteRow()} 
                              onCancel={() => this.changeComfirmShowState()} >
                              {showMessage&&
                                (usePorts.length > 0 ?
                                    this.removeErrorMessage(usePorts)
                                :
                                    this.removeMessage(networkPorts)
                                )
                              }
                </MessageModal>
            </div>
        );
    }

    /********************************************
     * 削除メッセージ作成
     ********************************************/

    /**
     * 削除メッセージ
     * @param {array} networkPorts ネットワークに紐づいたポート一覧
     * @returns {array} メッセージコンポーネントリスト
     */
    removeMessage(networkPorts) {
        var messages = [];
        messages.push(<div>チェックされたポートを削除します。</div>);
        messages.push(<div>よろしいですか？</div>);
                
        if (networkPorts.length > 0) {
            messages.push(<strong><div className="mt-1" >!!!注意!!!</div></strong>);
            messages.push(<strong>
                            <div>ネットワーク接続中のポートがあります。</div>
                            <div>ネットワーク接続情報も解除されます。</div>
                        </strong>);
            messages.push(<div className="mt-05">ポート番号：{networkPorts.map((port) => port.portNo).join(', ')}</div>)            
        }
        messages.push(<div></div>);
        return messages;
    }

    /**
     * 削除エラーメッセージ
     * @param {array} usePorts IPアドレス一覧で使用中のポート一覧
     * @returns {array} メッセージコンポーネントリスト
     */
    removeErrorMessage(usePorts) {
        var messages = [];
        messages.push(<div>IPアドレス一覧で使用中のポートがあるため、削除できません。</div>);                
        messages.push(<div className="mt-05">ポート番号：{usePorts.map((port) => port.portNo).join(', ')}</div>)    
        messages.push(<div></div>);
        return messages;
    }

    /********************************************
     * InputTable作成用関数
     ********************************************/

    /**
     * ヘッダーのリストを作成する
     * @param {boolean} isReadOnly 読み取り専用かどうか
     * @param {array} ports ポート一覧
     */
    tableHeader(isReadOnly, ports){
        var headerList = [
            { label: 'ポート番号', columnSize: 1, isRequired: !isReadOnly },
            { label: '名称', columnSize: 4, isRequired: !isReadOnly },
            { label: 'コネクタ形状', columnSize: (isReadOnly?7:6), isRequired: false }
        ];

        if (!isReadOnly) {
            headerList.unshift({ 
                label: '削除', 
                columnSize: 1, 
                showCheckBox: true,
                checkBoxDisabled: !(ports&&ports.length > 0),
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
        var inputComponentList = [ TextForm, TextForm, SelectForm ];
        if (!isReadOnly) {
            inputComponentList.unshift(Checkbox);
        }
        return inputComponentList; 
    }

    /**
     * 入力行リストを作成する
     * @param {array} ports ポート一覧
     * @param {boolean} isReadOnly 読み取り専用かどうか
     */
    inputRowInfo(ports, isReadOnly) {
        if (!ports || ports.length <= 0) {
            return null;
        }

        return ports.map((row, index) => {
                    return (
                        {
                            id: row.portNo,
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
     * @returns {array} 1行分のセルのpropsリスト
     */
    makeCellList(rowData, isReadOnly, index) {
        const { connectors } = this.props;
        const { portSeqNo, portNo, name, connector, checked, isNew } = rowData;
        const connectorList = connectors ? connectors.map((item) => ({ name: item.typeName, value: item.typeId })) : [];
        const validate = this.validate(rowData, isReadOnly, index);
        
        var cellList = [
            { 
                isReadOnly: (isReadOnly? true : !isNew), 
                value: portNo, 
                validationState: validate.portNo.state, 
                helpText: validate.portNo.helpText, 
                onChange: (value) => this.changeValue(value, index, 'portNo'), 
                placeholder: 'ポート番号'
            },
            { 
                isReadOnly: isReadOnly, 
                value: name, 
                validationState: validate.name.state, 
                helpText: validate.name.helpText, 
                onChange: (value) => this.changeValue(value, index, 'name'), 
                placeholder: '名称',
                maxlength: MAXLENGTH_UNITNETWORK.portName 
            },
            { 
                isReadOnly: isReadOnly, 
                value: (connector&&connector.typeId), 
                options: connectorList,  
                validationState: validate.connector.state, 
                helpText: validate.connector.helpText, 
                onChange: (value) => this.changeItemConnector(value, index) 
            }
        ]
        if (!isReadOnly) {
            cellList.unshift({ 
                checked: checked, 
                bsClass: "flex-center", 
                onChange:(e)=>this.changeItemChecked(e.target.checked, index) }
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
            var ports = Object.assign([], this.props.ports);
            ports[index].checked = checked;
            const isError = this.isError(ports);
            this.setState({allChecked: this.isAllChecked(ports), isError: isError});
            this.onChange(ports, isError);
        }
    }

    /**
     * ネットワークコネクタ形状を変更する
     * @param {string} typeId ネットワークコネクタ番号
     * @param {number} index インデックス
     */
    changeItemConnector(typeId, index){
        const targetConnector = this.props.connectors.find((item) => item.typeId === parseInt(typeId));
        this.changeValue(targetConnector, index, 'connector');
    }

    /********************************************
     * 行の追加・削除
     ********************************************/

    /**
     * 行を追加する
     */
    addRow(){        
        if (this.props.onChange) {
            //新しいポート番号を発行する(新しい番号を振りなおす)
            const { ports } = this.props;
            var portNoList = ports ? ports.map((port) => port.portNo) : [];
            const maxNumber = Math.max.apply(null, portNoList);
            var newPortNo = 1;
            if(maxNumber > 0){
                newPortNo = maxNumber + 1;
            }

            const newPortSeqNo = this.state.maxPortSeqNo + 1;
            var workPorts = Object.assign([], ports);
            workPorts.push({ 
                portSeqNo: newPortSeqNo, 
                portNo: newPortNo, 
                name: '', 
                connector: null , 
                networks: [],
                isError: true,
                isNew: true
            });
            
            const isError = this.isError(workPorts);
            this.setState({allChecked: this.isAllChecked(workPorts), maxPortSeqNo: newPortSeqNo, isError: isError});
            this.onChange(workPorts, isError, true);
        }
    }

    /**
     * チェックされた行を削除する
     */
    deleteRow(){
        if (this.props.onChange) {
            var workPorts = Object.assign([], this.props.ports);            
            workPorts = workPorts.filter((port) => {
                return !port.checked;
            });
            const isError = this.isError(workPorts);
            this.setState({allChecked: this.isAllChecked(workPorts), showMessage: false, isError: isError});
            this.onChange(workPorts, isError, true);            
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
            const workPorts = Object.assign([], this.props.ports);
            workPorts.some((port) => {
                port.checked = checked
            });
            
            this.setState({allChecked: checked});
            this.onChange(workPorts, this.state.isError);
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
     * ポート番号の入力検証
     * @param {string|number} value ポート番号
     * @param {nuber} index 
     */
    validatePortNo(value, index) {
        const { ports } = this.props;
        var validate = validateInteger(value, 1, 100);

        if (validate.state === VALIDATE_STATE.success &&
            ports&&ports.some((port, i) => {
                let isMatch = false;
                if (!isNumber(port.portNo) && !isNumber(value)) {
                    isMatch = port.portNo === value;
                } else {
                    isMatch = port.portNo === parseInt(value);
                }
                return isMatch && index !== i
            })) {
                validate = errorResult('ポート番号が重複しています。')
        }
        return validate;
    }
    
    /**
     * ポート名称の入力検証
     * @param {string} value ポート名称
     * @param {number} index インデックス
     * @returns {object} 検証結果
     */
    validateName(value) {
        return validateText(value, MAXLENGTH_UNITNETWORK.portName);
    }

    /**
     * 入力検証する
     * @param {object} port ポート情報
     * @param {boolean} isReadOnly 読み取り専用かどうか
     * @param {number} index インデックス
     * @returns {object} 検証結果
     */
    validate(port, isReadOnly, index){
        var validate = { portNo: { state: null }, name: { state: null }, connector: { state: null } };
        if (!isReadOnly) {
            validate.portNo = this.validatePortNo(port.portNo, index);
            validate.name = this.validateName(port.name);
            validate.connector =  { state: VALIDATE_STATE.success };
        }
        return validate;
    }

    /**
     * ポート一覧にエラーがあるかどうか
     * @param {array} ports ポート一覧
     * @returns {boolean} エラーかどうか
     */
    isError(ports) {
        return ports ? ports.some((port) => port.isError) : false;
    }

    /********************************************
     * その他
     ********************************************/
    
    /**
     * ポートの値を変更する
     * @param {*} value 変更後の値
     * @param {number} index インデックス
     * @param {string} key 変更対象キー
     */
    changeValue(value, index, key) {
        let ports = Object.assign([], this.props.ports);
        if (ports[index][key] && typeof ports[index][key] === 'object') {
            ports[index][key] = value && Object.assign({}, value);
        } else {
            ports[index][key] = value;
        }
        
        ports[index].isError = this.isValidateError(this.validate(ports[index], this.props.isReadOnly, index));
        
        const isError = this.isError(ports);
        this.setState({isError: isError});

        this.onChange(ports, isError, (key === 'portNo'));
    }

    /**
     * ポート一覧変更イベントを呼び出す
     * @param {array} ports ポート一覧
     * @param {boolean} isError エラーかどうか
     * @param {boolean} isApplyChange IPアドレスの適用を変更するかどうか
     */
    onChange(ports, isError, isApplyChange) {
        if (this.props.onChange) {
            this.props.onChange(ports, isError, isApplyChange);
        }
    }

    /**
     * IPアドレス一覧へ適用イベントを呼び出す
     */
    onApply() {
        if (this.props.onApply) {
            this.props.onApply();
        }
    }
    
    /**
     * 検証エラーがあるかどうか
     * @param {object} validate 検証結果
     * @returns {boolean} 検証エラーがあるかどうか
     */
    isValidateError(validate){
        if (validate.portNo.state !== VALIDATE_STATE.success ||
            validate.name.state !== VALIDATE_STATE.success ||
            validate.connector.state !== VALIDATE_STATE.success) {
                return true;
        }
        return false;
    }

    /**
     * ポート連番の最大値を取得する
     * @param {array} ports ポート一覧
     */
    getMaxPortSeqNo(ports) {
        var portSeqNoList = ports ? ports.map((port) => port.portSeqNo) : [];
        const maxNumber = Math.max.apply(null, portSeqNoList);
        return (maxNumber > 0) ? maxNumber : 0;
    } 


}

NetworkPortList.propTypes = {
    ports: PropTypes.arrayOf(PropTypes.shape({
        portSeqNo: PropTypes.number,
        portNo: PropTypes.number,
        name: PropTypes.string,
        connector: PropTypes.shape({
            typeId: PropTypes.number.isRequired,
            typeName: PropTypes.string.isRequired
        }),
        ipAddresses:PropTypes.array,
        networks: PropTypes.array,
    })),
    connectors: PropTypes.arrayOf(PropTypes.shape({
        typeId: PropTypes.number.isRequired,
        typeName: PropTypes.string.isRequired
    })),
    ipAddresses:PropTypes.array,
    portCount: PropTypes.number,
    isApply: PropTypes.bool,
    isReadOnly: PropTypes.bool,
    onChange: PropTypes.func,
    onApply: PropTypes.func
}