/**
 * @license Copyright 2021 DENSO
 * 
 * FileSelectForm Reactコンポーネント
 * 
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Icon from 'Common/Widget/Icon';
import Button from 'Common/Widget/Button';
import { FormGroup, ControlLabel, FormControl, HelpBlock } from 'react-bootstrap';


/**
 * ファイル選択（ドラッグ＆ドロップ含む）コンポーネント
 * @param {string} acceptFileType ファイル種別
 * @param {object} file ファイル
 * @param {string} validationState 入力検証ステータス
 * @param {string} helpText ヘルプテキスト
 * @param {boolean} isReadOnly 読取専用か
 * @param {function} onChangeFile ファイル変更に呼び出す
 */
export default class FileSelectForm extends Component {
    
    /**
     * コンストラクタ
     */
    constructor(props) {
        super(props);
        this.fileInputRef = null;
        this.dropAreaRef = null;
        this.innerFlag = false;         //DragArea内での要素間の移動フラグ
    }

    /**
     * Componentがレンダリングされた直後に呼び出される
     */
    componentDidMount() {
        window.addEventListener('dragover', this.disableDefaultDragover, false);
        window.addEventListener('drop', this.disableDefaultDrop, false);
    }
    
    /**
     * Componentがアンマウントされる時に呼び出される
     */
    componentWillUnmount() {
        window.removeEventListener('dragover', this.disableDefaultDragover, false);
        window.removeEventListener('drop', this.disableDefaultDrop, false);
    }

    /**
     * render
     */
    render() {
        const { file, title, acceptFileType, isReadOnly, helpText, validationState } = this.props;
        return (
            <FormGroup validationState={validationState}>
                <ControlLabel>{title}</ControlLabel>
                {file&&<FormControl.Static >{file.name}</FormControl.Static >}
                {helpText && <HelpBlock className="mb-05 mt-0" >{helpText}</HelpBlock>}
                <div
                    ref={this.setDropAreaRef}
                    className="file-drop-area"
                    onDrop={this.handleDrop}
                    onDragOver={this.handleDragOver}
                    onDragLeave={this.handleDragLeave}
                    onDragEnter={this.handleDragEnter}
                >
                    <p>ここにファイルをドラッグ＆ドロップしてください</p>
                    <p>または</p>
                    <Button bsStyle="primary" disabled={isReadOnly} onClick={() => this.fileInputRef.click()} >
                        <Icon className="fal fa-folder-open mr-05" />
                        ファイル選択
                    </Button>
                    <input
                            ref={this.setFileInputRef}
                            type="file"
                            accept={acceptFileType}
                            style={{ display: 'none' }}
                            onChange={this.handleSelectFile}
                    /> 
                </div>                
            </FormGroup>
        );
    }

    /**
     * fileInputRefをセットする
     * @param {object} ref 
     */
    setFileInputRef = (ref) => {
        this.fileInputRef = ref;
    }

    /**
     * dropAreaのrefをセットする
     * @param {object} ref 
     */
    setDropAreaRef = (ref) => {
        this.dropAreaRef = ref;
    }

    /**
     * デフォルトのドラッグ機能を無効化する
     */
    disableDefaultDragover = (e) => {
        e.preventDefault();
    }

    /**
     * デフォルトのドロップ機能を無効化する
     */
    disableDefaultDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
    }

    /**
     * ファイル選択時
     */
    handleSelectFile = () => {
        if(typeof this.fileInputRef.files[0] !== 'undefined') {
            const file = this.fileInputRef.files[0];
            this.onChangeFile(file);            
        }
    }

    /**
     * ドラッグエンターイベント
     */
    handleDragEnter = (e) => {
        this.innerFlag = true;
    }

    /**
     * ドラッグアウトイベント
     */
    handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (this.innerFlag) {
            this.innerFlag = false;         //フラグがONの場合は戻す
        } else {
            //DragArea以外にドラッグアウトした場合はクラスを削除
            this.removeDragOverClass();
        }
    };
    
    /**
     * ドラッグオーバーイベント
     */
    handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();

        this.innerFlag = false;         //フラグをOFFにする
        this.addDragOverClass();
    };

    /**
     * ドロップイベント
     */
    handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.innerFlag = false;
        this.removeDragOverClass();
        
        if (!this.props.isReadOnly) {
            //ドロップしたファイルの取得
            var files = e.dataTransfer.files;

            //取得したファイルをinput[type=file]へ
            this.fileInputRef.files = files;
            
            if(typeof files[0] !== 'undefined') {
                //ファイルが正常に受け取れた場合は、イベントを発生
                this.onChangeFile(files[0]);
            }
        }

    };

    /**
     * ドラッグオーバー用のクラスを追加
     */
    addDragOverClass() {
        if (!this.dropAreaRef.classList.contains('dragover')) {
            this.dropAreaRef.classList.add('dragover');
        }
    }
    
    /**
     * ドラッグオーバー用のクラスを削除
     */
    removeDragOverClass() {
        if (this.dropAreaRef.classList.contains('dragover')) {
            this.dropAreaRef.classList.remove('dragover');
        }
    }

    /**
     * ファイル変更イベントを発生
     * @param {*} file 
     */
     onChangeFile(file) {
        if (this.props.onChangeFile){
            this.props.onChangeFile(file);
        }
    }
    
}

FileSelectForm.propTypes = {
    acceptFileType: PropTypes.string,
    file: PropTypes.object,    
    validationState: PropTypes.string,
    helpText: PropTypes.string,
    isReadOnly: PropTypes.bool,
    onChangeFile: PropTypes.func
};