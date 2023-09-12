using garmit.Core;
using garmit.DomainObject;
using garmit.Service.ControlSchedule;
using garmit.Web.Accessor;
using garmit.Web.Filter;
using garmit.Web.Models;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;

namespace garmit.Web.Controllers
{
    /// <summary>
    /// 制御スケジュールAPIコントローラー
    /// </summary>
    [SessionExpireApiFilter]
    [RoutePrefix("api/controlSchedule")]
    public class ControlScheduleApiController : ApiController
    {
        /// <summary>
        /// 制御スケジュールサービス
        /// </summary>
        public IControlScheduleService ControlScheduleService { get; set; }

        /// <summary>
        /// コンストラクタ
        /// </summary>
        public ControlScheduleApiController()
        {
            ControlScheduleService = ServiceManager.GetService<IControlScheduleService>("ControlScheduleService");
        }

        /// <summary>
        /// スケジュール一覧（表示）を取得
        /// </summary>
        /// <returns></returns>
        [Route("")]
        public IEnumerable<ControlSchedulePlan> GetControlSchedulePlans()
        {
            ControlScheduleInfo info = new ControlScheduleInfo();
            Session session = SessionAccessor.GetSession();
            try
            {
                info = ControlScheduleService.GetControlSchedulePlanList(session);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
                return null; ;
            }
            return info.ControlSchedulePlans;
        }

        /// <summary>
        /// 制御スケジュールを取得する
        /// </summary>
        /// <param name="id">Idクリアパラメータ</param>
        /// <returns></returns>
        [Route("getSchedule")]
        public ControlSchedule PostGetControlSchedule(IdIntegerQueryParameter param)
        {
            ControlScheduleInfo info = new ControlScheduleInfo();
            Session session = SessionAccessor.GetSession();
            try
            {
                info = ControlScheduleService.GetControlSchedule(session, param.Id);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
                return null; ;
            }
            return info.ControlSchedule;
        }

        /// <summary>
        /// LookUpを取得する
        /// </summary>
        /// <returns></returns>
        [Route("lookUp")]
        public LookUp GetLookUp()
        {
            ControlScheduleInfo info = new ControlScheduleInfo();
            Session session = SessionAccessor.GetSession();
            try
            {
                info = ControlScheduleService.GetLookUp(session);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
                return null; ;
            }
            return info.LookUp;
        }

        /// <summary>
        /// 制御スケジュールを保存する
        /// </summary>
        /// <returns></returns>
        [Route("save")]
        public RequestResult SetControlSchedule(ControlSchedule schedule)
        {
            ControlScheduleInfo info = new ControlScheduleInfo();
            Session session = SessionAccessor.GetSession();
            try
            {
                info = ControlScheduleService.SetControlSchedule(session, schedule);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
                return GetErrorRequestResult(session.CultureInfo, true);
            }
            return info.RequestResult;
        }

        /// <summary>
        /// 制御スケジュールを削除する
        /// </summary>
        /// <returns></returns>
        [Route("delete")]
        public RequestResult PostDeleteControlSchedules(IdIntegerQueryParameter param)
        {
            ControlScheduleInfo info = new ControlScheduleInfo();
            Session session = SessionAccessor.GetSession();
            try
            {
                info = ControlScheduleService.DeleteControlSchedules(session, param.Ids);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
                return GetErrorRequestResult(session.CultureInfo, false);
            }
            return info.RequestResult;
        }
        
        /// <summary>
        /// 実行中かどうか
        /// </summary>
        /// <param name="schedule">スケジュール情報</param>
        /// <returns></returns>
        [Route("isRunning")]
        public RequestResult IsRunningControlSchedule(ControlSchedule schedule)
        {
            ControlScheduleInfo info = new ControlScheduleInfo();
            Session session = SessionAccessor.GetSession();
            try
            {
                info = ControlScheduleService.IsRunningControlSchedule(session, schedule);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
                return null;
            }
            return info.RequestResult;            
        }

        /// <summary>
        /// エラーリクエスト結果を取得する
        /// </summary>
        /// <param name="cultureInfo">カルチャ情報</param>
        /// <param name="isRegister">データ登録かどうか</param>
        /// <returns>リクエスト結果</returns>
        private RequestResult GetErrorRequestResult(CultureInfo cultureInfo, bool isRegister)
        {
            string messageId = messageId = isRegister ? "ControlSchedule_RegisterError" : "ControlSchedule_DeleteError";

            return new RequestResult
            {
                IsSuccess = false,
                Message = MessageUtil.GetMessage(messageId, cultureInfo)
            };
        }
        
    }
}
