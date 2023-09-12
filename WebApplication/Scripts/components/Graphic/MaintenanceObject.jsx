/**
 * Copyright 2017 DENSO Solutions
 * 
 * メンテナンス用オブジェクト Reactコンポーネント
 *  
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';

import RectObjectGroup from 'Assets/FloorMap/Object/RectObjectGroup/RectObjectGroup.jsx';
import { setEditableObject, clearEditableObject } from 'graphicUtility';

/**
 * メンテナンス用オブジェクト
 */
export default class MaintenanceObject extends Component {

    constructor() {
        super();
        this.state = {
        };
    }

    /**
     * 最初のレンダリング時にクライアントに一度だけ呼び出されます。
     * Componentがレンダリングされた直後に呼び出されるメソッドです。
     * ここでsetStateを行うと、renderがもう一度呼び出されるためあまり行わないほうがよいです。
     */
    componentDidMount() {
        const { objectInfo, mapSetting, isEditMode } = this.props;
        if (isEditMode) {   //編集モード
            setEditableObject(objectInfo.objectId, this.handleChangeMapObject.bind(this));
        }
    }

    /**
     * コンポーネントが更新された後に呼び出される
     */
    componentDidUpdate(prevProps, prevState) {
        const { objectInfo, mapSetting, isEditMode } = this.props;
        const { mapSetting: prevMapSetting, isEditMode: prevIsEditMode } = prevProps;
        if (isEditMode !== prevIsEditMode) {
            if (isEditMode) {   //編集モード
                setEditableObject(objectInfo.objectId, this.handleChangeMapObject.bind(this));
            }
            else {   //編集モード解除
                clearEditableObject(objectInfo.objectId);
            }
        }
    }

    /**
     * マップオブジェクト操作イベント
     */
    handleChangeMapObject=(changeInfo)=> {
        if (this.props.onChangeMapObject) {
            this.props.onChangeMapObject(changeInfo)
        }
    }

    /**
     * render
     */
    render() {
        const { objectInfo, isEditMode, isSelect, isFirstSelect } = this.props;
        return (
            <RectObjectGroup
                id={objectInfo.objectId}
                groupClassName={isEditMode && "maint-object-group"}
                className={classNames({ "maint-object": isEditMode, "maint-select-object": isSelect })}
                isTransmissive={false}
                selectable={isEditMode ? true : false}
                showFrame={isSelect}
                frameColor={isFirstSelect ? "#DE6641" : "#00A0E9"}
                {...objectInfo}
            />
        )
    }
}

MaintenanceObject.propTypes = {
    objectInfo: PropTypes.obj,      //オブジェクト情報
    isEditMode: PropTypes.bool,     //編集モードかどうか
    isSelect: PropTypes.bool        //選択オブジェクトかどうか
};