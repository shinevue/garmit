/**
 * Copyright 2017 DENSO Solutions
 * 
 * 空きラック検索ボックス Reactコンポーネント
 *  
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { validateInteger } from 'inputCheck';

import { Radio, FormGroup } from 'react-bootstrap';

import Button from 'Common/Widget/Button';
import TextForm from 'Common/Form/TextForm';
import SelectForm from 'Common/Form/SelectForm';
import GarmitBox from 'Assets/GarmitBox';

/**
 * 空きラック検索ボックス
 * <CapacityBox></CapacityBox>
 */
export default class CapacityBox extends Component {

    constructor() {
        super();
        this.state = {
        };
    }

    /**********************************
    * 
    * イベントハンドラ
    * 
    **********************************/

    /**
     * 検索ボタン押下イベント
     * @param {string} rackNumber テキストフォームに入力されている数字
     * @param {int} selectTypeId 選択中の種別ID
     */
    handleClickSearch(rackNumber, selectTypeId) {
        if (this.props.onClickSearch) {
            let passData = rackNumber;
            if (typeof rackNumber !== "number") {
                passData = Number(rackNumber);
            }
            if (this.props.onClickSearch) {
                this.props.onClickSearch(passData, selectTypeId);
            }
        }
    }

    /**
     * 検索数変更イベント
     * @param {string} rackNumber テキストフォームに入力されている値
     */
    handleChange(rackNumber) {
        if (this.props.onChangeNumber) {
            this.props.onChangeNumber(rackNumber, this.validateInput(rackNumber));
        }
    }

    /**
     * ラック種別変更イベント
     * @param {string} value 変更後の値
     */
    handleChangeType(value) {
        if (this.props.onChangeSelectType) {
            this.props.onChangeSelectType(_.find(this.props.rackTypes, { 'value': value }));
        }
    }

    /**
     * render
     */
    render() {
        const { isEgroupMap, isSelectLayout, rackTypes, rackNumber, selectType, numberValidation, isLoading } = this.props;

        if (!isSelectLayout || isSelectLayout && isEgroupMap) {
            return null;
        }
        return (
            <GarmitBox
                isLoading={isLoading}
                title="空きラック検索"
            >
                <div>
                    <TextForm
                        label="連続空きラック数："
                        value={rackNumber}
                        isReadOnly={false}
                        validationState={_.get(numberValidation, "state")}
                        helpText={_.get(numberValidation, "helpText")}
                        onChange={(value) => this.handleChange(value)}
                    />
                    {rackTypes &&
                        <SelectForm
                            isRequired={true}
                            label="ラック種別"
                            value={selectType}
                            options={rackTypes}
                            onChange={(value) => this.handleChangeType(value)}
                        />
                    }
                </div>
                <div>
                    <Button
                        bsStyle="primary"
                        className='pull-right'
                        disabled={_.get(numberValidation, "state") !== "success"}
                        onClick={() => this.handleClickSearch(rackNumber, selectType.typeId)}
                    >検索</Button>
                </div>
            </GarmitBox>
        );
    }

    /**
     * 入力チェックを行う
     */
    validateInput(rackNumber) {
        return validateInteger(rackNumber, 1, 2147483647, false);
    }
}

CapacityBox.propTypes = {
    isEgroupMap: PropTypes.bool,    //分電盤図表示中かどうか
    isSelectLayout: PropTypes.bool, //レイアウトが選択されているかどうか
    rackTypes: PropTypes.arrayOf({
        typeId: PropTypes.number,
        name: PropTypes.string
    }),
    rackNumber: PropTypes.string,   //検索する空きラック数
    selectType: PropTypes.obj,
    numberValidation: PropTypes.obj,    //入力された空きラック数のバリデーション情報
    isLoading: PropTypes.bool,
    onChangeNumber: PropTypes.func,
    onChangeSelectType: PropTypes.func,
    onClickSearch: PropTypes.func
};
