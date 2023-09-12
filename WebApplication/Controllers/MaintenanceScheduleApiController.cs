using garmit.Core;
using garmit.DomainObject;
using garmit.Service.MaintenanceSchedule;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Web.Http;
using garmit.Web.Accessor;
using garmit.Web.Models;
using System.Globalization;

namespace garmit.Web.Controllers
{
    /// <summary>
    /// メンテナンススケジュールのAPIコントローラ
    /// </summary>
    [RoutePrefix("api/schedule")]
    public class MaintenanceScheduleApiController : ApiController
    {
        /// <summary>
        /// サンプルサービス
        /// </summary>
        public IMaintenanceScheduleService MaintenanceScheduleService { get; set; }

        /// <summary>
        /// コンストラクタ
        /// </summary>
        public MaintenanceScheduleApiController()
        {
            MaintenanceScheduleService = ServiceManager.GetService<IMaintenanceScheduleService>("MaintenanceScheduleService");
        }

        /// <summary>
        /// ルックアップ情報取得
        /// </summary>
        /// <returns></returns>
        [Route("lookUp")]
        public LookUp GetLookUp()
        {
            MaintenanceScheduleInfo info = new MaintenanceScheduleInfo();
            Session session = SessionAccessor.GetSession();
            try
            {
                info = MaintenanceScheduleService.GetLookUp(session);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
                return null; ;
            }

            return info.LookUp;
        }

        /// <summary>
        /// メンテナンススケジュール取得
        /// </summary>
        /// <returns></returns>
        [Route("")]
        public MaintenanceScheduleInfo Get()
        {
            MaintenanceScheduleInfo info = new MaintenanceScheduleInfo();
            Session session = SessionAccessor.GetSession();
            try
            {
                info = MaintenanceScheduleService.GetMaintenanceScheduleInfo(session);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
                info = null;
            }

            return info;
        }

        /// <summary>
        /// ポイントNoでメンテナンススケジュールを取得
        /// </summary>
        /// <param name="pointNo"></param>
        /// <returns></returns>
        [Route("getByPointNo")]
        public MaintenanceScheduleInfo GetByPointNo(int pointNo)
        {
            MaintenanceScheduleInfo info = new MaintenanceScheduleInfo();
            Session session = SessionAccessor.GetSession();
            try
            {
                info = MaintenanceScheduleService.GetMaintenanceScheduleInfo(session, pointNo);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
                info = null;
            }

            return info;
        }

        /// <summary>
        /// メンテナンススケジュール編集・登録
        /// </summary>
        /// <returns></returns>
        [Route("save")]
        public RequestResult PostEditSchedules(ScheduleQueryParameter parameter)
        {
            MaintenanceScheduleInfo info = new MaintenanceScheduleInfo();
            Session session = SessionAccessor.GetSession();
            try
            {
                info = MaintenanceScheduleService.SetMaintenanceSchedule(session, parameter.saveSchedule);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
                info.RequestResult = GetRegisterErrorRequestResult(session.CultureInfo);
            }

            return info.RequestResult;
        }

        /// <summary>
        /// メンテナンススケジュール削除
        /// </summary>
        /// <param name="deleteSchedules"></param>
        /// <returns></returns>
        [Route("delete")]
        public bool PostDeleteSchedules(IEnumerable<MaintenanceSchedule> deleteSchedules)
        {
            bool result = false;
            Session session = SessionAccessor.GetSession();
            try
            {
                result = MaintenanceScheduleService.DeleteMaintenanceSchedules(session, deleteSchedules);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
            }

            return result;
        }

        /// <summary>
        /// データ登録エラーリクエスト結果を取得する
        /// </summary>
        /// <param name="cultureInfo">カルチャ情報</param>
        /// <param name="isRegister">データ登録かどうか</param>
        /// <returns>リクエスト結果</returns>
        private RequestResult GetRegisterErrorRequestResult(CultureInfo cultureInfo)
        {
            return new RequestResult
            {
                IsSuccess = false,
                Message = MessageUtil.GetMessage("MaintenanceSchedule_RegisterError", cultureInfo)
            };
        }

    }
}
