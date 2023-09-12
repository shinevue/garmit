/**
 * Copyright 2017 DENSO Solutions
 * 
 * 検索条件ボックス Reactコンポーネント
 *  
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Grid, Row, Col, ButtonToolbar, OverlayTrigger, Tooltip } from 'react-bootstrap';

import Box from 'Common/Layout/Box';
import Button from 'Common/Widget/Button';
import Icon from 'Common/Widget/Icon';
import CheckboxSwitch from 'Common/Widget/CheckboxSwitch';

import { SearchButton,  ClearSearchCondButton, SearchHotKeyButton, ClearSearchCondHotKeyButton } from 'Assets/GarmitButton';
import SearchConditionForm from 'Assets/Condition/SearchConditionForm'
import SearchConditionRegisterModal from 'Assets/Modal/SearchConditionRegisterModal';
import SearchConditionSelectModal from 'Assets/Modal/SearchConditionSelectModal';

import { createInitSearchCondition, removeExtraInformation, hasConditions, getHashTagsAndError } from 'searchConditionUtility';

export default class SearchConditionBox extends Component {

    /**
     * @constructor
     */
    constructor(props) {
        super(props)
        this.state = {
            searchCondition: props.searchCondition || createInitSearchCondition(props.targets),
            showConditionRegisterModal: false,
            showConditionSelectModal: false,
            isSaveCondition: false
        }
    }
    
    /**
     * 新しいpropsを受け取るときに呼び出されます。
     * propsによってstateを変更する場合はここでthis.setState()を行います。このsetStateでrenderを呼ぶことはありません。
     * @param {*} nextProps 新しいprops
     */
    componentWillReceiveProps(nextProps) {
        if (JSON.stringify(nextProps.searchCondition) !== JSON.stringify(this.props.searchCondition)) {
            this.setState({
                searchCondition: nextProps.searchCondition || createInitSearchCondition(nextProps.targets)
            })
        }
    }

    /**
     * 利用可能な検索対象を取得
     */
    getAvailableTargets() {
        return this.props.targets.filter((target) => {            
            if (target === 'egroups') {
                return this.props.lookUp && this.props.lookUp.egroups && this.props.lookUp.egroups.length > 0;
            }
            return true;
        });
    }

    /**
     * 検索条件が変更されたとき
     * @param {any} searchCondition
     */
    onChange(searchCondition) {
        this.setState({ searchCondition: searchCondition });

        if (this.props.onChange) {
            this.props.onChange(searchCondition);
        }
    }

    /**
     * 検索対象の選択変更イベント
     *
     * @param {any} target - 選択した選択肢のkey
     * @param {any} index - 対象の<SearchConditionForm />のindex
     * @returns
     */
    onChangeTarget(target, index) {
        let searchCondition = Object.assign({}, this.state.searchCondition);
        let targets = searchCondition.targets.slice();
        if (this.getIsKeepTextCondition() && this.isTextCondition(target)) {
            searchCondition = this.copyBeforeTextCondition(searchCondition, target, targets[index]);
        }
        searchCondition = this.clearValue(searchCondition, targets[index]);
        targets[index] = target;    // 変更後のtargetをセット
        searchCondition.targets = targets;
        this.onChange(searchCondition);
    }

    /**
     * 検索ボタンクリックイベント
     */
    handleSearchClick() {
        if (this.props.useSaveConditions && this.state.isSaveCondition && hasConditions(this.state.searchCondition)) {
            this.showConditionRegisterModal();
        } else {
            this.onSearchClick(false);
        }
    }

    /**
     * 検索ボタンのクリックイベント
     */
    onSearchClick(isSaveCondition = false) {
        if (this.props.onSearchClick) {
            const condition = removeExtraInformation(this.state.searchCondition);
            this.props.onSearchClick(condition, isSaveCondition);
        }
    }
    
    /**
     * 検索条件のフォームを追加する
     */
    addSearchCondition() {
        const searchCondition = Object.assign({}, this.state.searchCondition);
        const targets = searchCondition.targets.slice();
        targets.push(-1);
        searchCondition.targets = targets;

        this.onChange(searchCondition);
    }

    /**
     * 値をクリアしたsearchConditionを返す
     * @param {any} searchCondition
     * @param {any} key
     */
    clearValue(searchCondition, key) {
        const newSearchCondition = Object.assign({}, searchCondition);
        newSearchCondition[key] = [];

        // 他にクリアしたい値を記述
        if (this.isTextCondition(key)) {     
            if (key === 'hashTags') {
                newSearchCondition.hashTagString = ''
                newSearchCondition.hashTagError = false;
            } else {
                const plainTextKey = key.replace(/s?$/, 'Text');
                newSearchCondition[plainTextKey] = '';
            }
        } else if (key === 'allowLocations') {
            newSearchCondition.locations = [];
        }

        return newSearchCondition;
    }

    /**
     * 検索条件のフォームを削除する
     *
     * @param {any} index - 対象の<SearchConditionForm />のindex
     */
    removeSearchCondition(index) {
        let searchCondition = Object.assign({}, this.state.searchCondition);
        let targets = searchCondition.targets.slice();
        searchCondition = this.clearValue(searchCondition, targets[index]);
        targets.splice(index, 1);
        if (targets.length === 0) targets.push(-1);
        searchCondition.targets = targets;

        this.onChange(searchCondition);
    }

    /**
     * 検索条件をクリアする
     */
    clearSearchCondition() {
        const condition = createInitSearchCondition(this.props.targets);
        this.onChange(condition);
        if (this.props.onClear) {
            this.props.onClear(condition);
        }
    }

    /**
     * フォームの値が変化したとき
     * @param {any} keyValue
     */
    valueChanged(keyValue) {
        let newCondition = Object.assign({}, this.state.searchCondition);

        if (Array.isArray(keyValue)) {
            keyValue.forEach((item) => {
                newCondition[item.key] = item.value;
            });
        } else {
            if (keyValue.key === 'allowLocations') {
                newCondition.locations = keyValue.value;
            } else {
                newCondition[keyValue.key] = keyValue.value;
            }
        }
        
        this.onChange(newCondition);
    }

    /**
     * 選択不可の検索対象リストを返す
     *
     * @param {any} index - 対象の<SearchConditionForm />のindex
     * @returns
     */
    getInvalidTargets(index) {

        const { searchCondition } = this.state;

        const invalidTargets = searchCondition.targets.filter((target, i) => {
            return (target !== -1 && i !== index)
        });

        return invalidTargets;
    }

    /**
     * レポート出力ボタンのクリックイベント
     */
    onReportClick() {
        if (this.props.onReportClick) {
            const condition = removeExtraInformation(this.state.searchCondition);
            this.props.onReportClick(condition);
        }
    }

    /**
     * 親コンポーネントへのコールバックの際に検索条件を引き渡すための関数
     */
    doCallBackWithCondition(callback) {
        if (typeof callback === 'function') {
            const condition = removeExtraInformation(this.state.searchCondition);
            callback(condition);
        }
    }

    //#region 検索条件保存関連

    /**
     * 「検索条件を保存する」スイッチのチェック変更
     * @param {boolean} checked チェック状態
     */
    changeSaveConditionChecked(checked) {
        this.setState({ isSaveCondition: checked })
    }

    /**
     * 検索条件選択モーダルから検索条件を変更する
     * @param {*} condition 
     */
     hanldeChangeSearchCondition(condition) {
        this.onChange(condition);
        this.hideConditionSelectModal();
    }

    /**
     * 検索条件完了
     */
    handleSavedSearchCondition() {
        this.onSearchClick(true)
        this.hideConditionRegisterModal();
    }

    /**
     * 検索条件選択モーダルを表示する
     */
    showConditionSelectModal() {
        this.setState({ showConditionSelectModal: true });
    }

    /**
     * 検索条件選択モーダルを閉じる
     */
    hideConditionSelectModal() {
        this.setState({ showConditionSelectModal: false });
    }

    /**
     * 検索条件保存モーダルを表示する
     */
    showConditionRegisterModal() {
        this.setState({ showConditionRegisterModal: true });
    }

    /**
     * 検索条件保存モーダルを閉じる
     */
    hideConditionRegisterModal() {
        this.setState({ showConditionRegisterModal: false });
    }

    //#endregion

    //#region テキスト検索条件保持関連

    /**
     * 変更前のテキスト条件をコピーしたsearchConditionを返す
     * @param {any} searchCondition 検索条件
     * @param {any} key コピー対象のキー
     * @param {any} beforeKey 変更前のキー
     */
     copyBeforeTextCondition(searchCondition, key, beforeKey) {
        var textCondition = {
            conditions: [],
            text: '',
            hashTagError: false
        };

        textCondition = this.getBeforeTextCondition(searchCondition, beforeKey);
        if (key === 'hashTags') {
            const hashTagInfo = getHashTagsAndError(textCondition.text);
            textCondition.conditions = hashTagInfo.hashTags;
            textCondition.hashTagError = hashTagInfo.hasError;
        }

        const newSearchCondition = Object.assign({}, searchCondition);
        newSearchCondition[key] = textCondition.conditions;

        // 他にクリアしたい値を記述
        if (this.isTextCondition(key)) {            
            if (key === 'hashTags') {
                newSearchCondition.hashTagString = textCondition.text
                newSearchCondition.hashTagError = textCondition.hashTagError;
            } else {
                const plainTextKey = key.replace(/s?$/, 'Text');
                newSearchCondition[plainTextKey] = textCondition.text
            }
        }

        return newSearchCondition;
    }

    /**
     * 変更前の検索条件を取得する
     * @param {object} searchCondition 検索条件
     * @param {string} beforeKey 元のキー
     */
     getBeforeTextCondition(searchCondition, beforeKey) {
        var text = '';
        var conditions = searchCondition[beforeKey] && searchCondition[beforeKey].length > 0 ? _.cloneDeep(searchCondition[beforeKey]) : [];        

        if (this.isTextCondition(beforeKey)) {
            if (beforeKey === 'hashTags') {
                text = searchCondition.hashTagString;
            } else {
                const plainTextKey = beforeKey.replace(/s?$/, 'Text');
                text = searchCondition[plainTextKey];
            }
        } else {
            conditions = [];
        }

        return {
            conditions,
            text
        }
    }

    /**
     * 文字列条件かどうか
     * @param {string} key キー
     * @returns 
     */
    isTextCondition(key) {
        const textConditionKeys = [ 'hashTags', 'templateMemo', 'templateName', 'projectNos', 'lineNames', 'lineIds', 'userNames', 'memos', 'patchboardNames', 'cardIds', 'cardNames', 'enterpriseNames', 'userKanas' ];
        return textConditionKeys.includes(key);
    }

    /**
     * 元のテキストを保持するかどうかのフラグを取得する
     */
    getIsKeepTextCondition() {
        if (application.appSettings && application.appSettings.keepTextCondition) {
            
            return JSON.parse(application.appSettings.keepTextCondition.toLowerCase());
        }
        return false;
    }
 
    //#endregion

    /**
     * render
     */
    render() {
        const { targets, children, topConditions, lookUp, isLoading, defaultClose, searchButtonDisabled, exportMode, visibleReportButton, useHotKeys } = this.props;
        const { hiddenSearchButton, isReadOnly, errorMessage } = this.props;
        const { visibleEmbeddedReportButton, onEmbeddedReportOutputButtonClick, onEmbeddedReportFormatButtonClick } = this.props;
        const { useSaveConditions, conditionList, functionId } = this.props;
        const { icCardType } = this.props;
        const { searchCondition } = this.state;
        const { showConditionRegisterModal, showConditionSelectModal, isSaveCondition } = this.state;

        const availableTargets = this.getAvailableTargets();
        
        const callConditionButtonDisabled = !(conditionList && conditionList.length > 0);

        return (
            <Box boxStyle='default' isSearch isLoading={isLoading} isCollapsible={true} defaultClose={defaultClose} >
                <Box.Header>
                    <Box.Title>検索条件</Box.Title>
                </Box.Header >
                <Box.Body>
                    {topConditions}
                    <Grid fluid className="mb-1">
                        {(targets && targets.length > 0) && searchCondition.targets.map((target, i) =>
                            <SearchConditionForm
                                targets={availableTargets}
                                invalidTargets={this.getInvalidTargets(i)}
                                selected={target}
                                onSelectChange={(select) => this.onChangeTarget(select, i)}
                                onRemoveClick={() => this.removeSearchCondition(i)}
                                onValueChange={(val, key) => this.valueChanged(val, key)}
                                lookUp={lookUp}
                                searchCondition={searchCondition}
                                isReadOnly={isReadOnly}
                                icCardType={icCardType}
                            />
                        )}
                        {errorMessage&&<div className="text-error mt-05 mb-1">{errorMessage}</div>}
                        {(searchCondition.targets.length < availableTargets.length) &&
                            <Row className="mb-1">
                                <Col md={12}>
                                    <OverlayTrigger placement="bottom" overlay={<Tooltip>追加</Tooltip>}>
                                        <Button
                                            iconId="add"
                                            isCircle={true}
                                            onClick={() => this.addSearchCondition()}
                                            disabled={isReadOnly}
                                        />
                                    </OverlayTrigger>
                                </Col>
                            </Row>
                        }
                    </Grid>
                    {children}
                    {useSaveConditions && 
                        <SearchConditionRegisterModal
                            showModal={showConditionRegisterModal}
                            functionId={functionId}
                            conditionList={conditionList}
                            searchCondition={searchCondition}
                            onSaved={() => this.handleSavedSearchCondition()}
                            onHide={() => this.setState({ showConditionRegisterModal: false })}
                        />
                    }
                    {useSaveConditions &&
                        <SearchConditionSelectModal
                            showModal={showConditionSelectModal}
                            conditionList={conditionList}
                            targets={targets}
                            lookUp={lookUp}
                            onSubmit={(condition) => this.hanldeChangeSearchCondition(condition)}
                            onCancel={() => this.hideConditionSelectModal()}
                        />
                    }
                </Box.Body>
                <Box.Footer>
                    {visibleEmbeddedReportButton &&
                        <ButtonToolbar className="pull-left ml-1">
                            <Button
                                iconId="report-output"
                                disabled={searchButtonDisabled || searchCondition.hashTagError || isReadOnly}
                                onClick={() => { this.doCallBackWithCondition(onEmbeddedReportOutputButtonClick); }}
                            >
                                <span>帳票出力</span>
                            </Button>

                            <Button
                                iconId="edit"
                                disabled={isReadOnly}
                                onClick={() => { onEmbeddedReportFormatButtonClick(); }}
                            >
                                <span>帳票フォーマット</span>
                            </Button>
                        </ButtonToolbar>
                    }
                    {useSaveConditions && 
                        <div className="pull-left pa-l-15">
                            <CheckboxSwitch text="検索条件を保存する" 
                                bsSize="sm"
                                checked={isSaveCondition} 
                                onChange={(checked) => this.changeSaveConditionChecked(checked)} 
                            />
                        </div>
                    }
                    <ButtonToolbar className="pull-right">
                        {useSaveConditions && 
                            <Button
                                bsStyle="primary"
                                onClick={() => this.showConditionSelectModal()}
                                disabled={callConditionButtonDisabled || isReadOnly}
                            >
                                <Icon className="fal fa-search mr-05" />
                                <span>検索条件呼び出し</span>
                            </Button>
                        }
                        {useHotKeys ?
                            <ClearSearchCondHotKeyButton
                                onClick={() => this.clearSearchCondition()}
                                disabled={isReadOnly}
                            />
                            :
                            <ClearSearchCondButton
                                onClick={() => this.clearSearchCondition()}
                                disabled={isReadOnly}
                            />
                        }
                        {exportMode ?
                            <Button
                                iconId="report-output"
                                onClick={() => this.handleSearchClick()}
                                disabled={searchButtonDisabled || searchCondition.hashTagError || isReadOnly}
                            >
                                <span>エクスポート</span>
                            </Button>
                            :
                            (!hiddenSearchButton && (useHotKeys ?
                                <SearchHotKeyButton
                                    onClick={() => this.handleSearchClick()}
                                    disabled={searchButtonDisabled || searchCondition.hashTagError || isReadOnly}
                                />
                                :
                                <SearchButton
                                    onClick={() => this.handleSearchClick()}
                                    disabled={searchButtonDisabled || searchCondition.hashTagError || isReadOnly}
                                />
                            ))
                        }
                        {visibleReportButton&&
                            <Button
                                iconId="report-output"
                                onClick={() => this.onReportClick()}
                                disabled={searchButtonDisabled || searchCondition.hashTagError || isReadOnly}
                            >
                                <span>レポート出力</span>
                            </Button>
                        }
                    </ButtonToolbar>
                </Box.Footer>
            </Box>
        )
    }
}

SearchConditionBox.propTypes = {
    targets: PropTypes.array.isRequired,
    onSearchClick: PropTypes.func,
    topConditions: PropTypes.element,   //検索条件の上部に表示する要素
    searchButtonDisabled: PropTypes.bool,
    onChange: PropTypes.func,
}

SearchConditionBox.defaultProps = {
    targets: []
}