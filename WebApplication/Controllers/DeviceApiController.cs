using garmit.Core;
using garmit.Service.Datagate;
using garmit.DomainObject;
using garmit.Web.Accessor;
using garmit.Web.Filter;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using garmit.Web.Models;

namespace garmit.Web.Controllers
{
    [SessionExpireApiFilter]
    [RoutePrefix("api/device")]
    public class DeviceApiController : ApiController
    {
        /// <summary>
        /// データゲートサービス
        /// </summary>
        public IDatagateService DatagateService { get; set; }

        public DeviceApiController()
        {
            DatagateService = ServiceManager.GetService<IDatagateService>("DatagateService");
        }

        /// <summary>
        /// 機器情報を取得する
        /// </summary>
        /// <returns></returns>
        [Route("getDatagates")]
        public DatagateInfo GetDatagateList()
        {
            Session session = SessionAccessor.GetSession();
            DatagateInfo info = new DatagateInfo();

            try
            {
                info = DatagateService.GetDatagateInfo(session);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
            }

            return info;
        }

        /// <summary>
        /// 機器のステータスを取得する
        /// </summary>
        /// <param name="gateId"></param>
        /// <returns></returns>
        [Route("getGateStatus")]
        public GateStatus GetGateStatus(int gateId)
        {
            Session session = SessionAccessor.GetSession();
            DatagateInfo info = new DatagateInfo();

            try
            {
                info = DatagateService.GetGateStatus(session, gateId);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
            }

            return info.GateStatus;
        }

        /// <summary>
        /// DB一覧を取得する
        /// </summary>
        /// <returns></returns>
        [Route("getDatabases")]
        public IEnumerable<DbInfo> GetDatabases()
        {
            Session session = SessionAccessor.GetSession();
            DatagateInfo info = new DatagateInfo();

            try
            {
                info = DatagateService.GetDbInfo(session);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
            }

            return info.DbInfo;
        }

        /// <summary>
        /// 機器情報をDBに更新する
        /// </summary>
        /// <returns></returns>
        [Route("setDatagate")]
        public bool PostSetDatagate(Datagate datagate)
        {
            Session session = SessionAccessor.GetSession();
            bool ret = false;

            try
            {
                ret = DatagateService.SetDatagate(session, datagate);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
            }

            return ret;
        }

        /// <summary>
        /// 機器をリセットする
        /// </summary>
        /// <param name="gateId"></param>
        /// <returns></returns>
        [Route("resetDatagate")]
        public bool PostResetDatagate(GateStatus gateStatus)
        {
            Session session = SessionAccessor.GetSession();
            bool ret = false;

            try
            {
                gateStatus.ErrorReset = 1;  // リセットフラグを立てる
                ret = DatagateService.SetGateStatusErrorReset(session, gateStatus);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
            }

            return ret;
        }

        #region バッテリー用

        /// <summary>
        /// バッテリ監視用のLookUpを取得する
        /// </summary>
        /// <returns>ルックアップ</returns>
        [Route("getBatteryLookUp")]
        public LookUp GetLookUpForBattery()
        {
            Session session = SessionAccessor.GetSession();
            LookUp lookUp = new LookUp();

            try
            {
                lookUp = DatagateService.GetLookUpForBattery(session);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
                lookUp = null;
            }

            return lookUp;
        }

        /// <summary>
        /// バッテリ一覧を取得する
        /// </summary>
        /// <returns>バッテリ一覧</returns>
        [Route("getBattery")]
        public SearchResult GetDatagatesForBattery()
        {
            Session session = SessionAccessor.GetSession();
            DatagateInfo info = new DatagateInfo();

            try
            {
                info = DatagateService.GetDatagatesForBattery(session);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
                return null;
            }

            return info.DatagateResult;
        }

        /// <summary>
        /// 機器とその時点での計測値を一覧で取得する。CSV出力で使用。
        /// </summary>
        /// <param name="query">ゲートID</param>
        /// <returns></returns>
        [Route("datagateReport")]
        public SearchResult PostGetDatagateReport(DatagateQueryParameter query)
        {
            Session session = SessionAccessor.GetSession();
            DatagateInfo info = new DatagateInfo();

            try
            {
                info = DatagateService.GetDatagateReport(session, query.GateId);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
                return null;
            }

            return info.DatagateResult;
        }

        /// <summary>
        /// 指定したGateIdの計測値を取得する
        /// </summary>
        /// <param name="query"></param>
        /// <returns></returns>
        [Route("valueData")]
        public DatagateValueData PostGetDatagateValueData(DatagateQueryParameter query)
        {
            Session session = SessionAccessor.GetSession();
            DatagateInfo info = new DatagateInfo();
            int gateId = query.GateId ?? -99;

            try
            {
                info = DatagateService.GetDatagateValueData(session, gateId);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
                return null;
            }

            return info.DatagateValueData;
        }

        /// <summary>
        /// エラーステータスをセットする
        /// </summary>
        /// <param name="query"></param>
        /// <returns></returns>
        [Route("errorResetByGateId")]
        public bool SetGateStatusErrorReset(DatagateQueryParameter query)
        {
            Session session = SessionAccessor.GetSession();
            bool isSuccess = false;
            int gateId = query.GateId ?? -99;

            try
            {
                isSuccess = DatagateService.SetGateStatusErrorReset(session, gateId);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
            }

            return isSuccess;
        }
        
        #endregion


    }
    
}
