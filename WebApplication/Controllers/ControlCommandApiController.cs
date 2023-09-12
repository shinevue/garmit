using garmit.Core;
using garmit.DomainObject;
using garmit.Service.ControlCommand;
using garmit.Web.Accessor;
using garmit.Web.Filter;
using garmit.Web.Models;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Web.Http;
using static garmit.DomainObject.Enumeration;

namespace garmit.Web.Controllers
{
    /// <summary>
    /// 制御コマンドサービス用のAPIコントローラ
    /// </summary>
    [SessionExpireApiFilter]
    [RoutePrefix("api/controlCommand")]
    public class ControlCommandApiController : ApiController
    {
        /// <summary>
        /// 制御コマンドサービス
        /// </summary>
        public IControlCommandService ControlCommandService { get; set; }

        public ControlCommandApiController()
        {
            ControlCommandService = ServiceManager.GetService<IControlCommandService>("ControlCommandService");
        }

        /// <summary>
        /// 制御画面のLookUp取得
        /// </summary>
        /// <returns>ControlInfo.LookUp</returns>
        [Route("lookUp")]
        public LookUp GetLookUp()
        {
            ControlInfo info = new ControlInfo();
            Session session = SessionAccessor.GetSession();
            try
            {
                info = ControlCommandService.GetLookUp(session);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
                return null;
            }

            return info.LookUp;
        }
        
        #region 制御コマンド

        /// <summary>
        /// 制御コマンド検索
        /// </summary>
        /// <param name="lookUp">検索条件</param>
        /// <returns></returns>
        [Route("commandResult")]
        public SearchResult PostGetControlCommandList(LookUp lookUp)
        {
            ControlInfo info = new ControlInfo();
            Session session = SessionAccessor.GetSession();
            try
            {
                info = ControlCommandService.GetControlCommandList(session, lookUp);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
                return null;
            }

            return info.ControlResult;
        }

        /// <summary>
        /// 制御コマンド情報取得（単体）
        /// </summary>
        /// <param name="param">制御ID</param>
        /// <returns></returns>
        [Route("controlCommand")]
        public IEnumerable<ControlCommand> PostGetControlCommand(ControlCommandQueryParameter param)
        {
            ControlInfo info = new ControlInfo();
            Session session = SessionAccessor.GetSession();
            try
            {
                info = ControlCommandService.GetControlCommand(session, param.ControlId);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
                return null;
            }

            return info.ControlCommands;

        }

        /// <summary>
        /// 制御コマンド情報取得（複数）
        /// </summary>
        /// <param name="param">制御IDリスト</param>
        /// <returns></returns>
        [Route("controlCommands")]
        public IEnumerable<ControlCommand> PostGetControlCommands(ControlCommandQueryParameter param)
        {
            ControlInfo info = new ControlInfo();
            Session session = SessionAccessor.GetSession();
            try
            {
                info = ControlCommandService.GetControlCommands(session, param.ControlIds);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
                return null;
            }

            return info.ControlCommands;
        }
                
        /// <summary>
        /// 制御コマンドを保存する（単体）
        /// </summary>
        /// <param name="command">保存する制御コマンド情報</param>
        /// <returns></returns>
        [Route("saveControlCommand")]
        public RequestResult SetControlCommand(ControlCommand command)
        {
            ControlInfo info = new ControlInfo();
            Session session = SessionAccessor.GetSession();
            try
            {
                info = ControlCommandService.SetControlCommand(session, command);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
                info.RequestResult = GetErrorRequestResult(session.CultureInfo, true, true);
            }

            return info.RequestResult;
        }

        /// <summary>
        /// 制御コマンドを保存する（複数）
        /// </summary>
        /// <param name="commands">保存する制御コマンド情報</param>
        /// <returns></returns>
        [Route("saveControlCommands")]
        public RequestResult SetControlCommands(IEnumerable<ControlCommand> commands)
        {
            ControlInfo info = new ControlInfo();
            Session session = SessionAccessor.GetSession();
            try
            {
                info = ControlCommandService.SetControlCommands(session, commands);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
                info.RequestResult = GetErrorRequestResult(session.CultureInfo, true, true);
            }

            return info.RequestResult;
        }

        /// <summary>
        /// 制御コマンドの削除
        /// </summary>
        /// <param name="param">制御IDリスト</param>
        /// <returns></returns>
        [Route("deleteCommands")]
        public RequestResult PostDeleteControlCommands(ControlCommandQueryParameter param)
        {
            ControlInfo info = new ControlInfo();
            Session session = SessionAccessor.GetSession();
            try
            {
                info = ControlCommandService.DeleteControlCommands(session, param.ControlIds);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
                info.RequestResult = GetErrorRequestResult(session.CultureInfo, false, true);
            }

            return info.RequestResult;
        }

        /// <summary>
        /// 制御コマンドの実行
        /// </summary>
        /// <param name="param">制御コマンドID</param>
        /// <returns></returns>
        [Route("executeCommand")]
        public RequestResult ExecuteCommand(ControlCommandQueryParameter param)
        {
            ControlInfo info = new ControlInfo();
            Session session = SessionAccessor.GetSession();
            try
            {
                info = ControlCommandService.ExecuteCommand(session, param.ControlId);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
                return null;
            }

            return info.RequestResult;
        }

        /// <summary>
        /// 制御コマンドの停止
        /// </summary>
        /// <param name="param">制御コマンドID</param>
        /// <returns></returns>
        [Route("stopCommand")]
        public RequestResult StopCommand(ControlCommandQueryParameter param)
        {
            ControlInfo info = new ControlInfo();
            Session session = SessionAccessor.GetSession();
            try
            {
                info = ControlCommandService.StopCommand(session, param.ControlId);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
                return null;
            }

            return info.RequestResult;
        }
        
        #endregion

        #region トリガー制御


        /// <summary>
        /// トリガー制御検索
        /// </summary>
        /// <param name="lookUp">検索条件</param>
        /// <returns></returns>
        [Route("triggerResult")]
        public SearchResult PostGetTriggerControlList(LookUp lookUp)
        {
            ControlInfo info = new ControlInfo();
            Session session = SessionAccessor.GetSession();
            try
            {
                info = ControlCommandService.GetTriggerControlList(session, lookUp);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
                return null;
            }
            
            return info.ControlResult;
        }

        /// <summary>
        /// トリガー制御情報取得（単体）
        /// </summary>
        /// <param name="param">制御ID</param>
        /// <returns></returns>
        [Route("triggerControl")]
        public ControlInfo PostGetTriggerControl(ControlCommandQueryParameter param)
        {
            ControlInfo info = new ControlInfo();
            Session session = SessionAccessor.GetSession();
            try
            {
                info = ControlCommandService.GetTriggerControl(session, param.ControlId);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
                return null;
            }

            return info;

        }

        /// <summary>
        /// トリガー制御情報取得（複数）
        /// </summary>
        /// <param name="param">制御IDリスト</param>
        /// <returns></returns>
        [Route("triggerControls")]
        public ControlInfo PostGetTriggerControls(ControlCommandQueryParameter param)
        {
            ControlInfo info = new ControlInfo();
            Session session = SessionAccessor.GetSession();
            try
            {
                info = ControlCommandService.GetTriggerControls(session, param.ControlIds);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
                return null;
            }

            return info;
        }


        /// <summary>
        /// 制御コマンドを保存する（単体）
        /// </summary>
        /// <param name="command">保存する制御コマンド情報</param>
        /// <returns></returns>
        [Route("saveTriggerControl")]
        public RequestResult SetTriggerControl(ControlInfo target)
        {
            ControlInfo info = new ControlInfo();
            Session session = SessionAccessor.GetSession();
            try
            {
                TriggerControl triggerControl = target.TriggerControls?.FirstOrDefault();
                info = ControlCommandService.SetTriggerControl(session, triggerControl, target.TriggerControlOperation);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
                info.RequestResult = GetErrorRequestResult(session.CultureInfo, true, false);
            }

            return info.RequestResult;
        }

        /// <summary>
        /// 制御コマンドを保存する（複数）
        /// </summary>
        /// <param name="commands">保存する制御コマンド情報</param>
        /// <returns></returns>
        [Route("saveTriggerControls")]
        public RequestResult SetTriggerControls(IEnumerable<TriggerControl> targets)
        {
            ControlInfo info = new ControlInfo();
            Session session = SessionAccessor.GetSession();
            try
            {
                info = ControlCommandService.SetTriggerControls(session, targets);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
                info.RequestResult = GetErrorRequestResult(session.CultureInfo, true, false);
            }

            return info.RequestResult;
        }
        /// <summary>
        /// トリガー制御の削除
        /// </summary>
        /// <param name="param">制御IDリスト</param>
        /// <returns></returns>
        [Route("deleteTriggerControls")]
        public RequestResult PostDeleteTriggerControls(ControlCommandQueryParameter param)
        {
            ControlInfo info = new ControlInfo();
            Session session = SessionAccessor.GetSession();
            try
            {
                info = ControlCommandService.DeleteTriggerControls(session, param.ControlIds);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
                info.RequestResult = GetErrorRequestResult(session.CultureInfo, false, false);
            }

            return info.RequestResult;
        }


        #endregion

        #region 制御コマンド取得

        /// <summary>
        /// 指定のロケーションの制御コマンド情報を取得 ※トリガー制御編集時に使用
        /// </summary>
        /// <param name="param">ロケーション一覧</param>
        /// <returns></returns>
        [Route("locationCommands")]
        public IEnumerable<ControlCommand> PostGetLocationControlCommands(ControlCommandQueryParameter param)
        {
            ControlInfo info = new ControlInfo();
            Session session = SessionAccessor.GetSession();
            try
            {
                TriggerId_e triggerId = param.TriggerId??TriggerId_e.AlarmPowerNon;
                IEnumerable<PulseSet_e> excludedPulseSets = CheckAlarmPower(triggerId) ? new List<PulseSet_e> { PulseSet_e.Keep } : new List<PulseSet_e> { PulseSet_e.Demand30 };
                info = ControlCommandService.GetControlCommands(session, param.LocationIds, excludedPulseSets);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
                return null;
            }

            return info.ControlCommands;
        }
        
        /// <summary>
        /// 指定の所属の制御コマンド情報を取得 ※制御スケジュール編集時に使用
        /// </summary>
        /// <param name="param"></param>
        /// <returns></returns>
        [Route("enterpriseCommands")]
        public IEnumerable<ControlCommand> PostGetControlCommadsByEntrpriseId(ControlCommandQueryParameter param)
        {
            ControlInfo info = new ControlInfo();
            Session session = SessionAccessor.GetSession();
            try
            {
                info = ControlCommandService.GetControlCommandsByEnterpriseIds(session, param.EnterpriseIds);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
                return null;
            }

            return info.ControlCommands;
        }

        #endregion

        #region private

        /// <summary>
        /// トリガーがデマンドかどうか
        /// </summary>
        /// <param name="triggerId">トリガー種別ID</param>
        /// <returns></returns>
        private bool CheckAlarmPower(TriggerId_e triggerId)
        {
            switch (triggerId)
            {
                case TriggerId_e.AlarmPowerNon:
                case TriggerId_e.AlarmPower1:
                case TriggerId_e.AlarmPower2:
                case TriggerId_e.AlarmPower3:
                case TriggerId_e.AlarmPower4:
                    return true;
                default:
                    return false;
            }
        }

        /// <summary>
        /// エラーリクエスト結果を取得する
        /// </summary>
        /// <param name="cultureInfo">カルチャ情報</param>
        /// <param name="isRegister">データ登録かどうか</param>
        /// <returns>リクエスト結果</returns>
        private RequestResult GetErrorRequestResult(CultureInfo cultureInfo, bool isRegister, bool isCommand)
        {
            string messageId = "";
            if (isCommand)
            {
                messageId = isRegister ? "ControlCommand_RegisterError" : "ControlCommand_DeleteError";
            } else
            {
                messageId = isRegister ? "TriggerControl_RegisterError" : "TriggerControl_DeleteError";
            }
            
            return new RequestResult
            {
                IsSuccess = false,
                Message = MessageUtil.GetMessage(messageId, cultureInfo)
            };
        }

        #endregion
        
    }
}
