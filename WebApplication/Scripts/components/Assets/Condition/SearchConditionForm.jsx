/**
 * Copyright 2017 DENSO Solutions
 * 
 * 検索条件設定フォーム Reactコンポーネント
 *  
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Row, Col, FormGroup, FormControl, OverlayTrigger, Tooltip } from 'react-bootstrap';

import Button from 'Common/Widget/Button';
import Icon from 'Common/Widget/Icon';

import TextForm from 'Common/Form/TextForm';

import EgroupForm from 'Assets/Condition/EgroupForm';
import EnterpriseForm from 'Assets/Condition/EnterpriseForm';
import FunctionForm from 'Assets/Condition/FunctionForm';
import HashTagForm from 'Assets/Condition/HashTagForm';
import LocationForm from 'Assets/Condition/LocationForm';
import OperationTypeForm from 'Assets/Condition/OperationTypeForm';
import TagForm from 'Assets/Condition/TagForm';
import UserForm from 'Assets/Condition/UserForm';
import TemplateTypeForm from 'Assets/Condition/TemplateTypeForm';
import ConsumerForm from 'Assets/Condition/ConsumerForm';
import TypeForm from 'Assets/Condition/TypeForm';
import PatchboardTypeForm from 'Assets/Condition/PatchboardTypeForm';
import PatchCableTypeForm from 'Assets/Condition/PatchCableTypeForm';
import PatchCableConnectForm from 'Assets/Condition/PatchCableConnectForm';
import CardIdForm from 'Assets/Form/CardIdForm';
import ICTerminalForm  from 'Assets/Form/ICTerminalForm';

import { SEARCH_CONDITION_TARGET_NAME_LIST, PROJECT_TYPE_LIST } from 'constant';

export default class SearchConditionForm extends Component {

    constructor(props) {
        super(props)
        this.state = {

        }
        this.onSelectChange = this.onSelectChange.bind(this)
    }

    /**
     * 検索対象のセレクトボックスが変化したときの処理
     *
     * @param {any} e - イベント
     * @param {any} props - props
     * @returns
     */
    onSelectChange(e) {
        this.props.onSelectChange(e.target.value)
    }

    /**
     * 検索対象のセレクトボックスのオプションをつくる
     *
     * @returns
     */
    makeOptions() {
        const { targets, invalidTargets } = this.props
        let options = [<option value={-1}>検索条件を選択してください</option>]
        targets.forEach((target, index) => {
            options.push(
                <option
                    key={index}
                    value={target}
                    disabled={(invalidTargets.indexOf(target) > -1)}
                >
                    {SEARCH_CONDITION_TARGET_NAME_LIST[target]}
                </option>
            )
        })
        return options
    }

    /**
     * 選択中の検索対象に応じたフォームをつくる
     *
     * @returns
     */
    makeForm() {
        const { selected, lookUp, searchCondition, isReadOnly, icCardType } = this.props
        let form = null;
        let plainTextKey = null;
        switch (selected) {
            case "locations":
            case "allowLocations":
                form = <LocationForm multiple search
                            locationList={lookUp && lookUp.locations}
                            checkedLocations={searchCondition && searchCondition.locations}
                            separateCheckMode={true}
                            onChange={(val) => this.props.onValueChange({ value: val, key: selected })} 
                            disabled={isReadOnly}
                        />
                break;
            case "enterprises":
                form = <EnterpriseForm multiple search
                            enterpriseList={lookUp && lookUp.enterprises}
                            checkedEnterprises={searchCondition && searchCondition.enterprises}
                            onChange={(val) => this.props.onValueChange({ value: val, key: selected })}
                            disabled={isReadOnly}
                        />
                break;
            case "functions":
                form = <FunctionForm search
                            functionList={lookUp && lookUp.functions}
                            checkedFunctions={searchCondition && searchCondition.functions}
                            onChange={(val) => this.props.onValueChange({ value: val, key: selected })}
                            disabled={isReadOnly}
                        />
                break;
            case "hashTags":
                form = <HashTagForm
                            value={searchCondition && searchCondition.hashTagString}
                            hasError={searchCondition && searchCondition.hashTagError}
                            onChange={(hashTags, string, hasError) => this.props.onValueChange([
                                { value: hashTags, key: selected },
                                { value: string, key: 'hashTagString' },
                                { value: hasError, key: 'hashTagError' }
                            ])}
                            disabled={isReadOnly}
                        />
                break;
            case "operationTypes":
                form = <OperationTypeForm search
                            checkedOperationTypes={searchCondition && searchCondition.operationTypes}
                            onChange={(val) => this.props.onValueChange({ value: val, key: selected })}
                            disabled={isReadOnly}
                        />
                break;
            case "tags":
                form = <TagForm search
                            tagList={lookUp && lookUp.tags}
                            checkedTags={searchCondition && searchCondition.tags}
                            onChange={(val) => this.props.onValueChange({ value: val, key: selected })}
                            disabled={isReadOnly}
                        />
                break;
            case "loginUsers":
                form = <UserForm search
                            loginUserList={lookUp && lookUp.loginUsers}
                            checkedLoginUsers={searchCondition && searchCondition.loginUsers}
                            onChange={(val) => this.props.onValueChange({ value: val, key: selected })}
                            disabled={isReadOnly}
                        />
                break;
            case "egroups":
                form = <EgroupForm multiple search
                            egroupList={lookUp && lookUp.egroups}
                            checkedEgroups={searchCondition && searchCondition.egroups}
                            onChange={(val) => this.props.onValueChange({ value: val, key: selected })}
                            disabled={isReadOnly}
                        />
                break;
            case "templateMemo":
                form = <TextForm 
                            value={searchCondition && searchCondition.templateMemoText} 
                            onChange={(val) => this.props.onValueChange([
                                { value: this.getStringArray(val), key: 'templateMemo' },
                                { value: val, key: 'templateMemoText' }
                            ])}
                            placeholder="テンプレートメモ"
                            isReadOnly={isReadOnly}
                        />
                break;
            case "templateName":
                form = <TextForm 
                            value={searchCondition && searchCondition.templateNameText} 
                            onChange={(val) => this.props.onValueChange([
                                { value: this.getStringArray(val), key: "templateName" },
                                { value: val, key: "templateNameText" }
                            ])}
                            placeholder="テンプレート名称"
                            isReadOnly={isReadOnly}
                        />
                break;

            case "consumers":
                form = <ConsumerForm search
                            consumerList={lookUp && lookUp.consumers}
                            checkedConsumers={searchCondition && searchCondition.consumers}
                            onChange={(val) => this.props.onValueChange({ value: val, key: selected })}
                            disabled={isReadOnly}
                        />
                break;

            case "patchboardNames":
                form = <TextForm 
                            value={searchCondition && searchCondition.patchboardNameText} 
                            onChange={(val) => this.props.onValueChange([
                                { value: this.getStringArray(val), key: 'patchboardNames' },
                                { value: val, key: 'patchboardNameText' }
                            ])}
                            placeholder="配線盤名称"
                            isReadOnly={isReadOnly}
                        />
                break;

            case "patchboardTypes":
                form = <PatchboardTypeForm search
                            patchboardTypeList={lookUp.patchboardTypes}
                            checkedPatchboardTypes={searchCondition && searchCondition.patchboardTypes}
                            onChange={(val) => this.props.onValueChange({ value: val, key: selected })}
                            disabled={isReadOnly}
                       />;
                break;

            case "patchCableTypes":
                form = <PatchCableTypeForm search
                            patchCableTypeList={lookUp.patchCableTypes}
                            checkedPatchCableTypes={searchCondition && searchCondition.patchCableTypes}
                            onChange={(val) => this.props.onValueChange({ value: val, key: selected })}
                            disabled={isReadOnly}
                        />;
                break;

            case "projectTypes": 
                form = <TypeForm 
                            title="工事種別選択"
                            modalSize="sm"
                            typeList={PROJECT_TYPE_LIST}
                            checkedTypes={searchCondition && searchCondition.projectTypes}
                            onChange={(val) => this.props.onValueChange({ value: val, key: selected })}
                            disabled={isReadOnly}
                        />
                break;

            case "projectNos":
                form = <TextForm 
                            value={searchCondition && searchCondition.projectNoText} 
                            onChange={(val) => this.props.onValueChange([
                                { value: this.getStringArray(val), key: 'projectNos' },
                                { value: val, key: 'projectNoText' }
                            ])}
                            placeholder="工事番号"
                            isReadOnly={isReadOnly}
                        />
                break;

            case "lineTypes":
                form = <TypeForm 
                            searchable
                            title="回線種別選択"
                            modalSize="sm"
                            typeList={lookUp && lookUp.lineTypes}
                            checkedTypes={searchCondition && searchCondition.lineTypes}
                            onChange={(val) => this.props.onValueChange({ value: val, key: selected })}
                            disabled={isReadOnly}
                        />
                break;     

            case "lineNames":
                form = <TextForm 
                            value={searchCondition && searchCondition.lineNameText} 
                            onChange={(val) => this.props.onValueChange([
                                { value: this.getStringArray(val), key: 'lineNames' },
                                { value: val, key: 'lineNameText' }
                            ])}
                            placeholder="回線名"
                            isReadOnly={isReadOnly}
                        />
                break;

            case "lineIds":
                form = <TextForm 
                            value={searchCondition && searchCondition.lineIdText} 
                            onChange={(val) => this.props.onValueChange([
                                { value: this.getStringArray(val), key: 'lineIds' },
                                { value: val, key: 'lineIdText' }
                            ])}
                            placeholder="回線ID"
                            isReadOnly={isReadOnly}
                        />
                break;

            case "idfConnects":
                form = <PatchCableConnectForm
                            isInPatchCable={false}
                            patchCables={lookUp && lookUp.idfConnects}
                            selectedPatchCableConnects={searchCondition && searchCondition.idfConnects}
                            onChange={(val) => this.props.onValueChange({ value: val, key: selected })}
                            disabled={isReadOnly}
                       />
                break;

            case "inConnects":
                form = <PatchCableConnectForm
                            isInPatchCable={true}
                            patchCables={lookUp && lookUp.inConnects}
                            selectedPatchCableConnects={searchCondition && searchCondition.inConnects}
                            onChange={(val) => this.props.onValueChange({ value: val, key: selected })}
                            disabled={isReadOnly}
                       />
                break;

            case "relConnects":
                form = <PatchCableConnectForm
                            isInPatchCable={false}
                            patchCables={lookUp && lookUp.idfConnects}
                            selectedPatchCableConnects={searchCondition && searchCondition.relConnects}
                            onChange={(val) => this.props.onValueChange({ value: val, key: selected })}
                            disabled={isReadOnly}
                       />
                break;

            case "cardIds":
                form = <CardIdForm
                            icCardType={icCardType}
                            value={searchCondition && searchCondition.cardIdText} 
                            onChange={(val) => this.props.onValueChange([
                                { value: this.getStringArray(val), key: 'cardIds' },
                                { value: val, key: 'cardIdText' }
                            ])}
                            placeholder="カードID"
                            disabled={isReadOnly}
                       />
                break;

            case "icTerminals":
                form = <ICTerminalForm search
                            icTerminalList={lookUp && lookUp.icTerminals}
                            checkedICTerminals={searchCondition && searchCondition.icTerminals}
                            onChange={(val) => this.props.onValueChange({ value: val, key: selected })}
                            disabled={isReadOnly}
                       />
                break;

            case "userNames":
            case "memos":
            case "cardNames":
            case "enterpriseNames":
            case "userKanas":
                // XXXXX または末尾が s で終わる複数形 XXXXXs から XXXXXText を生成する
                //（単数形への厳密な変換ではないです）
                plainTextKey = selected.replace(/s?$/, 'Text');
                form = <TextForm 
                            value={searchCondition && searchCondition[plainTextKey]} 
                            onChange={(val) => this.props.onValueChange([
                                { value: this.getStringArray(val), key: selected },
                                { value: val, key: plainTextKey }
                            ])}
                            placeholder={SEARCH_CONDITION_TARGET_NAME_LIST[selected]}
                            isReadOnly={isReadOnly}
                        />
                break;

            default:
                form = <TextForm isReadOnly={isReadOnly} />
                break;
        }
        return form;
    }

    /**
     * テキストを文字列の配列に分割する
     * @param {any} text
     */
    getStringArray(text) {
        const strings = text.split(/,|\s+/);   // 空白または「,」で文字列を分割する
        return strings.filter((str) => str !== '');  // 空の文字列を除く
    }

    /**
     * render
     */
    render() {
        const { selected, isReadOnly } = this.props
 
        return (
            <Row>
                <Col md={4}>
                    <FormGroup>
                        <FormControl componentClass="select" value={selected ? selected : -1} disabled={isReadOnly} onChange={(e) => this.onSelectChange(e)}>
                            {this.makeOptions()}
                        </FormControl>
                    </FormGroup>
                </Col>
                <Col md={7}>
                    {this.makeForm()}
                </Col>
                <Col md={1}>
                    <OverlayTrigger placement="bottom" overlay={<Tooltip>クリア</Tooltip>}>
                    <Button
                        disabled={isReadOnly}
                        bsStyle="lightgray"
                        isCircle={true}
                        onClick={() => this.props.onRemoveClick()}
                    >
                        <Icon className="fal fa-eraser" />
                    </Button>
                    </OverlayTrigger>
                </Col>
            </Row>
        )
    }
}

SearchConditionForm.propTypes = {
    targets: PropTypes.array,
    invalidTargets: PropTypes.array,
    selected: PropTypes.string,
    onSelectChange: PropTypes.func,
    onRemoveClick: PropTypes.func,
}