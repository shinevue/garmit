/**
 * @license Copyright 2018 DENSO
 * 
 * SwichPlaneButton Reactコンポーネント
 * 
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Label } from 'react-bootstrap';
import IconToolButton from './IconToolButton';
import ToggleSwitch from 'Common/Widget/ToggleSwitch'

/**
 * 前面背面切替ボタンコンポーネント
 * @param {boolean} isFront 前面表示かどうか
 * @param {boolean} specifyContainer ツールチップのコンテナを指定するかどうか
 * @param {object} container ツールチップのコンテナ
 * @param {function} onButtonEventTrigger ツールチップを表示するボタンのイベントが発生したときに呼び出す（ポップアップ用）
 * @param {function} onChange 前面背面を切り替えたときに呼び出す。引数で前面かどうかを渡す
 * @param {boolean} isPopout ポップアウトで表示するか
 */
export default class SwichPlaneButton extends Component {
    
    static get SWICH_PLANES() {
        return [
            { value: true, text: '前面' },
            { value: false, text: '背面' }
        ];
    }

    render() {
        const { isFront, isPopout, target, specifyContainer, container } = this.props;
        return (
            <span class="rack-flip">
                {isPopout?
                    <PopoutToggleSwitch value={isFront} 
                                        swichValues={SwichPlaneButton.SWICH_PLANES}
                                        onChange={(value) => this.handleChanged(value)}
                    />
                :
                    <ToggleSwitch value={isFront} 
                                  name="rack-face" 
                                  bsSize="xs" 
                                  swichValues={SwichPlaneButton.SWICH_PLANES}
                                  onChange={(value) => this.handleChanged(value)} />

                }
            </span>
        );
    }

    /**
     * 前面背面切替イベント
     * @param {string} 変更後の値
     */
    handleChanged(value) {
        if (this.props.onChange) {
            this.props.onChange(Boolean(value));   //前面背面の切替
        }
    }
    
}

SwichPlaneButton.propTypes = {
    isFront: PropTypes.bool,
    specifyContainer: PropTypes.bool,
    container: PropTypes.object,
    onChange: PropTypes.func,
    isPopout: PropTypes.bool
}

/**
 * ポップアウト用スイッチ
 */
const PopoutToggleSwitch = ({ value, swichValues, onChange: handleChanged }) => {
    return (
        <div class="btn-group-switch btn-group-switch-xs btn-group">
            {swichValues&&swichValues.length>0&&
                swichValues.map((item) => 
                    <label className={classNames("btn", { active: (item.value === value) })} 
                          onClick={() => handleChanged(item.value)}>{item.text}</label>
                )
            }
        </div>
    );
}