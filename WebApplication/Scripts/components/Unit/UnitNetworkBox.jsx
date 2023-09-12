/**
 * @license Copyright 2018 DENSO
 *
 * UnitNetworkBox Reactコンポーネント
 * 
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';

import Box from 'Common/Layout/Box';
import InputForm from 'Common/Form/InputForm';
import TextForm from 'Common/Form/TextForm';

import NetworkPortList from './NetworkPortList';
import IPAddressList from './IPAddressList';

import { validateInteger, VALIDATE_STATE, errorResult } from 'inputCheck';
import { convertNumber } from 'numberUtility';

/**
 * ネットワーク設定ボックスコンポーネントを定義します。
 * @param {string} id ユニットID
 * @param {number} portCount ポート数
 * @param {array} ports ポート一覧
 * @param {array} ipAddresses IPアドレス一覧
 * @param {array} connectors ネットワークコネクタ一覧
 * @param {boolean} isLoading ロード中かどうか
 * @param {boolean} isReadOnly 読み取り専用かどうか
 * @param {boolean} isApplyTemplate テンプレート適用中かどうか
 * @param {function} onChange ネットワーク設定情報が変更されたときに呼び出す
 */
export default class UnitNetworkBox extends Component {
    
    /**
     * コンストラクタ
     */
    constructor(props) {
        super(props);
        this.state = { 
            ports: [],
            validate: { state: null },
            isError: {
                ports: false,
                ipAddresses: false
            },
            isApply: true
        };
    }

    /********************************************
     * React ライフサイクルメソッド
     ********************************************/
    
    /**
     * 新しいpropsを受け取るときに呼び出されます。
     * propsによってstateを変更する場合はここでthis.setState()を行います。このsetStateでrenderを呼ぶことはありません。
     * @param {*} nextProps 新しいprops
     */
    componentWillReceiveProps( nextProps ){
        const { id, portCount, ports, isReadOnly, isApplyTemplate } = nextProps;
        if (id != this.props.id) {
            this.setState({
                ports: ports ? JSON.parse(JSON.stringify(ports)) : [],
                validate: !isReadOnly ? this.validatePortCount(portCount) : { state: null },
                isError: {
                    ports: false,
                    ipAddresses: false
                },
                isApply: true
            });
        } else if (isReadOnly != this.props.isReadOnly) {
            this.setState({
                ports: ports ? JSON.parse(JSON.stringify(ports)) : [],
                validate: !isReadOnly ? this.validatePortCount(portCount) : { state: null },
                isError: {
                    ports: false,
                    ipAddresses: false
                },
                isApply: true
            });
        } else if ((!isReadOnly && ports.length !== this.props.ports.length) || isApplyTemplate) {
            const validate = this.validatePortCount(portCount, ports); 
            this.setState({
                validate: validate
            });

            if (isApplyTemplate) {
                this.onChange(portCount, 'portCount', validate, this.state.isError, this.state.isApply);
            }
        }
    }

    /**
     * render
     */
    render() {
        const { portCount, ports, ipAddresses, connectors, isLoading, isReadOnly } = this.props;
        const { validate, isApply } = this.state;
        return (
            <Box boxStyle='default' defaultClose={true} isLoading={isLoading}>
                <Box.Header>
                    <Box.Title>ネットワーク設定</Box.Title>
                </Box.Header >
                <Box.Body className='with-border'>
                    <InputForm>
                        <InputForm.Row>
                            <InputForm.Col label='ポート数' columnCount={1} isRequired={!isReadOnly} >
                                <TextForm value={portCount} 
                                          isReadOnly={isReadOnly} 
                                          validationState={validate.state}
                                          helpText={validate.helpText}
                                          onChange={(value) => this.portCountChanged(value)} 
                                />
                            </InputForm.Col>
                        </InputForm.Row>
                    </InputForm>
                    <label className='mt-1' >ポート一覧</label>
                    <NetworkPortList ports={ports} 
                                     ipAddresses={ipAddresses}
                                     connectors={connectors}
                                     portCount={validate.state === VALIDATE_STATE.success ? convertNumber(portCount) : null}
                                     isReadOnly={isReadOnly} 
                                     isApply={isApply}
                                     onChange={(value, isError, isApplyChange) => this.changeArrayValue(value, isError, 'ports', isApplyChange)}
                                     onApply={() => this.portsApplyStateChanged(true)}
                    />
                </Box.Body>
                <Box.Body >
                    <label >IPアドレス一覧</label>                 
                    <IPAddressList ipAddresses={ipAddresses} 
                                   ports={this.state.ports}
                                   isApply={isApply} 
                                   isReadOnly={isReadOnly} 
                                   onChange={(value, isError) => this.changeArrayValue(value, isError, 'ipAddresses')}
                    />                
                </Box.Body>
            </Box>
        );
    }

    /********************************************
     * イベント関数
     ********************************************/

    /**
     * ポート数の値を変更する
     * @param {string|number} portCount 変更後のポート数
     */
    portCountChanged(portCount){
        const validate = this.validatePortCount(portCount, this.props.ports);
        this.setState({validate: validate});
        this.onChange(portCount, 'portCount', validate, this.state.isError, this.state.isApply);
    }

    /**
     * ポート一覧をIPアドレス一覧に適用するかどうかのステータスを変更する
     * @param {boolean} isApply 適用するかどうか
     */
    portsApplyStateChanged(isApply) {
        var obj = Object.assign({}, this.state);
        obj.isApply = isApply;
        if (isApply) {
            obj.ports = JSON.parse(JSON.stringify(this.props.ports));
        }
        this.setState(obj);
    }
    
    /********************************************
     * 入力検証
     ********************************************/
    
    /**
     * ポート数の入力検証を行う
     * @param {string|number} portCount 対象のポート数
     * @param {array} ports ポート一覧
     * @return { state:'', helpText:'' }　検証結果
     */
    validatePortCount(portCount, ports) {
        const portsLength = ports ? ports.length : 0;
        var validate = validateInteger(portCount, 0, 100);

        //ポート数エラー
        if (validate.state === VALIDATE_STATE.success &&
            portsLength > convertNumber(portCount)) {
                validate = errorResult('ポート一覧の数よりも小さくなっています。ポート一覧の数以上にするか、ポート一覧からポートを削除してください。');
        }

        return validate;
    }

    /**
     * エラーかどうか
     * @param {object} portCountValidate ポート数の入力検証
     * @param {object} error エラー情報
     * @param {boolean} isApply 適用するかどうか
     * @returns {boolean} エラーかどうか
     */
    isError(portCountValidate, error, isApply) {
        var isError = false;

        if (portCountValidate.state !== VALIDATE_STATE.success) {
            isError = true;
        }

        if (!isError) {
            for (const key in error) {
                if (error.hasOwnProperty(key) && error[key]) {
                    isError = true;
                    break;
                }
            }
        }

        return isApply ? isError : true;            //IPアドレス一覧への適用されていなかったら、エラーとする  
    }
    
    /********************************************
     * その他
     ********************************************/

    /**
     * 値（配列型）を変更する
     * @param {array} value 変更後の値
     * @param {boolean} isError エラーかどうか
     * @param {string} key 値のキー
     * @param {boolean} isApplyChange 適用を変更するかどうか
     */
    changeArrayValue(value, isError, key, isApplyChange) {
        var obj = Object.assign({}, this.state);
        obj.isError[key] = isError;
        if (key === 'ports' && isApplyChange) {
            obj.isApply = !this.isPortNoChanged(this.state.ports, value);
        }
        this.setState(obj); 
        this.onChange(value, key, this.state.validate, obj.isError, obj.isApply);
    }

    /**
     * 入力変更イベントを発生させる
     * @param {*} value 変更後の値
     * @param {string} key 変更したプロパティのキー
     * @param {object} portCountValidate ポート数の入力検証
     * @param {object} isError エラーかどうか { ports: , ipAddresses: }
     * @param {boolean} isApply 適用するかどうか
     */
    onChange(value, key, portCountValidate, isError, isApply) {
        if (this.props.onChange) {
            this.props.onChange(value, key, this.isError(portCountValidate, isError, isApply));
        }
    }
    
    /**
     * ポート番号が変更されているか確認する
     * @param {array} beforePorts 変更前のポート一覧
     * @param {array} afterPorts 変更後のポート一覧
     * @param {boolean} ポート番号が変更されているかどうか
     */
    isPortNoChanged(beforePorts, afterPorts) {
        var isChanged = false;
        const afterMaxNumber = Math.max.apply(null, afterPorts.map((port) => port.portSeqNo));
        const beforeMaxNumber = Math.max.apply(null, beforePorts.map((port) => port.portSeqNo));
        const maxNumber = afterMaxNumber > beforeMaxNumber ? afterMaxNumber : beforeMaxNumber;

        for (let index = 1; index <= maxNumber; index++) {
            const before = beforePorts.find((port) => port.portSeqNo === index);
            const after = afterPorts.find((port) => port.portSeqNo === index);
            if (!before && after || 
                before && !after ||
                (before && after && before.portSeqNo === after.portSeqNo && convertNumber(before.portNo) !== convertNumber(after.portNo))) {
                    isChanged = true;
                    break;
            }
        }
        return isChanged;
    }

}

UnitNetworkBox.propTypes = {
    id: PropTypes.string,
    portCount: PropTypes.number,
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
    connectors: PropTypes.arrayOf(PropTypes.shape({
        typeId: PropTypes.number.isRequired,
        typeName: PropTypes.string.isRequired
    })),
    isLoading: PropTypes.bool,
    isReadOnly: PropTypes.bool,
    onChange: PropTypes.func
}