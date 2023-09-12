/**
 * @license Copyright 2019 DENSO
 * 
 * ScheduleConditionBox Reactコンポーネント
 * 
 */
'use strict';

import React, { Component } from 'react';
import { Grid, Row, Col } from 'react-bootstrap';
import SearchConditionBox from 'Assets/Condition/SearchConditionBox';
import MultiSelectForm from 'Common/Form/MultiSelectForm';

import { VALIDATE_STATE, successResult, errorResult } from 'inputCheck';
import { getEmptyCondition, omitSearchCondition, SEARCH_CONDITION_TYPES } from 'reportScheduleUtility';

/**
 * スケジュール検索条件ボックス
 * @param {number} enterpriseId 所属ID
 * @param {object} lookUp 検索条件のマスタ
 * @param {object} condition 検索条件
 * @param {boolean} isReadOnly 読取専用かどうか
 * @param {boolean} isLoading ロード中かどうか
 * @param {function} onChange 検索条件変更時に呼び出す
 */
export default class ScheduleConditionBox extends Component {
    
    /**
     * コンストラクタ
     */
    constructor(props) {
        super(props);
        const { enterpriseId, condition } = props;
        this.state = {
            validate: {
                condition: enterpriseId ? this.validateConditon(condition) : { state: null, helpText: null },
                dataType: enterpriseId ? this.validateDataType(condition) : { state: null, helpText: null }
            }
        };
    }

    //#region React ライフサイクルメソッド

    /**
     * 新しいpropsを受け取るときに呼び出されます。
     * propsによってstateを変更する場合はここでthis.setState()を行います。このsetStateでrenderを呼ぶことはありません。
     * @param {*} nextProps 新しいprops
     */
    componentWillReceiveProps( nextProps ){
        const beforeEnterpriseId = this.props.enterpriseId;
        const nextEnterpriseId = nextProps.enterpriseId;
        if (beforeEnterpriseId !== nextEnterpriseId){
            this.setState({
                validate: {
                    condition: nextEnterpriseId ? this.validateConditon(nextProps.condition) : { state: null, helpText: null },
                    dataType: nextEnterpriseId ? this.validateDataType(nextProps.condition) : { state: null, helpText: null }
                }
            })
        }
    }

    /**
     * render
     */
    render() {
        const { lookUp, condition, isLoading, isReadOnly } = this.props;
        const { validate } = this.state;
        const allDataTypes = (lookUp && lookUp.dataTypes) || [];
        return (
            <SearchConditionBox 
                isReadOnly={isReadOnly}
                isLoading={isLoading}
                targets={SEARCH_CONDITION_TYPES}
                lookUp={lookUp}
                searchCondition={condition}
                hiddenSearchButton
                errorMessage={validate.condition.helpText}
                onChange={(cond) => this.changeConditon(cond)}
                onClear={() => this.clearCondition()}          
            >
                <Grid fluid>
                    <Row className="mt-05">
                        <Col md={12}>
                            <label>データ種別</label>
                            <MultiSelectForm
                                className="mr-1"
                                itemAllVisible
                                disabled={isReadOnly}
                                validationState={validate.dataType.state}
                                helpText={validate.dataType.helpText}
                                options={allDataTypes && allDataTypes.map((type) => ({ value: type.dtType.toString(), name: type.name }))}
                                value={condition && condition.dataTypes && 
                                       condition.dataTypes.map((type) => type.dtType.toString())}
                                onChange={(value) => this.changeDataTypes(value)}
                            />
                        </Col>
                    </Row>
                </Grid>
            </SearchConditionBox>
        );
    }

    //#endregion

    //#region 変更イベント

    /**
     * 検索条件変更イベント
     * @param {object} target 検索条件
     */
    changeConditon(target) {
        var condition = _.cloneDeep(target);
        const beforeCondition = this.props.condition;
        condition.dataType = beforeCondition && _.cloneDeep(beforeCondition.dataTypes);
        this.onChange('condition', omitSearchCondition(condition), this.validateConditon(condition));
    }

    /**
     * 検索条件をクリアする
     */
    clearCondition() {
        const { lookUp } = this.props;
        const condition = getEmptyCondition(lookUp&&lookUp.dataTypes);
        this.onChange('condition', condition, this.validateConditon(condition));
    }

    /**
     * データ種別変更イベント
     * @param {array} values 選択したデータ種別ID
     */
    changeDataTypes(values) {
        var condition = this.props.condition && _.cloneDeep(this.props.condition);
        const dtTypes = values ? values.map((v) => parseInt(v)) : [];
        const { dataTypes } = this.props.lookUp;
        condition.dataTypes = dataTypes.filter((type) => dtTypes.some(t => t === type.dtType));
        this.onChange('dataType', omitSearchCondition(condition), this.validateDataType(condition));
    }
    
    /**
     * 入力変更イベントを発生させる
     * @param {string} key 変更値のオブジェクトキー
     * @param {any} condition 変更後の検索条件
     * @param {object} validate 入力検証結果
     */
    onChange(key, value, validate){
        const validateResult = this.setValidate(validate, key);
        if (this.props.onChange) {
            this.props.onChange(value, this.invalid(validateResult));
        }
    }

    /**
     * 保存が無効かどうかを取得する
     * @param {object} validate 入力検証結果
     * @returns {boolean} 保存が無効かどうか
     */
    invalid(validate) {
        var invalid = false;
        for (const key in validate) {
            if (validate.hasOwnProperty(key) && 
                validate[key].state !== VALIDATE_STATE.success) {
                    invalid = true;
                    break; 
            }
        }
        return invalid;
    }

    //#endregion

    //#region 入力検証

    /**
     * 検索条件の入力検証
     * @param {object} condition 検索条件
     */
    validateConditon(condition) {
        if (condition) {
            if (condition.hashTagError) {
                return errorResult();
            } else if (this.hasCondition(condition)) {
                return successResult;
            }
        }
        return errorResult('検索条件は1つ以上指定してください');
    }

    /**
     * データ種別の入力検証
     * @param {object} condition 検索条件
     */
    validateDataType(condition) {
        if (condition && condition.dataTypes && condition.dataTypes.length > 0) {
            return successResult;
        }
        return errorResult('データ種別は1つ以上選択してください');
    }

    /**
     * 検索条件が指定されているかどうか
     * @param {object} conditon 検索条件
     */
    hasCondition(conditon) {
        const { locations, enterprises, tags, egroups } = conditon;
        if (!(locations && locations.length > 0) && 
            !(enterprises && enterprises.length > 0) && 
            !(tags && tags.length > 0) && 
            !(egroups && egroups.length > 0) ) {
            return false;
        }
        return true;
    }

    /**
     * 検証結果をセットする
     * @param {object} targetValidate 更新する検証結果
     * @param {string} key オブジェクトのキー
     * @returns {object} 更新後の検証結果
     */
    setValidate(targetValidate, key) {        
        var validate = Object.assign({}, this.state.validate);
        if (validate.hasOwnProperty(key) && targetValidate) {
            validate[key] = targetValidate;
            this.setState({validate:validate});
        }        
        return validate;
    }

    //#endregion
}

ScheduleConditionBox.propsTypes = {
    enterpriseId: PropTypes.number,
    lookUp: PropTypes.object,
    condition: PropTypes.object,
    isReadOnly: PropTypes.bool,
    isLoading: PropTypes.bool,
    onChange: PropTypes.func
}
