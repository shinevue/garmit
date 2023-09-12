/**
 * Copyright 2017 DENSO Solutions
 * 
 * CheckboxList Reactコンポーネント
 *  
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Checkbox } from 'react-bootstrap';


/**
 * CheckboxList
 * @param {array} items 選択肢の配列[{key: "...", name: "...", color: "..."}, ...]
 * @param {array} checkedItems 初期状態でチェックするkeyの配列["key1", "key2", ...]
 * @param {bool} useAll すべてチェックの機能を使用するか
 * @param {func} onChange チェック状態変化時に呼ぶ関数
 */
export default class CheckboxList extends Component {

    constructor(props) {
        super(props)
        this.state = {
            isAllChecked: this.confirmAllChecked(props.items, props.checkedItems),
        }
    }

    /**
     * 新しいpropsを受け取るときに呼び出されます。
     * propsによってstateを変更する場合はここでthis.setState()を行います。
     * このsetStateでrenderを呼ぶことはありません。
     * @param {*} nextProps 新しいprops
     */
    componentWillReceiveProps(nextProps) {
        this.setState({
            isAllChecked: this.confirmAllChecked(nextProps.items, nextProps.checkedItems),
        })
    }

    /**
     * 
     * @param {any} allItems
     * @param {any} checkedItems
     */
    confirmAllChecked(allItems, checkedItems) {
        const uncheckedExists = allItems.some((item, index, items) => {
            return (checkedItems.indexOf(item.key) === -1)
        });
        const isAllChecked = !uncheckedExists;
        return isAllChecked; 
    }

    handleClick(key) {
        let checkedItems = this.props.checkedItems.slice();
        const index = checkedItems.indexOf(key);
        if (index > -1) {
            checkedItems.splice(index, 1);
        } else {
            checkedItems.push(key);
        }
        this.props.onChange(checkedItems);
    }

    allCheckClick() {
        const isAllChecked = !this.state.isAllChecked;
        const items = this.props.items;
        let checkedItems = [];

        if (isAllChecked) {
            checkedItems = items.map((item, index, items) => {
                return item.key;
            })
        }

        this.props.onChange(checkedItems);
    }

    makeCheckBoxList(items) {
        return items.map((item, index, items) => {
            let className = "";
            if (index === 0 && !this.props.useAll) {
                className = "mt-0";
            } else if (index === (items.length - 1)) {
                className = "mb-0";
            }
            const checked = (this.props.checkedItems.indexOf(item.key) > -1)
            return (
                <Checkbox 
                    className={className}
                    onChange={() => this.handleClick(item.key)}
                    checked={checked}
                    inline={this.props.inline}
                >
                    <span style={{ color: item.color }}>{item.name}</span>
                </Checkbox>
            )
        })
    }

    /**
     * render
     */
    render() {
        const { items, useAll, checkedItems, inline, maxHeight } = this.props;
        const { isAllChecked } = this.state;

        return (
            <div style={{ display: 'inline-block', maxHeight: maxHeight, overflow: 'auto', width: '100%' }}>
                {(useAll) &&
                    <Checkbox
                        className="mt-0"
                        onChange={() => this.allCheckClick()}
                        checked={isAllChecked}
                        inline={inline}
                    >すべて</Checkbox>
                }
                {this.makeCheckBoxList(items)}
            </div>
        )
    }
}

CheckboxList.propTypes = {
    items: PropTypes.array,
    chekedItems: PropTypes.array,
    useAll: PropTypes.bool,
    onChange: PropTypes.func
}

CheckboxList.defaultProps = {
    items: [],
    checkedItems: [],
    useAll: false,
    onChange: () => { }
}