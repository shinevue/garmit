using garmit.Core;
using garmit.DomainObject;
using garmit.Service.Unit;
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
    [SessionExpireApiFilter]
    [RoutePrefix("api/unit")]
    public class UnitApiController : ApiController
    {
        /// <summary>
        /// ユニットサービス
        /// </summary>
        public IUnitService UnitService { get; set; }

        /// <summary>
        /// リクエストタイプ
        /// </summary>
        private enum RequestType
        {
            register = 1,
            dispsetting,
            delete
        }

        /// <summary>
        /// コンストラクタ
        /// </summary>
        public UnitApiController()
        {
            UnitService = ServiceManager.GetService<IUnitService>("UnitService");
        }

        /// <summary>
        /// 初期データ取得
        /// </summary>
        /// <returns>LookUpの入ったデータ</returns>
        [Route("")]
        public UnitInfo GetInitialInfo()
        {
            UnitInfo info = new UnitInfo();
            Session session = SessionAccessor.GetSession();

            try
            {
                info = UnitService.GetLookUp(session);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
                info = null;
            }

            return info;
        }

        /// <summary>
        /// ユニット表示設定グループを取得する
        /// </summary>
        /// <param name="dispSetId">表示設定ID</param>
        /// <returns>表示設定情報</returns>
        [Route("getUnit")]
        public UnitInfo GetUnitDispSetting(string dispSetId)
        {
            UnitInfo info = new UnitInfo();
            Session session = SessionAccessor.GetSession();

            try
            {
                info = UnitService.GetUnitDispSetting(session, dispSetId);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
                info = null;
            }

            return info;
        }

        /// <summary>
        /// ユニットのリストを取得する
        /// </summary>
        /// <param name="lookUp"></param>
        /// <returns></returns>
        [Route("getUnits")]
        public UnitInfo PostGetUnits(LookUp lookUp)
        {
            UnitInfo info = new UnitInfo();
            Session session = SessionAccessor.GetSession();

            try
            {
                info = UnitService.GetUnits(session, lookUp);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
                info = null;
            }

            return info;
        }

        /// <summary>
        /// ユニットを保存する
        /// </summary>
        /// <param name="unitSetQuery">ユニット保存時のパラメータ</param>
        /// <returns>成功/失敗、エラーメッセージ</returns>
        [Route("setUnit")]
        public RequestResult SetUnit(UnitSetQueryParameter unitSetQuery)
        {
            UnitInfo info = new UnitInfo();
            Session session = SessionAccessor.GetSession();

            try
            {
                info = UnitService.SetUnit(session, unitSetQuery.Unit, unitSetQuery.RackId);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
                info.RequestResult = GetErrorRequestResult(session.CultureInfo, RequestType.register);
            }

            return info.RequestResult;
        }

        /// <summary>
        /// 複数のユニットを更新する
        /// </summary>
        /// <param name="unitsSetQuery">ユニット保存時のパラメータ</param>
        /// <returns>成功/失敗、エラーメッセージ</returns>
        [Route("setUnits")]
        public RequestResult SetUnits(UnitsSetQueryParameter unitsSetQuery)
        {
            UnitInfo info = new UnitInfo();
            Session session = SessionAccessor.GetSession();

            try
            {
                info = UnitService.SetUnits(session, unitsSetQuery.DispSetId, unitsSetQuery.Units, unitsSetQuery.Rack);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
                info.RequestResult = GetErrorRequestResult(session.CultureInfo, RequestType.register);
            }

            return info.RequestResult;

        }

        /// <summary>
        /// 表示設定グループを保存する
        /// </summary>
        /// <param name="dispSetting">表示設定グループ</param>
        /// <returns></returns>
        [Route("setUnitDispSetting")]
        public RequestResult SetUnitDispSetting(UnitDispSetting dispSetting)
        {
            UnitInfo info = new UnitInfo();
            Session session = SessionAccessor.GetSession();

            try
            {
                info = UnitService.SetUnitDispSetting(session, dispSetting);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
                info.RequestResult = GetErrorRequestResult(session.CultureInfo, RequestType.dispsetting);
            }

            return info.RequestResult;
        }


        /// <summary>
        /// ユニットを削除する
        /// </summary>
        /// <param name="unit">ユニット情報</param>
        /// <returns>成功/失敗、エラーメッセージ</returns>
        [Route("deleteUnit")]
        public RequestResult PostDeleteUnit(Unit unit)
        {
            UnitInfo info = new UnitInfo();
            Session session = SessionAccessor.GetSession();

            try
            {
                info = UnitService.DeleteUnit(session, unit);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
                info.RequestResult = GetErrorRequestResult(session.CultureInfo, RequestType.delete);
            }

            return info.RequestResult;
        }

        /// <summary>
        /// エラーリクエスト結果を取得する
        /// </summary>
        /// <param name="cultureInfo">カルチャ情報</param>
        /// <param name="type">リクエストタイプ</param>
        /// <returns>リクエスト結果</returns>
        private UnitRequestResult GetErrorRequestResult(CultureInfo cultureInfo, RequestType type)
        {
            string messageId;
            switch (type)
            {
                case RequestType.dispsetting:
                    messageId = "Unit_DispSettingRegisterError";
                    break;
                case RequestType.delete:
                    messageId = "Unit_DeleteError";
                    break;
                default:
                    messageId = "Unit_RegisterError";
                    break;
            }

            return new UnitRequestResult
            {
                IsSuccess = false,
                Message = MessageUtil.GetMessage(messageId, cultureInfo)
            };
        }
        
    }
}
