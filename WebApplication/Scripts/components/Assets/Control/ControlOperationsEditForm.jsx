/**
 * @license Copyright 2019 DENSO
 * 
 * ControlOperationsEditForm Reactコンポーネント
 * 
 */
'use strict';

import React, { Component } from 'react';

import DeletableControlForm from 'Assets/Control/DeletableControlForm';
import { AddCircleButton } from 'Assets/GarmitButton';

/**
 * 実行する制御一覧コンポーネント
 * @param {string} className クラス
 * @param {array} controlOperations 実行する制御一覧
 * @param {array} locations ロケーションリスト（ロケーションセレクトボックスの選択肢）
 * @param {array} controls 制御リスト（制御セレクトボックスの選択肢）
 * @param {boolean} isRequired 必須かどうか
 * @param {function} onChange 制御一覧の変更時に呼び出す
 */
export default class ControlOperationsEditForm extends Component {
    
    /**
     * コンストラクタ
     */
    constructor(props) {
        super(props);
        this.state = { 
            operations: props.controlOperations ? this.makeControlInfoList(props.controlOperations) : []
        };
    }

    /**
     * 新しいpropsを受け取るときに呼び出されます。
     * propsによってstateを変更する場合はここでthis.setState()を行います。このsetStateでrenderを呼ぶことはありません。
     * @param {*} nextProps 新しいprops
     */
    componentWillReceiveProps( nextProps ){
        const beforeIds = this.state.operations.map((ope) => ope.control&&ope.control.controlCmdId);
        const nextIds = nextProps.controlOperations.map((ope) => ope&&ope.controlCmdId);
        if (beforeIds.length !== nextIds.length || beforeIds.some((id) => nextIds.indexOf(id)<0)) {
            this.setState({
                operations: this.makeControlInfoList(nextProps.controlOperations)
            })
        }
    }

    /**
     * render
     */
    render() {
        const { locations, controls, maxCount, isReadOnly, isRequired } = this.props;
        const { operations } = this.state;
        return (
            <div>
                {operations&&operations.length > 0 &&
                    operations.map((ope, index) => 
                        <DeletableControlForm 
                            className={index!==(operations.length-1)?'mb-05':''}
                            controls={controls}
                            locations={locations}
                            locationId={ope.locationId}
                            controlOperation={ope.control}
                            controlCmdIds={operations.map((o, i) => { return { index: i, controlCmdId: o.control && o.control.controlCmdId }})}
                            index={index}
                            isReadOnly={isReadOnly}
                            onChange={(control, locationId, isError) => this.changeValue(control, locationId, isError, index)}
                            onDelete={() => this.deleteControl(index)}
                        />
                    )
                }
                {isRequired&&operations.length<=0&&
                    <div className="mt-05 mb-1 text-error">制御は1つ以上指定してください</div>
                }
                {!isReadOnly && operations.length < maxCount &&
                    <AddCircleButton disabled={isReadOnly} onClick={() => this.addControl()} />
                }
            </div>
        );
        
    }

    /**
     * 制御の値を変更する
     * @param {object} control 変更した制御
     * @param {number} locationId 変更後のロケーションID
     * @param {boolean} error エラーかどうか
     * @param {number} index インデックス
     */
    changeValue(control, locationId, error, index) {
        let operations = _.cloneDeep(this.state.operations);
        operations[index] = {
            locationId: locationId,
            control: control && _.cloneDeep(control),
            isError: error
        };
        const isError = this.isError(operations);
        this.setState({ operations: operations }, () => {
            this.onChange(operations, isError);
        });
    }

    /**
     * 制御行を追加する
     */
    addControl(){
        let operations = _.cloneDeep(this.state.operations);
        operations.push({
            locationId: null,
            control: null,
            isError: true
        });
        const isError = this.isError(operations);
        this.setState({ operations: operations }, () => {
            this.onChange(operations, isError);
        });

    }

    /**
     * 制御行を削除する
     * @param {number} index 削除するインデックス
     */
    deleteControl(index) {
        let operations = _.cloneDeep(this.state.operations);
        operations.splice(index, 1);
        const isError = this.isError(operations);
        this.setState({ operations: operations }, () => {
            this.onChange(operations, isError);
        });
    }

    /**
     * エラーがあるかどうか
     * @param {array} operations ポート一覧
     * @returns {boolean} エラーかどうか
     */
    isError(operations) {
        var isError = this.props.isRequired && operations.length <= 0 ? true : false;
        if (!isError) {
            isError = operations ? operations.some((ope) => ope.isError) : false;
        }
        return isError;
    }

    /**
     * 制御情報リストを作成する
     * @param {array} controlOperations 実行する制御一覧
     */
    makeControlInfoList(controlOperations) {
        return controlOperations.map((control) => {
            return {
                locationId: control.pointLocations&&control.pointLocations.length>0 ? control.pointLocations[0].locationId : null,
                control: control,
                isError: control.isError && true
            }
        })
    }

    /**
     * 実行する制御一覧変更イベントを呼び出す
     * @param {array} operations 操作一覧
     * @param {boolean} isError エラーかどうか
     */
    onChange(operations, isError) {
        if (this.props.onChange) {
            const controlOperations = operations.map((ope) => ope.control);
            this.props.onChange(controlOperations, isError);
        }
    }
}


ControlOperationsEditForm.propsTypes = {
    className: PropTypes.string,
    locations: PropTypes.array,
    controls: PropTypes.array,
    controlOperations: PropTypes.arrayOf(PropTypes.shape({
        controlCmdId: PropTypes.number,
        controlCmdName: PropTypes.string,
        pointNo: PropTypes.number,
        pointName: PropTypes.string,
        pointLocations: PropTypes.locations,
        pulseSet: PropTypes.number,
        pulseWidth: PropTypes.number,
        output: PropTypes.number        
    })),
    maxCount: PropTypes.number,
    isRequired: PropTypes.bool,
    onChange: PropTypes.func
}