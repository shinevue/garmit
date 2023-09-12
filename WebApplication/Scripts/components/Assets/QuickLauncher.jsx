/**
 * @license Copyright 2018 DENSO
 * 
 * QuickLauncher Reactコンポーネント
 * 
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { ButtonToolbar, OverlayTrigger, Popover, Tabs, Tab, Row, Col } from 'react-bootstrap';

import SelectForm from 'Common/Form/SelectForm';
import Button from 'Common/Widget/Button';

/**
 * クイックランチャーコンポーネント
 * @param {array} pages ページリスト
 * @param {boolean} isReadOnly 読み取り専用かどうか
 * @param {string} buttonClass ボタンのクラス
 * @param {string} buttonBsStyle ボタンのスタイル
 * @param {string} buttonSize ボタンサイズ
 * @param {boolean} specifyTarget ツールチップのターゲットを指定するかどうか
 */
export default class QuickLauncher extends Component {

    /**
     * コンストラクタ
     */
    constructor(props) {
        super(props);
        this.state = { 
            selectPageNo: props.pages&&props.pages[0].no,
            target: undefined
        };
    }

    /**
     * render
     */
    render() {
        const { pages, isReadOnly, buttonClass, buttonBsStyle, buttonSize, container, className } = this.props;
        const { selectPageNo } = this.state;
        return (
            <OverlayTrigger container={container} trigger='click' rootClose placement='bottom' overlay={
                <Popover className={classNames('quick-launcher-popover', className)} title='クイックランチャー'>
                    {pages&&(pages.length > 1)&&
                        <SelectForm value={selectPageNo} className='mb-0'
                            options={
                                pages.map((item) => { return {value: item.no, name: item.name}; } )
                            } 
                            onChange={(v) => this.pageNoChanged(v)} />
                    }
                    {pages&&this.launcherButtons(pages, selectPageNo)}
                </Popover>
                } >
                <Button className={buttonClass} 
                        iconId="quick-launcher"
                        bsStyle={buttonBsStyle} 
                        bsSize={buttonSize} 
                        disabled={isReadOnly}
                        onClick={() => this.onButtonEventTrigger()}
                >
                </Button>
            </OverlayTrigger>
        );
    }
    
    /**
     * リンクボタンを作成する
     * @param {*} pages 
     * @param {number} selectPageNo 
     */
    launcherButtons(pages, selectPageNo){
        var links;
        if (selectPageNo && pages.length > 1) {
            var selectPage = pages.find((item) => (item.no === selectPageNo));
            links = selectPage ? selectPage.links : [];
        } else {
            links = pages[0].links;
        }

        return (
            <ButtonToolbar >{links&&links.map((l)=>l.title&&<Button className='mt-05' target="_blank" href={l.url}>{l.title}</Button>)}</ButtonToolbar>
        );
    }

    /**
     * URLを別ウィンドウで開く
     * @param {*} e 
     * @param {*} url
     */
    openUrl(e, url) {
        e.preventDefault();
        window.open( url, "_blank");
    }

    /**
     * ページ番号を変更する
     * @param {number} pageNo 
     */
    pageNoChanged(pageNo){
        var obj = Object.assign({}, this.state);
        obj.selectPageNo = parseInt(pageNo);
        this.setState(obj);
    }

    /**
     * クイックランチャーを表示するボタンのイベント発生をお知らせする
     */
    onButtonEventTrigger() {
        if (this.props.specifyContainer && this.props.onButtonEventTrigger) {
            this.props.onButtonEventTrigger();
        }
    }
    
}

QuickLauncher.propTypes = {
    pages : PropTypes.arrayOf(PropTypes.shape({
        no: PropTypes.number,
        name: PropTypes.string,
        links : PropTypes.arrayOf(PropTypes.shape({
            title: PropTypes.string.isRequired,
            url: PropTypes.string.isRequired
        }))
    })),
    isReadOnly: PropTypes.bool,
    buttonClass: PropTypes.string,
    buttonBsStyle: PropTypes.string,
    buttonSize: PropTypes.string,
    specifyContainer: PropTypes.bool,
    container: PropTypes.object,
    onButtonEventTrigger: PropTypes.func
}

