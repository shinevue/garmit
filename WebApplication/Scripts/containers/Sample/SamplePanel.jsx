/**
 * @license Copyright 2017 DENSO
 * 
 * サンプル画面のReactコンポーネント
 * 
 */

'use strict';

import React, { Component } from 'react';
import { connect } from 'react-redux';

import { ButtonToolbar, ResponsiveEmbed, Row, Col } from 'react-bootstrap';

import { loadMessage, addMessage, addCount } from './actions.js';

import Content from 'Common/Layout/Content';
import Box from 'Common/Layout/Box';
import BoxColseButton from 'Common/Widget/BoxColseButton';

import DataTable from 'Common/Widget/DataTable';

import Button from 'Common/Widget/Button';
import ToggleSwitch from 'Common/Widget/ToggleSwitch';
import CheckboxSwitch from 'Common/Widget/CheckboxSwitch';

import { sendData, EnumHttpMethod } from 'http-request';

class SamplePanel extends Component {

    constructor(){
        super();
        this.state = {
            user: {
                name: 'デフォルト管理者'
            }
        };
    }

    componentDidMount() {
        this.loadSandbox();
    }

    /**
     * メッセージをロードする
     */
    loadSandbox () {
        sendData(EnumHttpMethod.get, 'api/sample', null, (data) => {
           //this.props.loadMessage(data);
        });
    }
    
    

    /**
     * データ一行を作成する
     * @param {object} dataRow 
     */
    makeDataRow(dataRow){
        var cells = [];
        if (dataRow) {
            cells.push(<td>{dataRow.time}</td>);
            cells.push(<td>{dataRow.message}</td>);
        }
        return (<tr>{cells}</tr>);
    }

    /**
     * メッセージを追加する
     */
    addMessage(){      
        //追加メッセージ作成
        var addItem = {
            time: new Date().toLocaleString(),
            message: "追加メッセージ" + this.props.count.toString()
        }
        
        sendData(EnumHttpMethod.post, 'api/sample/add', addItem, (result) => {
            if (result) {
                this.props.addMessage(addItem);      
                this.props.addCount();       
            } else {
                alert("保存できませんでした");
            }
        });
    }
    
    /**
     * メッセージ件数
     */
    dispMessageCount(){
        sendData(EnumHttpMethod.post, 'api/sample/', this.props.sample.sampleItems, (data) => {
            alert(data);
        });
    }

    render() {
        const { sample } = this.props;
        const { user } = this.state;

        //とりあえず固定
        const start = 0;
        const end = (sample.sampleItems.length > 10) ? 10: sample.sampleItems.length;

        const swichPlanes = [{ value: 1, text: '前面' }, { value: 2, text: '背面' }];
        const swichSeconds = [{ value: 0, text: 'なし' }, { value: 30, text: '30秒' }, { value: 60, text: '60秒' }];
        const swichLongSeconds = [{ value: 0, text: 'なし' }, 
                                  { value: 30, text: '30秒' }, 
                                  { value: 60, text: '60秒' }, 
                                  { value: 90, text: '90秒' }, 
                                  { value: 120, text: '120秒' }];

        return (
            <Content>
                <Content.Header>
                    <h1>サンプル</h1>
                </Content.Header>
                <Content.Body>
                    <Row>
                        <Col sm={6}>
                            <Box boxStyle='default'>
                                <Box.Header>
                                    <Box.Title>Component: Buttons</Box.Title>
                                    <Box.Tools>
                                        <BoxColseButton/>
                                    </Box.Tools>
                                </Box.Header >
                                <Box.Body>
                                    <h2>Standard Size</h2>
                                    <ButtonToolbar>
                                        <Button bsStyle="primary" >通常ボタン</Button>
                                        <Button iconId="delete" onClick={() => {}}>アイコンボタン</Button>
                                    </ButtonToolbar>                                
                                    <h2>btn-lg</h2>
                                    <ButtonToolbar>
                                        <Button bsStyle="primary" bsSize="lg" >通常ボタン</Button>
                                        <Button iconId="delete" bsSize="lg" onClick={() => {}}>アイコンボタン</Button>
                                    </ButtonToolbar>
                                    <h2>btn-sm</h2>
                                    <ButtonToolbar>
                                        <Button bsStyle="primary" bsSize="sm" >通常ボタン</Button>
                                        <Button iconId="delete" bsSize="sm" onClick={() => {}}>アイコンボタン</Button>
                                    </ButtonToolbar>
                                    <h2>btn-xs</h2>
                                    <ButtonToolbar>
                                        <Button bsStyle="primary" bsSize="xs" >通常ボタン</Button>
                                        <Button iconId="delete" bsSize="xs" onClick={() => {}}>アイコンボタン</Button>
                                    </ButtonToolbar>             
                                </Box.Body>
                            </Box>
                        </Col>   
                        <Col sm={6}>           
                            <Box boxStyle='default'>
                                <Box.Header>
                                    <Box.Title>Component: Circle Buttons</Box.Title>
                                    <Box.Tools>
                                        <BoxColseButton/>
                                    </Box.Tools>
                                </Box.Header >
                                <Box.Body>
                                    <h2>Standard Size</h2>
                                    <ButtonToolbar>
                                        <Button iconId="delete" isCircle onClick={() => {}} />
                                        <Button iconId="report-output" isCircle onClick={() => {}} />
                                        <Button iconId="add" isCircle onClick={() => {}} />
                                        <Button isCircle onClick={() => {}} >DC</Button>
                                        <Button isCircle onClick={() => {}} >garmit-DC</Button>
                                    </ButtonToolbar>                                
                                    <h2>btn-lg</h2>
                                    <ButtonToolbar>
                                        <Button iconId="delete" isCircle bsSize="lg" onClick={() => {}} />
                                        <Button iconId="report-output" isCircle bsSize="lg" onClick={() => {}} />
                                        <Button iconId="add" isCircle bsSize="lg" onClick={() => {}} />
                                        <Button isCircle bsSize="lg" onClick={() => {}} >DC</Button>
                                        <Button isCircle bsSize="lg" onClick={() => {}} >garmit-DC</Button>
                                    </ButtonToolbar>
                                    <h2>btn-sm</h2>
                                    <ButtonToolbar>
                                        <Button iconId="delete" isCircle bsSize="sm" onClick={() => {}} />
                                        <Button iconId="report-output" isCircle bsSize="sm" onClick={() => {}} />
                                        <Button iconId="add" isCircle bsSize="sm" onClick={() => {}} />
                                        <Button isCircle bsSize="sm" onClick={() => {}} >DC</Button>
                                        <Button isCircle bsSize="sm" onClick={() => {}} >garmit-DC</Button>
                                    </ButtonToolbar>
                                    <h2>btn-xs</h2>
                                    <ButtonToolbar>
                                        <Button iconId="delete" isCircle bsSize="xs" onClick={() => {}} />
                                        <Button iconId="report-output" isCircle bsSize="xs" onClick={() => {}} />
                                        <Button iconId="add" isCircle bsSize="xs" onClick={() => {}} />
                                        <Button isCircle bsSize="xs" onClick={() => {}} >DC</Button>
                                        <Button isCircle bsSize="xs" onClick={() => {}} >garmit-DC</Button>
                                    </ButtonToolbar>                          
                                </Box.Body>
                            </Box>       
                        </Col> 
                    </Row>     
                    <Row>    
                        <Col sm={12}>           
                            <Box boxStyle='default'>
                                <Box.Header>
                                    <Box.Title>Component: Toggle Switch</Box.Title>
                                    <Box.Tools>
                                        <BoxColseButton/>
                                    </Box.Tools>
                                </Box.Header >
                                <Box.Body>
                                    <h2>Standard Size</h2>
                                    <ButtonToolbar>
                                        <ToggleSwitch value={1} name="swichPlanes" swichValues={swichPlanes} onChange={(v) => {alert(v)}} />
                                        <ToggleSwitch value={0} name="swichSeconds" swichValues={swichSeconds} onChange={(v) => {alert(v)}} />    
                                        <ToggleSwitch value={30} name="swichLongSeconds" swichValues={swichLongSeconds} onChange={(v) => {alert(v)}} /> 
                                        <CheckboxSwitch text="checked" checked={true} disabled={false} onChange={(checked) => {alert(checked)}} />
                                    </ButtonToolbar> 
                                    <h2>btn-lg</h2>
                                    <ButtonToolbar>
                                        <ToggleSwitch value={1} bsSize="lg" name="swichPlanes" swichValues={swichPlanes} onChange={(v) => {}} />
                                        <ToggleSwitch value={0} bsSize="lg" name="swichSeconds" swichValues={swichSeconds} onChange={(v) => {}} />    
                                        <ToggleSwitch value={30} bsSize="lg" name="swichLongSeconds" swichValues={swichLongSeconds} onChange={(v) => {}} /> 
                                        <CheckboxSwitch text="checked" bsSize="lg" checked={false} disabled={false} onChange={(checked) => {}} /> 
                                    </ButtonToolbar>
                                    <h2>btn-sm</h2>
                                    <ButtonToolbar>
                                        <ToggleSwitch value={1} bsSize="sm" name="swichPlanes" swichValues={swichPlanes} onChange={(v) => {}} />
                                        <ToggleSwitch value={0} bsSize="sm" name="swichSeconds" swichValues={swichSeconds} onChange={(v) => {}} />    
                                        <ToggleSwitch value={30} bsSize="sm" name="swichLongSeconds" swichValues={swichLongSeconds} onChange={(v) => {}} />  
                                        <CheckboxSwitch text="checked" bsSize="sm" checked={false} disabled={false} onChange={(checked) => {}} /> 
                                    </ButtonToolbar> 
                                    <h2>btn-xs</h2>
                                    <ButtonToolbar>
                                        <ToggleSwitch value={1} bsSize="xs" name="swichPlanes" swichValues={swichPlanes} onChange={(v) => {}} />
                                        <ToggleSwitch value={0} bsSize="xs" name="swichSeconds" swichValues={swichSeconds} onChange={(v) => {}} />    
                                        <ToggleSwitch value={30} bsSize="xs" name="swichLongSeconds" swichValues={swichLongSeconds} onChange={(v) => {}} />   
                                        <CheckboxSwitch text="checked" bsSize="xs" checked={false} disabled={false} onChange={(checked) => {}} /> 
                                    </ButtonToolbar>
                                </Box.Body>
                            </Box>
                        </Col>   
                    </Row>               
                    {/* ↓ は、一旦コメントアウト */}
                    {/* <Box boxStyle='default'>
                        <Box.Header>
                            <Box.Title>メッセージ</Box.Title>
                            <Box.Tools>
                                <BoxColseButton/>
                            </Box.Tools>
                        </Box.Header >
                        <Box.Body>
                        <DataTable totalItemCount={sample.sampleItems.length} currentPage={1} pageSize={10} onPageClick={() => {}}>
                            <thead>
                                <tr>
                                    <DataTable.HeaderCell sorted='asc' onClick={() => {}}>時間</DataTable.HeaderCell>
                                    <DataTable.HeaderCell sorted={false} onClick={() => {}}>メッセージ</DataTable.HeaderCell>
                                </tr>
                            </thead>
                            <tbody>
                                {sample&& sample.sampleItems.slice(start, end).map((item) => this.makeDataRow(item))}
                            </tbody>
                        </DataTable>
                        </Box.Body>
                        <Box.Footer>
                            <div className='pull-right'>
                                <ButtonToolbar>
                                    <Button onClick={() => this.addMessage()}>メッセージ追加</Button>
                                    <Button onClick={() => this.dispMessageCount()}>件数表示</Button>
                                    <Button onClick={() => this.dispMessageCount()}>test</Button>
                                </ButtonToolbar>
                            </div>
                        </Box.Footer>
                    </Box>
                    <Row>
                        <Col sm={6}>
                            <Box boxStyle='default'>
                                <Box.Header>
                                    <Box.Title>URL埋め込み（アスペクト比 16:9）</Box.Title>
                                    <Box.Tools>
                                        <BoxColseButton/>
                                    </Box.Tools>
                                </Box.Header >
                                <Box.Body>
                                    <ResponsiveEmbed a16by9>
                                        <iframe src="https://react-bootstrap.github.io/"  />
                                    </ResponsiveEmbed>
                                </Box.Body>
                            </Box> 
                        </Col>
                        <Col sm={6}>
                            <Box boxStyle='default'>
                                <Box.Header>
                                    <Box.Title>URL埋め込み（アスペクト比 4:3）</Box.Title>
                                    <Box.Tools>
                                        <BoxColseButton/>
                                    </Box.Tools>
                                </Box.Header >
                                <Box.Body>
                                    <ResponsiveEmbed a4by3>
                                        <iframe src="https://react-bootstrap.github.io/"  />
                                    </ResponsiveEmbed>
                                </Box.Body>
                            </Box>
                        </Col>                            
                    </Row>                 
                    <Box boxStyle='default'>
                        <Box.Header>
                            <Box.Title>URL埋め込み（MaxWidth:660px）</Box.Title>
                            <Box.Tools>
                                <BoxColseButton/>
                            </Box.Tools>
                        </Box.Header >
                        <Box.Body>
                            <div style={{ maxWidth: 660, height: 'auto' }}>
                                <ResponsiveEmbed a16by9>
                                    <iframe src="https://react-bootstrap.github.io/"  />
                                </ResponsiveEmbed>
                            </div>
                        </Box.Body>
                    </Box>                        
                    <Box boxStyle='default'>
                        <Box.Header>
                            <Box.Title>URL埋め込み（表示ページがレスポンシブルでない場合）</Box.Title>
                            <Box.Tools>
                                <BoxColseButton/>
                            </Box.Tools>
                        </Box.Header >
                        <Box.Body>
                            <ResponsiveEmbed a4by3>
                                <iframe src="https://www.color-sample.com/"  />
                            </ResponsiveEmbed>
                        </Box.Body>
                    </Box> */}
                </Content.Body>
            </Content>
        );
    }    
}

// Which props do we want to inject, given the global state?
// Note: use https://github.com/faassen/reselect for better performance.
const mapStateToProps = (state) => {
    return {
        sample: state.sample,
        count: state.count
    };
};

//画面更新のアクションを設定します。
const mapDispatchToProps = (dispatch) => {
    return {
        addMessage: (data) => dispatch(addMessage(data)),
        loadMessage: (data) => dispatch(loadMessage(data)),
        addCount: () => dispatch(addCount())
    };
};

// Wrap the component to inject dispatch and state into it
export default connect(mapStateToProps, mapDispatchToProps)(SamplePanel);

 