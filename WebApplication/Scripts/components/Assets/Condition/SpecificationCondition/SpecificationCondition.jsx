/**
 * @license Copyright 2018 DENSO
 * 
 * SpecificationCondition Reactコンポーネント
 * 
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Grid, Row, Col, OverlayTrigger, Tooltip } from 'react-bootstrap';

import ConditionItemFrom from './ConditionItemFrom';
import Button from 'Common/Widget/Button';

import { CONDITION_TYPE } from 'searchConditionUtility';

const CONDITION_MAX_COUNT = 5;
const INITAL_CONDITIONITEM = { conditionId: -1 };

/**
 * 諸元項目の検索条件
 * @param {array} searchItems 検索項目一覧
 * @param {array} conditionItems 検索条件
 * @param {function} onChange 検索条件変更時に呼び出す
 */
export default class SpecificationCondition extends Component {
    
    /**
     * コンストラクタ
     */
    constructor(props) {
        super(props);
        this.state = {
            searchConditionItems: (props.conditionItems && props.conditionItems.length > 0) ? props.conditionItems : [INITAL_CONDITIONITEM]
        };
    }

    /**
     * 新しいpropsを受け取るときに呼び出されます。
     * propsによってstateを変更する場合はここでthis.setState()を行います。このsetStateでrenderを呼ぶことはありません。
     * @param {*} nextProps 新しいprops
     */
    componentWillReceiveProps( nextProps ){
        if (nextProps.reportType !== this.props.reportType || 
            !nextProps.conditionItems || 
            nextProps.conditionItems.length === 0) {
            this.setState({
                searchConditionItems : [ INITAL_CONDITIONITEM ]
            });
        } else if (JSON.stringify(nextProps.conditionItems) !== JSON.stringify(this.props.conditionItems)) {
            this.setState({
                searchConditionItems: nextProps.conditionItems
            })
        }
    }

    /**
     * render
     */
    render() {
        const { searchItems, conditionItems } = this.props;
        const { searchConditionItems } = this.state;
        return (            
            <Grid fluid className="mb-1">
                {searchConditionItems&&searchConditionItems.map((item, index) => 
                    <ConditionItemFrom key={index}
                                       conditionItem={item}
                                       searchItems={searchItems}
                                       invalidItems={conditionItems}
                                       onSelectChange={(item) => this.changeItem(item, index)}
                                       onRemove={() => this.removeItem(index)}
                                       onChange={(item) => this.changeItem(item, index)}
                    />
                )}
                {searchConditionItems.length < CONDITION_MAX_COUNT &&
                    <Row className="mt-05">
                        <Col md={12}>
                            <OverlayTrigger placement="bottom" overlay={<Tooltip>追加</Tooltip>}>
                                <Button
                                    iconId="add"
                                    isCircle={true}
                                    onClick={() => this.addCondition()}
                                />
                            </OverlayTrigger>
                        </Col>
                    </Row>
                }
            </Grid>
        );
    }

    /**
     * 検索条件を追加する
     */
    addCondition() {
        var searchConditionItems = Object.assign([], this.state.searchConditionItems);
        searchConditionItems.push(INITAL_CONDITIONITEM);
        this.setState({searchConditionItems : searchConditionItems}, () => {
            this.onChange(searchConditionItems);
        });
    }

    /**
     * 検索条件を変更する
     * @param {object} item 変更対象の条件
     * @param {number} index インデックス
     */
    changeItem(item, index) {
        var searchConditionItems = Object.assign([], this.state.searchConditionItems);
        if (item) {
            searchConditionItems[index] = item;
        } else {
            searchConditionItems[index] = INITAL_CONDITIONITEM;
        }
        this.setState({searchConditionItems : searchConditionItems}, () => {
            this.onChange(searchConditionItems);
        });     
    }

    /**
     * 検索条件を削除する
     * @param {number} index 削除対象のインデックス
     */
    removeItem(index) {
        var searchConditionItems = Object.assign([], this.state.searchConditionItems);
        searchConditionItems.splice(index, 1);
        if(searchConditionItems.length <= 0) {
            searchConditionItems.push(INITAL_CONDITIONITEM);
        }
        this.setState({searchConditionItems : searchConditionItems}, () => {
            this.onChange(searchConditionItems);
        });
    }

    /**
     * 変更イベントを発生させる
     * @param {array} items 検索条件リスト
     */
    onChange(items) {
        if (this.props.onChange) {
            const conditionItems = items.filter((item) => 
                item.conditionId > 0 || 
                (item.type === CONDITION_TYPE.text && item.valueArray.length > 0)
            );
            this.props.onChange(conditionItems, this.isError(conditionItems));
        }
    }

    /**
     * エラーが含まれているかどうか
     * @param {array} items 検索条件リスト
     */
    isError(items) {
        return items.some((item) => item.isError);
    }

}

SpecificationCondition.propTypes = {
    reportType: PropTypes.number.isRequired,
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
    conditionItems: PropTypes.arrayOf(PropTypes.shape({
        conditionId: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired,
        type: PropTypes.number.isRequired,
        value: PropTypes.object,
        valueFrom: PropTypes.object,
        valueTo: PropTypes.object,
        valueArray: PropTypes.arrayOf(PropTypes.string),
        option: PropTypes.number.isRequired
    })),
    onChange: PropTypes.func
}