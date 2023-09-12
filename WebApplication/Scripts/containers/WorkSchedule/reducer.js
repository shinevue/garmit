/**
 * @license Copyright 2017 DENSO
 * 
 * Reducerを定義する。
 * ReducerはActionを受信してStateを更新する
 * 
 */
'use strict';

import { combineReducers } from 'redux';
import { routerReducer, LOCATION_CHANGE } from 'react-router-redux';

import { SET_SCHEDULE } from './actions.js';
import { SET_SELECT, REMOVE_SELECT, CLEAR_SELECT, UPDATE_SELECT } from './actions.js';
import { SET_EDIT, CHANGE_SCHEDULE, CLEAR_EDIT } from './actions.js';
import { SET_ENTERPRISES, CHANGE_SELECT_ENTERPRISES } from './actions.js';

import isLoading from 'LoadState/reducer';
import modalState from 'ModalState/reducer';
import waitingInfo from 'WaitState/reducer';
import authentication from 'Authentication/reducer';

import { closeModalInfo, showErrorModalInfo } from 'messageModalUtility';
import { canSave, validateSchedule, validateName, validateMaintFormat, validateEndDate, validateEnterprises, validateMemo, getMatchSchedule, getEmptySchedule, SCHEDULE_DATETIME_FORMAT } from 'scheduleUtility';

/**
 * 登録スケジュール一覧のReducer
 */
function scheduleList(state=[], action) {
    switch( action.type ) {

        case SET_SCHEDULE:
            return action.data;

        default:
            return state;
    }
}

/**
 * 選択中スケジュール一覧のReducer
 */
function selectSchedules(state = [], action) {

    switch (action.type) {

        case SET_SELECT:
            let add = _.cloneDeep(state);
            add.push(action.data);
            const sorted=_.sortBy(add, ['startDate', 'endDate', 'name']); //日付でソート
            return sorted;

        case REMOVE_SELECT:
            let remove = _.cloneDeep(state);
            _.remove(remove, (sch) => {
                return sch.scheduleId === action.data.scheduleId;
            })
            return remove;

        case UPDATE_SELECT:
            let update = [];
            state.forEach((sch) => {
                const match = getMatchSchedule(action.data.scheduleList, sch.scheduleId);
                if (match) {
                    update.push(match);
                }
            })
            return update;

        case CLEAR_SELECT:
            return [];

        default:
            return state;
    }
}

/**
 * 編集中スケジュール一覧のReducer
 */
function editing(state = { original: null, edit: null }, action) {

    switch (action.type) {

        case SET_EDIT:
            if (action.data.mode === "edit") {
                let set = action.data.value;
                set.startDate = set.startDate && moment(set.startDate).format(SCHEDULE_DATETIME_FORMAT); //日付を表す文字列をフォーマット変換
                set.endDate = set.endDate && moment(set.endDate).format(SCHEDULE_DATETIME_FORMAT);
                return { original: action.data.value, edit: validateSchedule(set) };
            }
            else if (action.data.mode === "add") {
                //空のイベント情報を編集情報にコピーして入力チェック
                const emptySchedule = getEmptySchedule(application.systemId, _.get(action.data, "startDate"));
                return { original: null, edit: validateSchedule(emptySchedule) };
            }
            return state;

        case CHANGE_SCHEDULE:
            const changed = {
                original: state.original,
                edit: getChanged(state.edit, action.data.key, action.data.value)
            };
            return changed;

        case CLEAR_EDIT:
            return { original:null, edit:null };

        default:
            return state;
    }
}

/**
 * 変更後のスケジュール情報取得
 */
function getChanged(before, key, value) {
    const update = _.cloneDeep(before);
    //各値を変更する
    switch (key) {
        case "dateTime":
            _.assign(update,
                { startDate: value.startDate },
                { endDate: value.endDate },
                { startValidation: validateMaintFormat(value.startDate) },
                { endValidation: validateEndDate(value.startDate, value.endDate) }
            );
            break;
        case "name":
            _.set(update, key, value);
            _.set(update, 'nameValidation', validateName(value));
            break;
        case "memo":
            _.set(update, key, value);
            _.set(update, 'memoValidation', validateMemo(value));
            break;
        case "backColor":
        case "textColor":
        case "points":
            _.set(update, key, value);
            break;
        case "enterprises":
            _.set(update, key, value);
            _.set(update, 'enterpriseValidation', validateEnterprises(value));
            break;
        case "isAlarm":
            break;
        default: break;
    }

    update.canSave = canSave(update);   //保存できるかどうか
    return update;
}

/**
 * userInfoのreducer
 */
function userInfo(state = [], action) {

    switch (action.type) {

        case SET_ENTERPRISES:
            return action.data;

        default:
            return state;
    }
}

//Sabdboxで使用するReducerを列挙
const rootReducers = combineReducers({
    scheduleList,
    selectSchedules,
    editing,
    modalState,
    userInfo,
    isLoading,
    waitingInfo,
    routing: routerReducer,
    authentication
});

export default rootReducers;

