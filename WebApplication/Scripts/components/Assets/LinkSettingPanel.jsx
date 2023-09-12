/**
 * @license Copyright 2017 DENSO
 * 
 * LinkSettingPanel Reactコンポーネント
 * 
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Checkbox } from 'react-bootstrap';

import Box from 'Common/Layout/Box';
import InputTable from 'Common/Form/InputTable';
import LabelForm from 'Common/Form/LabelForm';
import TextForm from 'Common/Form/TextForm';
import Button from 'Common/Widget/Button';

import { validateText, validateUrl, VALIDATE_STATE } from 'inputCheck';
import { compareAscending } from 'sortCompare';
import MessageModal from 'Assets/Modal/MessageModal';
import { MAXLENGTH_LINK } from 'assetUtility';

const MAX_LINK_COUNT = 6;

/**
 * リンク設定コンポーネントを定義します
 * 項目を変更すると、リンクの全てのデータがonChange()で返ります
 * @param {array} links リンク情報リスト
 * @param {boolean} isLoading ロード中かどうか
 * @param {boolean} isReadOnly 読み取り専用かどうか
 * @param {boolean} defaultClose 初期状態でボックスの閉じておくかどうか
 * @param {function} onChange リンク情報が変更されたときに呼び出します。リンク設定情報をすべて返却する。
 */
export default class LinkSettingPanel extends Component {
    
    /**
     * コンストラクタ
     */
    constructor(props) {
        super(props);
        this.state = {
            allChecked: false,
            showMessage: false
        };
    }
    
    /**
     * 新しいpropsを受け取るときに呼び出されます。
     * propsによってstateを変更する場合はここでthis.setState()を行います。このsetStateでrenderを呼ぶことはありません。
     * @param {*} nextProps 新しいprops
     */
    componentWillReceiveProps( nextProps ){
        const { isReadOnly } = nextProps;
        if (isReadOnly != this.props.isReadOnly && !isReadOnly) {
            this.setState({
                allChecked: false,
                showMessage: false
            });
        }
    }

    /**
     * render
     */
    render() {
        const { links ,defaultClose, isReadOnly, isLoading } = this.props;
        const { showMessage } = this.state;

        return (
            <Box className='mb-0' boxStyle='default' isCollapsible={true} defaultClose={defaultClose} isLoading={isLoading}>
                <Box.Header>
                    <Box.Title>リンク設定</Box.Title>
                </Box.Header >
                <Box.Body>
                    {!isReadOnly||(links&&links.length > 0)?
                        <InputTable
                            headerInfo={this.tableHeader(isReadOnly, links)}
                            inputComponentList={this.inputComponentList(isReadOnly)}
                            data={this.inputRowInfo(links, isReadOnly)}
                        />
                    :
                        <div>リンク設定はありません</div>
                    }
                    {!isReadOnly&&
                        <Button className="mt-05" 
                                iconId="delete"
                                bsSize="sm" 
                                disabled={links&&(links.length <= 0 || !links.some((link) => link.checked))}
                                onClick={() => this.changeComfirmShowState()} >
                                削除
                        </Button>
                    }
                    {!isReadOnly&&
                        <Button disabled={links ? links.length >= MAX_LINK_COUNT : false} 
                                className="ml-05 mt-05" 
                                iconId="add"
                                bsSize="sm" 
                                onClick={() => this.addRow()} >
                                追加
                        </Button>
                    }
                    <MessageModal show={showMessage} 
                                  title='確認' 
                                  bsSize='small'
                                  buttonStyle='confirm'
                                  onOK={() => this.deleteRow()} 
                                  onCancel={() => this.changeComfirmShowState()} >
                                  <div>チェックされたリンクを削除します。</div>
                                  <div>よろしいですか？</div>
                    </MessageModal>
                </Box.Body>
            </Box>
        );
    }
    
    
    /**
     * ヘッダーのリストを作成する
     * @param {boolean} isReadOnly 読み取り専用かどうか
     * @param {array} links リンク一覧
     * @param {array} ヘッダのプロパティ配列
     */
    tableHeader(isReadOnly, links){
        var headerList = [
            { label: 'No.', columnSize: 1  },
            { label: 'タイトル', columnSize: 4, isRequired: !isReadOnly },
            { label: 'URL', columnSize: (isReadOnly?7:6), isRequired: !isReadOnly }
        ]
        if (!isReadOnly) {
            headerList.unshift({ label: '削除', columnSize: 1, showCheckBox: true, checkBoxDisabled: !(links&&links.length>0), onChangeChecked: (value) => this.changeAllChecked(value), checked: this.state.allChecked });
        }
        return headerList;
    }

    /**
     * 各列のコンポーネント要素リストを作成する
     * @param {boolean} isReadOnly 読み取り専用かどうか
     * @returns {array} 各列のコンポーネントリスト
     */
    inputComponentList(isReadOnly){
        var inputComponentList = [ LabelForm, TextForm, TextForm ];
        if (!isReadOnly) {
            inputComponentList.unshift(Checkbox);
        }
        return inputComponentList; 
    }

    /**
     * 入力欄データを作成する
     * @param {array} links リンク一覧
     * @param {boolean} isReadOnly 読み取り専用かどうか
     * @returns {array} 入力欄のpropsデータの配列
     */
    inputRowInfo(links, isReadOnly) {

        if (!links||links.length <= 0) {
            return null;
        }

        links = links.sort((current, next) => compareAscending(current.linkNo, next.linkNo));
        return links.map((row, index) => {
                    return (
                        {
                            id: row.linkNo,
                            columnInfo: this.makeCellList(row, isReadOnly)
                        }
                    );
               });
    }

    /**
     * 入力欄（セル）のデータを作成する
     * @param {object} rowData 一行のデータ
     * @param {boolean} isReadOnly 読み取り専用かどうか
     * @returns {array} 1行分のセルのpropsリスト
     */
    makeCellList(rowData, isReadOnly) {
        const validate = this.validate(rowData, isReadOnly);

        var cellList = [
            { 
                isReadOnly: isReadOnly, 
                value: rowData.linkNo,
                className: 'ta-c'
            },
            { 
                isReadOnly: isReadOnly, 
                value: rowData.title, 
                validationState: validate.title.state, 
                helpText: validate.title.helpText, 
                placeholder: 'タイトル',
                onChange: (value) => this.changeItem(value, rowData.url, rowData.linkNo), 
                maxlength: MAXLENGTH_LINK.title
            },
            { 
                isReadOnly: isReadOnly, 
                value: rowData.url, 
                validationState: validate.url.state, 
                helpText: validate.url.helpText, 
                placeholder: 'URL',
                onChange: (value) => this.changeItem(rowData.title, value, rowData.linkNo), 
                maxlength: MAXLENGTH_LINK.url
            }
        ];
        
        if (!isReadOnly) {
            cellList.unshift({ 
                checked: rowData.checked, 
                bsClass: "flex-center", 
                value: rowData.linkNo,
                onChange: (e) => this.changeItemChecked(e.target.checked, rowData.linkNo) 
            });
        }
        return cellList; 
    }

    /********************************************
     * イベント
     ********************************************/

    /**
     * 項目を変更して、項目変更イベントを呼び出す
     * @param {string} title タイトル
     * @param {string} url URL
     * @param {number} linkNo リンク番号
     */
    changeItem(title, url, linkNo){
        if (this.props.onChange) {
            const workLinks = Object.assign([], this.props.links);
            workLinks.some((link) => {
                if (link.linkNo === linkNo){
                    link.title = title;
                    link.url = url;

                    const validate = this.validate(link, this.props.isReadOnly);
                    link.isError = (validate.title.state !== VALIDATE_STATE.success ||
                                    validate.url.state !== VALIDATE_STATE.success)
                }
                return (link.linkNo === linkNo);
            });

            this.props.onChange(workLinks, this.isError(workLinks));
        }
    }
    
    /**
     * チェック状態変更イベント
     * @param {boolean} checked 変更後のチェック状態
     * @param {number} linkNo 対象のリンク番号
     */
    changeItemChecked(checked, linkNo) {
        if (this.props.onChange) {
            const workLinks = Object.assign([], this.props.links);
            workLinks.some((link) => {
                if (link.linkNo === linkNo){
                    link.checked = checked;
                }
                return (link.linkNo === linkNo);
            });

            this.setState({allChecked: this.isAllChecked(workLinks)});
            this.props.onChange(workLinks, this.isError(workLinks));
        }
    }

    /**
     * チェックされた行を削除する
     */
    deleteRow(){
        if (this.props.onChange) {
            var workLinks = Object.assign([], this.props.links);
            workLinks = workLinks.filter((link) => {
                return !link.checked;
            });
            this.setState({allChecked: this.isAllChecked(workLinks), showMessage: false});
            this.props.onChange(workLinks, this.isError(workLinks));        
        }
    }

    /**
     * 行を追加する
     */
    addRow(){        
        if (this.props.onChange) {
            //新しいリンク番号を発行する(新しい番号を振りなおす)
            var linkNoList = this.props.links ? this.props.links.map((link) => link.linkNo) : [];
            const maxNumber = Math.max.apply(null, linkNoList);
            var linkNo = 1;
            for (let index = 1; index <= (maxNumber + 1); index++) {
                if (linkNoList.indexOf(index) < 0) {
                    linkNo = index;
                    break;
                }
            }

            var workLinks = Object.assign([], this.props.links);
            workLinks.push({ linkNo: linkNo, title: '', url: '', isError: true });
            
            this.setState({allChecked: this.isAllChecked(workLinks)});
            this.props.onChange(workLinks, this.isError(workLinks));
        }
    }

    /**
     * 全チェックする
     * @param {boolean} checked 変更後のチェック状態
     */
    changeAllChecked(checked){
        if (this.props.onChange) {
            const workLinks = Object.assign([], this.props.links);
            workLinks.some((link) => {
                link.checked = checked;
            });

            this.setState({allChecked: checked});
            this.props.onChange(workLinks, this.isError(workLinks));
        }
    }

    /**
     * 全てチェックされているかどうか
     * @param {array} list 対象のリスト 
     */
    isAllChecked(list) {
        return list&&list.length>0 ? list.every((item) => item.checked === true) : false;
    }

    /********************************************
     * モーダル表示変更
     ********************************************/

    /**
     * 確認メッセージの表示状態を変更する
     */
    changeComfirmShowState() {
        var obj =  Object.assign({}, this.state);
        obj.showMessage = !obj.showMessage;
        this.setState(obj);
    }

    /********************************************
     * 入力検証
     ********************************************/
    
    /**
     * 入力検証する
     * @param {object} link リンク情報
     * @param {boolean} isReadOnly 読み取り専用かどうか
     * @returns {object} 検証結果
     */
    validate(link, isReadOnly){
        var validate = { title: { state: null }, url: { state: null }  };
        if (!isReadOnly) {
            validate.title = validateText(link.title, MAXLENGTH_LINK.title, false);
            validate.url = validateUrl(link.url, MAXLENGTH_LINK.url);
        }
        return validate;
    }

    /**
     * リンク情報にエラーがあるかどうか
     * @param {array} links リンク情報リスト
     * @returns {boolean} エラーかどうか
     */
    isError(links) {
        return links ? links.some((link) => link.isError) : false;
    }
}

LinkSettingPanel.propTypes = {
    links: PropTypes.arrayOf(PropTypes.shape({
        linkNo: PropTypes.number.isRequired,
        title: PropTypes.string.isRequired,
        url: PropTypes.string.isRequired
    })),
    isLoading: PropTypes.bool,
    isReadOnly: PropTypes.bool,
    defaultClose: PropTypes.bool,
    onChange: PropTypes.func
}
