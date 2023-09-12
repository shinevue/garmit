/**
 * Copyright 2017 DENSO Solutions
 * 
 * 表示マップ選択ツールバー Reactコンポーネント
 * <MapSelectBar />
 *  
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { FormGroup, ControlLabel, FormControl, Checkbox } from 'react-bootstrap';

import CheckboxSwitch from 'Common/Widget/CheckboxSwitch';

/**
 * 表示マップ選択ツールバー
 */
export default class MapSelectBar extends Component {

    constructor(props) {
        super(props);
        this.state = {
        };
    }

    /**
     * コンポーネントをアップデートするかどうか
     */
    shouldComponentUpdate(nextProps, nextState) {
        //異なるインスタンスでも値が同じであればアップデートしない
        var nextDataJSON = JSON.stringify(nextProps);
        var dataJSON = JSON.stringify(this.props);

        if (nextDataJSON !== dataJSON) {
            return true;
        }
    }

    /**
     * チェック状態変更イベント
     * @param {string} name チェックボックスのname
     * @param {bool} checked チェック状態
     */
    handleChangeCheckState(name, checked) {
        if (this.props.onChangeDispMap) {
            if (!isNaN(name)) {   //数値に変換できる場合、数値に変換して返す
                const floorMapOptionId = Number(name);
                this.props.onChangeDispMap(floorMapOptionId, checked);
            }
        }
    }

    /**
     * 追加情報のチェック状態変更イベント
     * @param {bool} checked チェック状態
     */
    handleChangeAdditionalCheck(optionId, checked) {
        if (this.props.onChangeMapDetail) {
            this.props.onChangeMapDetail(optionId, checked);
        }
    }

    /**
     * render
     */
    render() {
        const { floorMapOptionInfo, tempPointInfo } = this.props;
        return (
            <div>
                <ControlLabel>表示マップ選択</ControlLabel>
                <FormGroup className="flex-center-left">
                    {floorMapOptionInfo.map((option) => {
                        return (
                            <CheckForm
                                optionInfo={option}
                                onChange={(e) => this.handleChangeCheckState(option.optionId, e.target.checked)}
                                onChangeCheck={(e) => this.handleChangeAdditionalCheck(option.optionId, e)} />
                        );
                    })}
                </FormGroup>
            </div>
        );
    }
}

MapSelectBar.propTypes = {
    floorMapOptionInfo: PropTypes.array,    //フロアマップオプション情報
    onChangeDispMap: PropTypes.func,        //チェック状態変更イベント関数
    onChangeMapDetail: PropTypes.func       //スイッチ状態変更イベント関数
};

/**
* 表示マップチェックボックスフォーム
*/
const CheckForm = ({ optionInfo, onChange: handleChange, onChangeCheck: handleChangeCheck }) => {
    const { check, text, switchInfo } = optionInfo;
    return (
        <div className="mr-1">
            <Checkbox inline checked={check} onChange={handleChange}>
                {text}
            </Checkbox>
            {check && switchInfo &&
                <span className="ml-05" >
                    <CheckboxSwitch
                        text={switchInfo.text}
                        bsSize="xs"
                        checked={switchInfo.check}
                        onChange={handleChangeCheck}
                    />
                </span>
            }
        </div>
    );
}
