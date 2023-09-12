/**
 * @license Copyright 2019 DENSO
 * 
 * データの並び替えや絞り込みのオプションReactコンポーネント
 * 
 */
'use strict';

import React, { Component } from 'react';
import { ToggleButtonGroup } from 'react-bootstrap';
import MultiSelectForm from 'Common/Form/MultiSelectForm';
import Button from 'Common/Widget/Button';
import Icon from 'Common/Widget/Icon';

export const SORT_TYPE = {
    name: 'data-name',
    value: 'data-value'
};

export const FILTER_TYPE = {
    datatype: 'datatype',
    alarm: 'alarm'
}

export const INIT_FILTER_ALARM = ['error', 'warn', ''];

/**
 * データの並び替えや絞り込みのオプションのコンポーネントを定義します。
 * @param {object} sort 並び替え情報
 * @param {object} filter 絞り込み情報
 * @param {boolean} useSort 並び替えを使用するかどうか
 * @param {boolean} useFilter 絞り込みを使用するかどうか
 * @param {array} dataTypes データ種別
 * @param {boolean} inline インライン表示するかどうか
 * @param {function} onSort 並び替えのときに呼び出す
 * @param {function} onFilter 絞り込むときに呼び出す
 */
export default class DataOption extends Component {
    
    /**
     * render
     */
    render() {
        const { sort, filter, dataTypes, useSort, useFilter, inline, className } = this.props;
        const sortIconClasses = {
            'ml-05': true,
            'glyphicon': true,
            'glyphicon-sort-by-attributes': sort.isAsc,
            'glyphicon glyphicon-sort-by-attributes-alt': !sort.isAsc
        };
        const filterClasses = {
            'inline-block': inline,
            'ml-05': inline && useSort
        }
        const rootDivClasses = {
            'mtb-1': !inline
        }

        return (
            <div className={classNames(rootDivClasses, className)}>
                {useSort&&
                    <div className={inline&&'inline-block'}>
                        <span>並べ替え：</span>
                        <ToggleButtonGroup name="sort" className="mr-05">
                            <Button
                                className={sort.key === SORT_TYPE.name && 'active'}
                                bsStyle="primary"
                                bsSize="sm"
                                style={{ width: 120 }}
                                onClick={() => this.handleSortClick(SORT_TYPE.name)}
                                checked={sort.key === SORT_TYPE.name}
                            >
                                <span>ポイント名称</span>
                                {sort.key === SORT_TYPE.name && <Icon className={classNames(sortIconClasses)} />}

                            </Button>
                            <Button
                                className={sort.key === SORT_TYPE.value && 'active'}
                                bsStyle="primary"
                                bsSize="sm"
                                style={{ width: 120 }}
                                onClick={() => this.handleSortClick(SORT_TYPE.value)}
                                checked={sort.key === SORT_TYPE.value}
                            >
                                <span>値</span>
                                {sort.key === SORT_TYPE.value && <Icon className={classNames(sortIconClasses)} />}
                            </Button>
                        </ToggleButtonGroup>
                    </div>
                }
                {useFilter&&
                    <div className={classNames(filterClasses)}>
                        <span>絞り込み：</span>
                        <div className="inline-block">
                            <span>データ種別</span>
                            {dataTypes&&dataTypes.length>0&&
                                <MultiSelectForm
                                    className="mr-1"
                                    options={dataTypes.map((type) => ({ value: type.dtType.toString(), name: type.name }))}
                                    initValue={dataTypes.map((type) => ({ value: type.dtType.toString(), name: type.name }))}
                                    value={filter&&filter.datatype}
                                    onChange={(value) => this.handleFilterChange(value, FILTER_TYPE.datatype)}
                                />
                            }
                        </div>
                        <div className="inline-block">
                            <span>アラーム種別</span>
                            <MultiSelectForm
                                options={[
                                    { value: 'error', name: '異常' },
                                    { value: 'warn', name: '注意' },
                                    { value: '', name: 'なし' },
                                ]}
                                initValue={INIT_FILTER_ALARM}
                                value={filter&&filter.alarm}
                                onChange={(value) => this.handleFilterChange(value, FILTER_TYPE.alarm)}
                            />
                        </div>
                    </div>
                }
            </div>
        );
    }

    /**
     * ソートボタンがクリックされた時
     * @param {any} key ソートするキー
     */
    handleSortClick(key) {
        const { sort } = this.props;
        const isAsc = (sort.key === key) ? !sort.isAsc : true;
        if (this.props.onSort) {
            this.props.onSort({ key: key, isAsc: isAsc });
        }
    }

    /**
     * 絞り込みが変更された時
     * @param {any} value 絞り込むデータ
     * @param {any} key　絞り込みのキー
     */
    handleFilterChange(value, key) {
        const filter = Object.assign({}, this.props.filter);
        filter[key] = value;
        if (this.props.onFilter) {
            this.props.onFilter(filter);
        }
    }
    
}

DataOption.propsTypes = {
    sort: PropTypes.shape({
        key: PropTypes.string,
        isAsc: PropTypes.bool,
    }),
    filter: PropTypes.shape({
        alarm: PropTypes.array,
        datatype: PropTypes.array
    }),
    useSort: PropTypes.bool,
    useFilter: PropTypes.bool,
    dataTypes: PropTypes.array,
    inline: PropTypes.bool,
    onSort: PropTypes.func,
    onFilter: PropTypes.func
}