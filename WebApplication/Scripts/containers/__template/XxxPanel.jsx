/**
 * @license Copyright 2023 DENSO
 * 
 * Xxx画面
 * 
 * 画面のコンテナとして。Reduxに依存したコードを記述します。
 * 画面のロジックはここに記述します。（適宜ファイル分割は行うこと）
 * 
 */
'use strict';

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { browserHistory } from 'react-router';

import * as Actions from './actions.js';
import { setAuthentication } from 'Authentication/actions.js';

import { Button } from 'react-bootstrap';

import Content from 'Common/Layout/Content';
import Box from 'Common/Layout/Box';
import BoxColseButton from 'Common/Widget/BoxColseButton';

import { sendData, EnumHttpMethod, NETWORKERROR_MESSAGE } from 'http-request';

/**
 * Xxx画面のコンポーネント
 */
class XxxPanel extends Component {

    /**
     * コンストラクタ
     */
    constructor(){
        super();
        // TODO：Reactのstateを定義する場合は、下記のコメントを外して使用してください。
        // this.state = {
        // };
    }

    /**
     * 最初のレンダリング時にクライアントに一度だけ呼び出されます。
     * Componentがレンダリングされた直後に呼び出されるメソッドです。
     * ここでsetStateを行うと、renderがもう一度呼び出されるためあまり行わないほうがよいです。
     */
    componentDidMount() {
        this.loadInfo();
    }

    /**
     * 画面の初期データを非同期で読み込む
     */
    loadInfo () {

        //TODO：初期データを取得するURLを指定してください。url_to_infoを置き換えてください。
        //TODO：Postで呼び出す場合は、EnumHttpMethod.postを引数に渡してください。
        sendData(EnumHttpMethod.get, 'api/url_to_info', null, (data, netwrokError) => {
            
            //TODO：actions.jsで定義した、初期データをセットするActionを呼び出してください。
            //TODO："initPanelInfo"は、mapDispatchToPropsに指定した関数に読み替えてください
           this.props.initPanelInfo(data);
        });
    }
    
    /**
     * render
     */
    render() {
        const { xxxReducer } = this.props;     //TODO：xxxReducerを変更してください。

        return (
            <Content>
                <h3>画面の内容をここに記述してください。下記は例です。</h3>
                <Box boxStyle='default'>
                    <Box.Header>
                        <Box.Title>ボックスのタイトルをここに記述してください。</Box.Title>
                        <Box.Tools>
                            <BoxColseButton/>
                        </Box.Tools>
                    </Box.Header >
                    <Box.Body>
                        <div>ボックスの内容をここに記述してください。</div>
                    </Box.Body>
                    <Box.Footer>
                        <div className='pull-right'>
                            <Button>テスト</Button>
                        </div>
                    </Box.Footer>
                </Box>
            </Content>
        );
    }    
}

// Which props do we want to inject, given the global state?
// Note: use https://github.com/faassen/reselect for better performance.

/**
 * storeからstateを受け取り、propsに入れ込みます。
 */
const mapStateToProps = (state) => {
    return {
        authentication: state.authentication,
        xxxReducer: state.xxxReducer        //TODO：reducer.jsにあるReducerと同じ名前をセットしてください。Reducerがいくつかある場合は、下に追加していきます。
    };
};

/**
 * 画面更新のアクションを設定します。
 * storeからActionを受け取り、propsに入れ込みます。
 */
const mapDispatchToProps = (dispatch) => {
    return {
        ...bindActionCreators(Actions, dispatch),
        setAuthentication: (auth) => dispatch(setAuthentication(auth)),
        initPanelInfo:(value) => dispatch( initPanelInfo(value) ) //TODO actions.jsで定義したActionを設定してください。Actionが追加になった場合は、下に追加していきます。
    };
};

// Wrap the component to inject dispatch and state into it
/**
 * mapStateToProps, mapDispatchToPropsをReduxと連携させる
 */
export default connect(mapStateToProps, mapDispatchToProps)(XxxPanel);

 