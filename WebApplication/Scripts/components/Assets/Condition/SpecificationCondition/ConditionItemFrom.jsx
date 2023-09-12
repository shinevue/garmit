/**
 * @license Copyright 2018 DENSO
 * 
 * ConditionItemFrom Reactコンポーネント
 * 
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Row, Col, FormGroup, FormControl, OverlayTrigger, Tooltip } from 'react-bootstrap';

import Button from 'Common/Widget/Button';
import Icon from 'Common/Widget/Icon';

import StringCondition from './StringCondition';
import NumberCondition from './NumberCondition';
import DateCondition from './DateCondition';
import ChoiceCondition from './ChoiceCondition';

import { CONDITION_TYPE, CONDITION_OPTION_TEXT, CONDITION_OPTION_NUMBER, CONDITION_OPTION_DATETIME, CONDITION_OPTION_CHOICE } from 'searchConditionUtility';

/**
 * 検索条件項目コンポーネント
 * @param {array} searchItems 検索項目一覧
 * @param {object} conditionItem 選択中の検索条件項目
 * @param {array} invalidItems 無効な項目リスト
 * @param {function} onSelectChange 検索条件項目変更時に呼び出す
 * @param {function} onRemove 検索条件項目をクリアするときに呼び出す
 * @param {function} onChange 検索条件変更時に呼び出す
 */
export default class ConditionItemFrom extends Component {
    
    /**
     * コンストラクタ
     */
    constructor(props) {
        super(props);
    }

    /**
     * 新しいpropsを受け取るときに呼び出されます。
     * propsによってstateを変更する場合はここでthis.setState()を行います。このsetStateでrenderを呼ぶことはありません。
     * @param {*} nextProps 新しいprops
     */
    componentWillReceiveProps( nextProps ){
        if (nextProps.conditionId !== this.props.conditionId) {
            this.setState({
                value: null,
                option: nextProps.defaultOption,
                validate: validateSelect(null)
            });
        }
    }

    /**
     * render
     */
    render() {
        const { searchItems, invalidItems, conditionItem } = this.props;
        return (
            <Row className="condition-item">
                <Col sm={3}>
                    <FormGroup className="mb-0">
                        <FormControl componentClass="select" 
                                     value={conditionItem.conditionId ? conditionItem.conditionId : -1} 
                                     onChange={(e) => this.changeSelectItem(e.target.value)}>
                            {searchItems&&this.makeOptions(searchItems, invalidItems)}
                        </FormControl>
                    </FormGroup>
                </Col>
                <Col sm={9}>
                    <div className="form-inline va-t" >
                        {conditionItem.conditionId && this.conditionComponent(conditionItem)}
                        <OverlayTrigger placement="bottom" overlay={<Tooltip>クリア</Tooltip>}>
                            <Button
                                bsStyle="lightgray"
                                isCircle={true}
                                onClick={() => this.removeItem()}
                            >
                                <Icon className="fal fa-eraser" />
                            </Button>
                        </OverlayTrigger>
                    </div>
                </Col>
            </Row>
        );
    }
        
    /**
     * 検索対象のセレクトボックスのオプションをつくる
     *
     * @returns
     */
    makeOptions(searchItems, invalidItems) {
        let options = [<option value={-1}>選択してください</option>]
        const invalidConditionIds = invalidItems ? invalidItems.map((item) => item.conditionId) : [];
        searchItems.forEach((item, index) => {
            options.push(
                <option
                    key={index}
                    value={item.conditionId}
                    disabled={(invalidConditionIds.indexOf(item.conditionId) >= 0)}
                >
                    {item.name}
                </option>
            )
        })
        return options
    }

    /**
     * 各種条件コンポーネントを作成する
     * @param {object} conditionItem 条件 
     */
    conditionComponent(conditionItem) {
        switch (conditionItem.type) {
            case CONDITION_TYPE.text:
                return <StringCondition valueText={conditionItem.valueText}
                                        onChange={(value, isError, valueText) => this.changeValue(value, CONDITION_OPTION_TEXT.partialMatch, isError, valueText)}
                       />;
                
            case CONDITION_TYPE.number:
                return <NumberCondition value={conditionItem.value}
                                        valueFrom={conditionItem.valueFrom}
                                        valueTo={conditionItem.valueTo}
                                        option={conditionItem.option}
                                        onChange={(value, option, isError) => this.changeValue(value, option, isError)} 
                       />;

            case CONDITION_TYPE.date:
                return <DateCondition value={conditionItem.value}
                                      valueFrom={conditionItem.valueFrom}
                                      valueTo={conditionItem.valueTo}
                                      option={conditionItem.option}
                                      isAlarm={conditionItem.alarm}
                                      onChange={(value, option, isError) => this.changeValue(value, option, isError)} 
                        />                            
            case CONDITION_TYPE.choice:
                return <ChoiceCondition value={conditionItem.value}
                                        option={conditionItem.option}
                                        choices={conditionItem.choices}
                                        onChange={(value, option, isError) => this.changeValue(value, option, isError)} 
                       />;
        }
    }

    /**
     * 検索項目を変更する
     * @param {*} value 
     */
    changeSelectItem(value) {
        const { searchItems } = this.props;
        const selectedValue = value ? parseInt(value) : -1;
        var selectedItem =  searchItems.find((item) => item.conditionId === selectedValue);
        if (selectedItem) {
            selectedItem.isError = true;

            switch (selectedItem.type) {
                case CONDITION_TYPE.text:
                    selectedItem.option = CONDITION_OPTION_TEXT.partialMatch;
                    break;                    
                case CONDITION_TYPE.number:
                    selectedItem.option = CONDITION_OPTION_NUMBER.between;
                    break;    
                case CONDITION_TYPE.date:
                    selectedItem.option = CONDITION_OPTION_DATETIME.fromToEnd;
                    break;                          
                case CONDITION_TYPE.choice:
                    selectedItem.option = CONDITION_OPTION_CHOICE.match;
                    break;
            }
        }
        
        if (this.props.onSelectChange) {
            this.props.onSelectChange(selectedItem);
        }
    }

    /**
     * 検索項目選択をクリアする
     */
    removeItem() {
        if (this.props.onRemove) {
            this.props.onRemove();
        }
    }

    /**
     * 検索条件の値を変更する
     * @param {*} value 変更後の値
     * @param {number} option 変更後のオプション
     * @param {boolean} isError エラーかどうか
     * @param {string} valueText 表示文字列
     */
    changeValue(value, option, isError, valueText = undefined) {
        var condition = Object.assign({}, this.props.conditionItem);
        condition.option = option;
        condition.isError = isError;
        if (value instanceof Object) {
            if (value instanceof Array) {
                condition.valueArray = Object.assign([], value);
            } else {
                condition.value = value.value;
                condition.valueFrom = value.from;
                condition.valueTo = value.to;
            }
        } else {
            condition.value = value;
            condition.valueFrom = null;
            condition.valueTo = null;
        }

        if (valueText !== undefined) {
            condition.valueText = valueText;
        }

        if (this.props.onChange) {
            this.props.onChange(condition);
        }
    }

}

ConditionItemFrom.propTypes = {
    searchItems: PropTypes.arrayOf(PropTypes.shape({
        conditionId: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired,
        type: PropTypes.number.isRequired,
        alarm: PropTypes.bool,
        choices: PropTypes.arrayOf(PropTypes.shape({
            choiceNo: PropTypes.number.isRequired,
            choiceName: PropTypes.string.isRequired
        }))
    })),
    conditionItem: PropTypes.shape({
        conditionId: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired,
        type: PropTypes.number.isRequired,
        value: PropTypes.object,
        valueFrom: PropTypes.object,
        valueTo: PropTypes.object,
        valueArray: PropTypes.arrayOf(PropTypes.string),
        option: PropTypes.number.isRequired
    }),
    onSelectChange: PropTypes.func,
    onRemove: PropTypes.func,
    onChange: PropTypes.func  
}