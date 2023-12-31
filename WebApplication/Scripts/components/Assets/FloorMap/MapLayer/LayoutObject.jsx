﻿/**
 * Copyright 2017 DENSO Solutions
 * 
 * レイアウトオブジェクトレイヤ Reactコンポーネント
 *  
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';

import RectObjectGroup from 'Assets/FloorMap/Object/RectObjectGroup/RectObjectGroup.jsx';
import { OBJECT_TYPE } from 'constant';
import * as THREE from 'three';

/**
 * レイアウトオブジェクトレイヤ
 * @param {object} layoutObject レイアウトオブジェクト情報
 * @param {bool} isTransmissive オブジェクトを透過するかどうか
 */
export default class LayoutObject extends Component {

    constructor(props) {
        super(props);
        this.state = {
        };
    }
    init() {
        const camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.01, 10 );
        camera.position.z = 1;
        
        const scene = new THREE.Scene();
        
        const geometry = new THREE.BoxGeometry( 0.2, 0.2, 0.2 );
        const material = new THREE.MeshNormalMaterial();
        
        const mesh = new THREE.Mesh( geometry, material );
        scene.add( mesh );
        
        const renderer = new THREE.WebGLRenderer( { antialias: true } );
        renderer.setSize( window.innerWidth, window.innerHeight );
        renderer.setAnimationLoop( animation );
        document.body.appendChild( renderer.domElement );
    }

    componentDidMount() {
        this.init();
        function animation( time ) {
        
            mesh.rotation.x = time / 2000;
            mesh.rotation.y = time / 1000;
        
            renderer.render( scene, camera );
        
        }
        animation(4);
    }
    /**********************************
    * 
    * ライフサイクルイベント
    * 
    **********************************/

    /**
     * コンポーネントをアップデートするかどうか
     */
    shouldComponentUpdate(nextProps, nextState) {
        //異なるインスタンスでも中身が同じであればアップデートしない
        if (JSON.stringify(nextProps) !== JSON.stringify(this.props)) {
            return true;
        }
    }

    /**********************************
    * 
    * イベントハンドラ
    * 
    **********************************/

    /**
     * オブジェクトクリックイベント
     */
    handleClickObject(object, isDouble) {
        if (!isDouble) {
            //選択したオブジェクトを最前面に移動（枠を太くした場合に他のオブジェクトと重なるため）
            var g = document.getElementById(object.objectId);
            svgz_element(g).toTop();
        }
        
        if (this.props.onClickObject) {
            this.props.onClickObject(object, isDouble);
        }
    }

    /**
     * ダブルオブジェクトクリックイベント
     */
    handleDoubleClickObject(object) {
        if (this.props.onDoubleClickObject) {
            this.props.onDoubleClickObject(object);
        }
    }

    /**
     * 選択可能かどうかを取得する
     * @param {boolean} selectable 選択可能かどうか
     * @param {array} selectableLinkTypes 選択可能とするリンク種別
     * @param {boolean} authCheckable 権限チェックかのうかどうか
     * @param {object} layoutObject レイアウトオブジェクト情報
     * @returns {boolean} 選択可能か
     */
    getSelectable(selectable, selectableLinkTypes, authCheckable, layoutObject) {
        const canSelect = selectable && (!selectableLinkTypes || selectableLinkTypes.includes(layoutObject.linkType));
        if(canSelect && authCheckable) {
            return layoutObject.isAllowed;
        }
        return canSelect;
    }

    /**
     * render
     */
    render() {
        const { layoutObjects, isTransmissive, selectObjectId, selectable, selectableLinkTypes, authCheckable } = this.props;

        return (
            <g id="layoutObject">
                {layoutObjects &&
                    layoutObjects.map((object, index) => {
                        let className = "normal-object";
                        if (object.objectId === selectObjectId) {
                            className = "select-object";
                        }
                        let textObjectClassName = "";
                        if (object.objectType === OBJECT_TYPE.valueLabel) {
                            textObjectClassName = object.foreColor;
                        }
                        return (
                            <RectObjectGroup
                                id={object.objectId}
                                className={className}
                                textObjectClassName={textObjectClassName}
                                isTransmissive={isTransmissive}
                                selectable={this.getSelectable(selectable, selectableLinkTypes, authCheckable, object)}
                                {...object}
                                onClickObject={(isDouble) => this.handleClickObject(object, isDouble)}
                            />
                        );
                    })
                }
            </g>
        );
    }

}

LayoutObject.propTypes = {
    layoutObjects: PropTypes.array,     //レイアウトオブジェクト情報
    isTransmissive: PropTypes.bool,     //オブジェクトを透過させるかどうか
    handleClickObject:PropTypes.func    //オブジェクトクリックイベント関数
};

LayoutObject.defaultProps = { selectable: true };